import React from 'react'

/** Components */
type ComponentIdentifier = string

export type ComponentRegistry = Record<ComponentIdentifier, ComponentDefinition<any>>
export type ComponentDefinition<T extends Record<string, JSONValue>> = {
  component: React.ComponentType<T>
  validator?: (input?: T) => T
}

/** Data state */
export type DataState = ComponentDataState | ReferencedDataState | EventDataState
export type ComponentDataState = {
  $: 'component'
  key?: string
  component: ComponentIdentifier
  children?: JSONValue
  props?: Record<string, JSONValue>
}
export type ReferencedDataState = {
  $: 'ref'
  ref: string | [string, ...(string | number)[]]
}
type EventDataState = ActionEventDataState | AsyncHandlerEventDataState | HandlerEventDataState
export type EventHandler = (args: any) => any | Promise<any>
export type ActionEventDataState<T = any> = {
  $: 'event'
  action?: T
}
export type AsyncHandlerEventDataState = {
  $: 'event'
  key: string
  async: true
  // server-only
  handler?: EventHandler
}
export type HandlerEventDataState = {
  $: 'event'
  key: string
  async: false
  // server-only
  handler?: EventHandler
}
export function isHandlerEvent(
  event: TemplateEvent
): event is TemplateEvent<HandlerEventDataState | AsyncHandlerEventDataState> {
  return isHandlerEventDataState(event.dataState)
}
export function isActionEvent(event: TemplateEvent): event is TemplateEvent<ActionEventDataState> {
  return isEventDataState(event.dataState) && 'action' in event.dataState
}

type SafeObject = {
  [key: string]: JSONValue
  $?: never
}
export type JSONValue =
  | DataState
  | SafeObject
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONValue[]

export type TemplateEvent<T = EventDataState, K = any> = {
  target: {
    key?: string
    component: string
    propKey: string
    storeKey: string
  }
  dataState: T
  payload: K
}
export type ActionEvent<T = any, K = any> = TemplateEvent<ActionEventDataState<T>, K>

export function isCompositeDataState(obj: any): obj is ComponentDataState | ReferencedDataState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    '$' in obj &&
    (obj.$ === 'component' || obj.$ === 'ref')
  )
}
export function isComponentDataState(obj: JSONValue): obj is ComponentDataState {
  return obj !== null && typeof obj === 'object' && '$' in obj && obj.$ === 'component'
}
export function isEventDataState(obj: JSONValue): obj is EventDataState {
  return obj !== null && typeof obj === 'object' && '$' in obj && obj.$ === 'event'
}
export function isHandlerEventDataState(
  obj: JSONValue
): obj is HandlerEventDataState | AsyncHandlerEventDataState {
  return isEventDataState(obj) && 'key' in obj
}

export function BaseTemplate({
  storeKey = '',
  components,
  dataState,
  onEvent,
}: {
  storeKey?: string
  components: ComponentRegistry
  dataState: JSONValue
  onEvent?: (event: TemplateEvent) => Promise<any>
}) {
  function renderComponent(stateNode: ComponentDataState, path: string) {
    const componentDefinition = components[stateNode.component]
    if (!componentDefinition) {
      throw new RenderError(`Unknown component: ${stateNode.component}`)
    }

    // tbd: validate `components` prop once with `zod` instead of later render stage
    const Component = componentDefinition.component
    if (!Component) {
      throw new RenderError(`Invalid component: ${stateNode.component}`)
    }

    let componentProps = Object.fromEntries(
      Object.entries(stateNode.props || {}).map(([propKey, propValue]) => {
        return [propKey, renderProp(propKey, propValue, stateNode, path)]
      })
    )

    if (typeof componentDefinition.validator === 'function') {
      try {
        componentProps = componentDefinition.validator(componentProps)
      } catch (e) {
        throw new RenderError(
          `Invalid props for component: ${stateNode.component}, props: ${JSON.stringify(stateNode.props)}. Error: ${JSON.stringify(e)}`
        )
      }
    }

    const children = stateNode.children ? render(stateNode.children, `${path}.children`) : null

    return <Component key={path} data-testid={path} {...componentProps} children={children} />
  }

  function render(stateNode: JSONValue, path: string, index?: number): React.ReactNode {
    if (stateNode === null || typeof stateNode !== 'object') {
      return stateNode
    }
    if (Array.isArray(stateNode)) {
      return stateNode.map((item, index) => render(item, path, index))
    }
    if (!isCompositeDataState(stateNode)) {
      throw new Error('Objects are not valid as a React child.')
    }
    if (stateNode.$ === 'component') {
      const key = stateNode.key || index?.toString()
      return renderComponent(stateNode, key ? `${path}[${key}]` : path)
    }
    if (stateNode.$ === 'ref') {
      throw new Error('Your data includes refs. You must use a <Template /> component instead.')
    }
  }

  function renderProp(
    propKey: string,
    stateNode: JSONValue,
    parentNode: ComponentDataState,
    path: string
  ): any {
    if (isEventDataState(stateNode)) {
      return async (payload: any) => {
        // React events (e.g. from onPress) contain cyclic structures that can't be serialized
        // with JSON.stringify and also provide little to no value for the server.
        // tbd: figure a better way to handle this in a cross-platform way
        if (payload?.nativeEvent) {
          payload = '[native code]'
        }
        return onEvent?.({
          target: { key: parentNode.key, component: parentNode.component, propKey, storeKey },
          dataState: stateNode,
          payload,
        })
      }
    }
    if (Array.isArray(stateNode)) {
      return stateNode.map((item, index) =>
        renderProp(propKey, item, parentNode, `${path}.props[${propKey}][${index}]`)
      )
    }
    if (isCompositeDataState(stateNode)) {
      return render(stateNode, `${path}.props[${propKey}]`)
    }
    if (stateNode && typeof stateNode === 'object') {
      return Object.fromEntries(
        Object.entries(stateNode).map(([key, value]) => {
          return [
            key,
            renderProp(`${propKey}.${key}`, value, parentNode, `${path}.props[${propKey}][${key}]`),
          ]
        })
      )
    }
    return stateNode
  }

  return <ErrorBoundary>{render(dataState, 'root')}</ErrorBoundary>
}

/** Error boundary */
class RenderError extends Error {}
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  { error: RenderError | null }
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: RenderError) {
    return { error }
  }

  render() {
    if (this.state.error) {
      // tbd: render fallback ui
      return null
    }

    return this.props.children
  }
}
