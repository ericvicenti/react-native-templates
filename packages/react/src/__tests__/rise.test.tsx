import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'

import { action, event } from '../events'
import { BaseRise, ComponentDefinition, ComponentRegistry, RiseEvent } from '../rise'

export const BUILT_IN_COMPONENTS: ComponentRegistry = {
  View: {
    component: (props) => <div {...props} />,
  },
}

it('should render a component', () => {
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={{
        $: 'component',
        component: 'View',
        props: {
          height: 50,
        },
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div
        height="50"
      />
    </DocumentFragment>
  `)
})

it('should render an array of components', () => {
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={[
        {
          $: 'component',
          key: 'HeadingComponent',
          component: 'View',
          children: 'Heading',
        },
        {
          $: 'component',
          key: 'HelloWorldComponent',
          component: 'View',
          children: 'Hello, world!',
        },
      ]}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div>
        Heading
      </div>
      <div>
        Hello, world!
      </div>
    </DocumentFragment>
  `)
})

it('should use component key when provided', () => {
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={{
        $: 'component',
        component: 'View',
        children: {
          $: 'component',
          component: 'View',
          key: 'customKey',
          children: [
            {
              $: 'component',
              key: 'HelloComponent',
              component: 'View',
              children: 'Hello',
            },
            {
              $: 'component',
              component: 'View',
              key: 'WorldComponent',
              children: 'World!',
            },
          ],
        },
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div>
        <div>
          <div>
            Hello
          </div>
          <div>
            World!
          </div>
        </div>
      </div>
    </DocumentFragment>
  `)
})

it('should render a component with single children', () => {
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={{
        $: 'component',
        component: 'View',
        children: {
          $: 'component',
          component: 'View',
          children: 'Hello, world!',
        },
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div>
        <div>
          Hello, world!
        </div>
      </div>
    </DocumentFragment>
  `)
})

it('should render a component with children of different types', () => {
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={{
        $: 'component',
        component: 'View',
        children: [
          'Hello',
          {
            $: 'component',
            key: 'MyComponent',
            component: 'View',
            children: 'world!',
          },
        ],
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div>
        Hello
        <div>
          world!
        </div>
      </div>
    </DocumentFragment>
  `)
})

it('should accept component as a prop', () => {
  const Header: ComponentDefinition<{ header: string; paragraph: string }> = {
    component: (props) => (
      <section>
        <header>{props.header}</header>
        <footer>{props.paragraph}</footer>
      </section>
    ),
  }

  const component = render(
    <BaseRise
      components={{
        ...BUILT_IN_COMPONENTS,
        Header,
      }}
      model={{
        $: 'component',
        component: 'Header',
        props: {
          header: {
            $: 'component',
            component: 'View',
            children: 'Header text',
          },
          paragraph: {
            $: 'component',
            component: 'View',
            children: 'Footer text',
          },
        },
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <section>
        <header>
          <div>
            Header text
          </div>
        </header>
        <footer>
          <div>
            Footer text
          </div>
        </footer>
      </section>
    </DocumentFragment>
  `)
})

it('should accept object as a prop', () => {
  const Header: ComponentDefinition<{ user: { name: string } }> = {
    component: ({ user, ...props }) => (
      <section {...props}>
        <header>{user.name}</header>
      </section>
    ),
  }

  const component = render(
    <BaseRise
      components={{
        Header,
      }}
      model={{
        $: 'component',
        component: 'Header',
        props: {
          user: {
            name: 'Mike',
          },
        },
      }}
      onEvent={jest.fn()}
    />
  )

  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <section>
        <header>
          Mike
        </header>
      </section>
    </DocumentFragment>
  `)
})

it('should accept event handler as a prop', () => {
  const onEvent = jest.fn()
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      model={{
        $: 'component',
        key: 'button',
        component: 'View',
        props: {
          ['data-testid']: 'button',
          onClick: action('foo-action'),
        },
      }}
      onEvent={onEvent}
    />
  )

  fireEvent.click(component.getByTestId('button'))

  expect(onEvent).toHaveBeenCalledTimes(1)

  const firedEvent = onEvent.mock.lastCall[0] as RiseEvent
  expect(firedEvent).toMatchInlineSnapshot(`
    Object {
      "dataState": Array [
        Object {
          "$": "action",
          "name": "foo-action",
        },
      ],
      "payload": Array [
        "[native code]",
      ],
      "target": Object {
        "component": "View",
        "key": "button",
        "path": Array [
          "",
          "props",
          "onClick",
        ],
        "propKey": "onClick",
      },
    }
  `)
})

it('should validate props with a validator', () => {
  const validator = jest.fn().mockImplementation((args) => args)
  const props = {
    foo: 'foo',
    bar: 'bar',
  }

  render(
    <BaseRise
      components={{
        View: {
          component: () => <div />,
          validator,
        },
      }}
      path={['mainState']}
      model={{
        $: 'component',
        key: 'button',
        component: 'View',
        props,
      }}
      onEvent={jest.fn()}
    />
  )

  expect(validator).toHaveBeenCalledWith(props)
})

it('should pass return type from onEvent back to component', async () => {
  const onEvent = jest.fn().mockReturnValue('Mike')

  const component = render(
    <BaseRise
      components={{
        Profile: {
          component: ({ onClick }) => {
            const [name, setName] = useState()
            if (!name) {
              return (
                <div
                  data-testid="button"
                  onClick={async () => {
                    const name = await onClick()
                    setName(name)
                  }}
                >
                  Click to load!
                </div>
              )
            }
            return <div>{name}</div>
          },
        },
      }}
      path={['mainState']}
      model={{
        $: 'component',
        key: 'button',
        component: 'Profile',
        props: {
          onClick: action('go-back'),
        },
      }}
      onEvent={onEvent}
    />
  )
  await act(async () => {
    fireEvent.click(component.getByTestId('button'))
  })
  expect(component.asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <div>
        Mike
      </div>
    </DocumentFragment>
  `)
})

it('should fire multiple template events for an array of actions', () => {
  const onEvent = jest.fn()
  const component = render(
    <BaseRise
      components={BUILT_IN_COMPONENTS}
      path={['mainState']}
      model={{
        $: 'component',
        key: 'button',
        component: 'View',
        props: {
          ['data-testid']: 'button',
          onClick: [action('go-back'), action('go-back-again')],
        },
      }}
      onEvent={onEvent}
    />
  )
  fireEvent.click(component.getByTestId('button'))

  expect(onEvent.mock.calls[0][0].dataState).toMatchInlineSnapshot(`
    Array [
      Object {
        "$": "action",
        "name": "go-back",
      },
      Object {
        "$": "action",
        "name": "go-back-again",
      },
    ]
  `)
})

it('should throw error for arrays containing mixed types (only action arrays allowed)', () => {
  expect(() => {
    render(
      <BaseRise
        components={BUILT_IN_COMPONENTS}
        model={{
          $: 'component',
          key: 'button',
          component: 'View',
          props: {
            onClick: [action('go-back'), action('go-back-again'), event(() => 'foo')],
          },
        }}
      />
    )
  }).toThrowError()
})
