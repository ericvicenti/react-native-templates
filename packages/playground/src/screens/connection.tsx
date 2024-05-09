import { RiseComponents } from '@final-ui/kit'
import { Template } from '@final-ui/react'
import { TamaguiComponents } from '@final-ui/tamagui'
import { Stack } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { createParam } from 'solito'
import { useRouter } from 'solito/router'

import { DataBoundary } from '../data-boundary'
import { useDataSource } from '../data-sources'
import { Connection, useConnection } from '../provider/storage'
import { NotFoundScreen } from './not-found'

export function Screen(props: { title: string }) {
  return <Stack.Screen options={{ title: props.title }} />
}

const components = {
  ...TamaguiComponents,
  ...RiseComponents,
  Screen: {
    component: Screen,
    validate: (props: any) => props,
  },
}

const { useParam, useParams } = createParam<{ id: string; path: string }>()

export function ConnectionScreen() {
  const [id] = useParam('id')
  // const router = useRouter()
  const [connection] = useConnection(id)
  if (!connection) return <NotFoundScreen />
  return <ActiveConnectionScreen connection={connection} />
  // return <SizableText>Hellow</SizableText>
}
function ActiveConnectionScreen({ connection }: { connection: Connection }) {
  const router = useRouter()
  const { params } = useParams()
  const [path] = useParam('path')

  const dataSource = useDataSource(connection.id, connection.host)
  if (!dataSource) {
    return null
  }

  useEffect(() => {
    if (path === undefined) {
      router.back()
    }
  }, [path])

  const onAction = useCallback(
    (action: string | string[]) => {
      const [operation, path] = Array.isArray(action) ? action : [action, '']
      if (operation === 'navigate') {
        router.push(`/connection/${params.id}?path=${path}`)
        return true
      }
      if (operation === 'navigate-back') {
        router.back()
        return true
      }
    },
    [router]
  )

  return (
    <DataBoundary dataSource={dataSource} path={path!}>
      <Template components={components} dataSource={dataSource} path={path!} onAction={onAction} />
    </DataBoundary>
  )
}
