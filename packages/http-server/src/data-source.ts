import type { EventPayload, EventResponse } from '@final-ui/http-client'
import {
  isReactElement,
  isResponseDataState,
  isServerEventDataState,
  lookupValue,
  response,
  ServerDataState,
  UI,
} from '@final-ui/react'

type Initializer = ServerDataState | UI | (() => Promise<ServerDataState | UI>)

export function createHTTPDataSource() {
  const values = new Map<string, Initializer>()

  function update(path: string, value: Initializer) {
    values.set(path, value)
  }

  async function get(path: string) {
    let value = values.get(path)
    if (typeof value === 'function') {
      value = await value()
    }
    if (isReactElement(value)) {
      throw new Error(
        'Rise JSX not configured. You must set "jsx" to "react-jsx" and "jsxImportSource" to "@final-ui/react" in your tsconfig.json.'
      )
    }
    return value
  }

  async function handleRequest(request: Request) {
    const url = new URL(request.url)
    switch (request.method) {
      case 'GET': {
        const { pathname: path } = url
        return new Response(JSON.stringify(await get(path.startsWith('/') ? path.slice(1) : path)))
      }
      case 'POST': {
        const message = (await request.json()) as EventPayload

        const {
          payload,
          target: { path },
        } = message.event

        try {
          const [storeName, ...lookupPath] = path
          const store = await get(storeName)
          const value = lookupValue(store, lookupPath)
          if (!isServerEventDataState(value)) {
            throw new Error(
              `Missing event handler on the server for event: ${JSON.stringify(message.event)}`
            )
          }
          let res = await value.handler(payload)
          if (!isResponseDataState(res)) {
            res = response(res ?? null)
          }
          return new Response(
            JSON.stringify({
              $: 'evt-res',
              res,
            } satisfies EventResponse),
            {
              status: 200,
            }
          )
        } catch (error: any) {
          console.error(error)
          return new Response(
            JSON.stringify({
              $: 'evt-res',
              res: response(error),
            } satisfies EventResponse),
            {
              status: 500,
            }
          )
        }
      }
      default:
        throw new Error('Unsupported method.')
    }
  }

  return { update, handleRequest }
}