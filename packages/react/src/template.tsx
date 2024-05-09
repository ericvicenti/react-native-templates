import React from 'react'

import { ServerResponse } from './response'

/** Components */
type ComponentIdentifier = string

export type ComponentRegistry = Record<ComponentIdentifier, ComponentDefinition<any>>
export type ComponentDefinition<T extends Record<string, JSONValue>> = {
  component: React.ComponentType<T>
  validator?: (input?: T) => T
}

/** Data state */
export type DataState =
  | JSONValue
  | ReferencedComponentDataState
  | ComponentDataState
  | ReferencedDataState
  | ActionDataState
  | EventDataState
  | DataState[]
export type ComponentDataState = {
  $: 'component'
  key?: string
  component: ComponentIdentifier
  children?: DataState
  props?: Record<string, DataState>
}
type ReferencedComponentDataState = ComponentDataState & {
  path: Path
}
export type Path = string | [string, ...(string | number)[]]
export type ReferencedDataState = {
  $: 'ref'
  ref: Path
}
export type ActionDataState<T = any> = {
  $: 'action'
  action: T
}
export type EventDataState = {
  $: 'event'
  key: string
  async: boolean
  timeout?: number
}
export type JSONValue =
  | { [key: string]: JSONValue; $?: never }
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONValue[]

export type TemplateEvent<K = any> = {
  target: {
    key?: string
    component: string
    propKey: string
    path: Path
  }
  dataState: EventDataState
  payload: K
}

export function isCompositeDataState(obj: any): obj is ComponentDataState | ReferencedDataState {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    '$' in obj &&
    (obj.$ === 'component' || obj.$ === 'ref')
  )
}
export function isComponentDataState(obj: DataState): obj is ComponentDataState {
  return obj !== null && typeof obj === 'object' && '$' in obj && obj.$ === 'component'
}
export function isReferencedComponentDataState(
  obj: DataState
): obj is ReferencedComponentDataState {
  return isComponentDataState(obj) && 'path' in obj
}
export function isEventDataState(obj: DataState): obj is EventDataState {
  return obj !== null && typeof obj === 'object' && '$' in obj && obj.$ === 'event'
}
export function isActionDataState(obj: DataState): obj is ActionDataState {
  return obj !== null && typeof obj === 'object' && '$' in obj && obj.$ === 'action'
}

export function BaseTemplate({
  path = '',
  components,
  dataState,
  onAction,
  onEvent,
}: {
  path?: Path
  components: ComponentRegistry
  dataState: DataState
  onEvent?: (event: TemplateEvent) => Promise<ServerResponse>
  onAction?: (action: ActionDataState['action']) => void
}) {
  function renderComponent(stateNode: ComponentDataState, path: Path) {
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

    const children = stateNode.children ? render(stateNode.children, path) : null

    return <Component key={stateNode.key} {...componentProps} children={children} />
  }

  function render(stateNode: DataState, path: Path): React.ReactNode {
    if (stateNode === null || typeof stateNode !== 'object') {
      return stateNode
    }
    if (Array.isArray(stateNode)) {
      return stateNode.map((item) => render(item, path))
    }
    if (!isCompositeDataState(stateNode)) {
      throw new Error('Objects are not valid as a React child.')
    }
    if (stateNode.$ === 'component') {
      return renderComponent(
        stateNode,
        isReferencedComponentDataState(stateNode) ? stateNode.path : path
      )
    }
    if (stateNode.$ === 'ref') {
      throw new Error('Your data includes refs. You must use a <Template /> component instead.')
    }
  }

  function renderProp(
    propKey: string,
    propValue: DataState,
    parentNode: ComponentDataState | ReferencedComponentDataState,
    path: Path
  ): any {
    if (isEventDataState(propValue)) {
      return async (payload: any) => {
        // React events (e.g. from onPress) contain cyclic structures that can't be serialized
        // with JSON.stringify and also provide little to no value for the server.
        // tbd: figure a better way to handle this in a cross-platform way
        if (payload?.nativeEvent) {
          payload = '[native code]'
        }
        return onEvent?.({
          target: {
            key: parentNode.key,
            component: parentNode.component,
            propKey,
            path,
          },
          dataState: propValue,
          payload,
        })
      }
    }
    if (isActionDataState(propValue)) {
      return () => {
        return onAction?.(propValue.action)
      }
    }
    if (Array.isArray(propValue)) {
      return propValue.map((item) => renderProp(propKey, item, parentNode, path))
    }
    if (isCompositeDataState(propValue)) {
      return render(propValue, path)
    }
    if (propValue && typeof propValue === 'object') {
      return Object.fromEntries(
        Object.entries(propValue).map(([key, value]) => {
          return [key, renderProp(key, value, parentNode, path)]
        })
      )
    }
    return propValue
  }

  return <>{render(dataState, path)}</>
}

export class RenderError extends Error {}
