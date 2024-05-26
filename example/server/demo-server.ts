import { DataState } from '@final-ui/react'
import { createServer } from '@final-ui/server'

const server = createServer({}, 3888)

const startTime = Date.now()

server.update('startTime', startTime)

function updateUI() {
  //   server.update('mainState', mainState)
  server.updateRoot({
    $: 'component',
    component: 'ScrollView',
    props: {
      backgroundColor: '$color3',
      gap: '$4',
    },
    children: [
      {
        $: 'component',
        component: 'YStack',
        props: { gap: '$4', margin: '$4' },
        children: [
          {
            $: 'component',
            component: 'Button',
            children: 'Demo Robot',
            props: {
              icon: {
                $: 'component',
                component: 'RiseIcon',
                props: {
                  icon: 'Bot',
                },
              },
              onPress: [
                {
                  $: 'event',
                  action: 'navigate',
                },
                {
                  $: 'event',
                  action: 'demoRobot',
                },
              ],
            },
          },
          {
            $: 'component',
            component: 'Button',
            children: 'Hello',
            props: {
              onPress: [
                {
                  $: 'event',
                  action: 'navigate',
                },
                {
                  $: 'event',
                  action: 'demoRobot',
                },
              ],
            },
          },
        ],
      },
    ],
  })
  server.update('demoRobot', {
    $: 'component',
    component: 'ScrollView',
    children: [
      {
        $: 'component',
        component: 'Screen',
        props: {
          title: 'Home Bot',
        },
      },
      section('Robotbot', [
        {
          $: 'component',
          component: 'RiseSliderField',
          key: 'x',
          props: {
            label: 'Foo',
            value: 12,
            min: 0,
            max: 100,
          },
        },
      ]),
      // petMode
      // task: clean floors
    ],
    props: {},
  })

  server.update('demoHomeAutomation', {
    // lighting scene
    // background video
    // playlist
    // security mode
  })

  server.update('demoInstallation', {
    // view: impress
    // colorTheme
    // soundResponse
  })
}
updateUI()

function section(title: string, children: any, key?: string): DataState {
  return {
    $: 'component',
    component: 'YStack',
    key: key || title,
    props: {
      padding: '$4',
      gap: '$2',
    },
    children: [
      {
        $: 'component',
        key: 'title',
        component: 'Label',
        children: title,
        props: {
          fontSize: '$2',
          fontWeight: 'bold',
          color: '$color10',
        },
      },
      ...children,
    ],
  }
}
