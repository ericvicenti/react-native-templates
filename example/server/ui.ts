import { ComponentDataState, DataState } from '@final-ui/react'

import { hslToHex } from './color'
import { getSequenceActiveItem } from './eg-main'
import { EGVideo } from './eg-video-playback'
import {
  ColorMedia,
  Effect,
  Effects,
  Layer,
  LayersMedia,
  MainState,
  Media,
  SequenceItem,
  SequenceMedia,
  Transition,
  TransitionState,
  VideoMedia,
} from './state-schema'

export type UIContext = {
  video: EGVideo
}

function icon(name: string): ComponentDataState {
  return {
    $: 'component',
    key: 'icon',
    component: 'RiseIcon',
    props: { icon: name },
  }
}

function section(title: string, children: DataState[], key?: string): DataState {
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

function scroll(children: any[]): ComponentDataState {
  return {
    $: 'component',
    component: 'ScrollView',
    props: {
      padding: '$4',
      gap: '$4',
    },
    children,
  }
}

function getVideoControls(mediaPath: string, state: VideoMedia, ctx: UIContext): DataState[] {
  const player = ctx.video.getPlayer(state.id)
  return [
    {
      $: 'component',
      key: 'selectVideo',
      component: 'RiseSelectField',
      props: {
        unselectedLabel: 'Select Video...',
        value: state.track,
        onValueChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'track'],
        },
        options: { $: 'ref', ref: ['videoList'] },
      },
    },
    {
      $: 'component',
      key: 'restart',
      component: 'Button',
      children: 'Restart Video',
      props: {
        onPress: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'restart'],
        },
      },
    },
    {
      $: 'component',
      key: 'loopBounce',
      component: 'RiseSwitchField',
      props: {
        value: state?.params?.loopBounce || false,
        label: 'Loop Bounce',
        onCheckedChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'loopBounce'],
        },
      },
    },
    {
      $: 'component',
      key: 'reverse',
      component: 'RiseSwitchField',
      props: {
        value: state?.params?.reverse || false,
        label: 'Reverse Playback',
        onCheckedChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'reverse'],
        },
      },
    },
    {
      $: 'component',
      key: 'infoFrameCount',
      component: 'Label',
      children: `Frame Count: ${player.getFrameCount()}`,
    },
    {
      $: 'component',
      key: 'infoDuration',
      component: 'Label',
      children: `Duration: ${(player.getFrameCount() || 0) / 30} sec`,
    },
    {
      $: 'component',
      key: 'effect',
      component: 'Button',
      children: 'Effects',
      props: {
        icon: icon('Sparkles'),
        onPress: {
          $: 'event',
          action: ['navigate', `${mediaPath}:effects`],
        },
      },
    },
    ...getGenericMediaUI(mediaPath, state, ctx),
  ]
}

function getColorControls(mediaPath: string, state: ColorMedia, ctx: UIContext): DataState[] {
  return [
    {
      $: 'component',
      key: 'ColorPreview',
      component: 'View',
      props: {
        height: 50,
        backgroundColor: hslToHex(state.h, state.s, state.l),
        borderRadius: '$3',
      },
    },
    {
      $: 'component',
      key: 'ColorHueSlider',
      component: 'RiseSliderField',
      props: {
        label: 'Hue',
        value: state.h,
        onValueChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'color', 'h'],
        },
        max: 360,
        min: 0,
        step: 1,
      },
    },
    {
      $: 'component',
      key: 'ColorSaturationSlider',
      component: 'RiseSliderField',
      props: {
        label: 'Saturation',
        value: state.s,
        onValueChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'color', 's'],
        },
        max: 1,
        min: 0,
        step: 0.01,
      },
    },
    {
      $: 'component',
      key: 'ColorLightnessSlider',
      component: 'RiseSliderField',
      props: {
        label: 'Lightness',
        value: state.l,
        onValueChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'color', 'l'],
        },
        max: 1,
        min: 0,
        step: 0.01,
      },
    },
    ...getGenericMediaUI(mediaPath, state, ctx),
  ]
}

export function getEffectsUI(mediaLinkPath: string, effectsState: Effects | undefined): DataState {
  return {
    $: 'component',
    component: 'RiseSortableList',
    props: {
      onReorder: {
        $: 'event',
        action: ['updateMedia', mediaLinkPath, 'effectOrder'],
      },
      footer: {
        $: 'component',
        key: 'addEffect',
        component: 'RiseSelectField',
        props: {
          unselectedLabel: 'Add Effect...',
          value: null,
          options: [
            { key: 'colorize', label: 'Colorize' },
            { key: 'desaturate', label: 'Desaturate' },
            { key: 'invert', label: 'Invert' },
            { key: 'hueShift', label: 'Hue Shift' },
            { key: 'brighten', label: 'Brighten' },
            { key: 'darken', label: 'Darken' },
            { key: 'rotate', label: 'Rotate' },
          ],
          onValueChange: {
            $: 'event',
            action: ['updateMedia', mediaLinkPath, 'addEffect'],
          },
        },
      },
      items: (effectsState || []).map((effect) => {
        return {
          key: effect.key,
          label: effect.type,
          onPress: {
            $: 'event',
            action: ['navigate', `${mediaLinkPath}:effects:${effect.key}`],
          },
        }
      }),
    },
  }
}

export function getEffectUI(effectPath: string[], effect: Effect) {
  const removeEffect: ComponentDataState = {
    $: 'component',
    key: 'removeEffect',
    component: 'Button',
    children: 'Remove Effect',
    props: {
      onPress: [
        {
          $: 'event',
          action: 'navigate-back',
        },
        {
          $: 'event',
          action: ['updateEffect', effectPath, 'remove'],
        },
      ],
    },
  }
  if (effect.type === 'desaturate') {
    return section('Desaturate', [
      {
        $: 'component',
        key: 'value',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'value'],
          },
          label: 'Value',
          value: effect.value,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      removeEffect,
    ])
  } else if (effect.type === 'hueShift') {
    return section('Hue Shift', [
      {
        $: 'component',
        key: 'value',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'value'],
          },
          label: 'Value',
          value: effect.value,
          max: 180,
          min: -180,
          step: 1,
        },
      },
      removeEffect,
    ])
  } else if (effect.type === 'colorize') {
    return section('Colorize', [
      {
        $: 'component',
        key: 'amount',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'amount'],
          },
          label: 'Amount',
          value: effect.amount,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      {
        $: 'component',
        key: 'ColorPreview',
        component: 'View',
        props: {
          height: 50,
          backgroundColor: hslToHex(effect.hue, effect.saturation, 0.5),
          borderRadius: '$3',
        },
      },
      {
        $: 'component',
        key: 'saturation',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'saturation'],
          },
          label: 'Saturation',
          value: effect.saturation,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      {
        $: 'component',
        key: 'hue',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'hue'],
          },
          label: 'Hue',
          value: effect.hue,
          max: 360,
          min: 0,
          step: 1,
        },
      },
      removeEffect,
    ])
  } else if (effect.type === 'rotate') {
    return section('Rotate', [
      {
        $: 'component',
        key: 'value',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'value'],
          },
          label: 'Value',
          value: effect.value,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      removeEffect,
    ])
  } else if (effect.type === 'darken') {
    return section('Darken', [
      {
        $: 'component',
        key: 'value',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'value'],
          },
          label: 'Value',
          value: effect.value,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      removeEffect,
    ])
  } else if (effect.type === 'brighten') {
    return section('Brighten', [
      {
        $: 'component',
        key: 'value',
        component: 'RiseSliderField',
        props: {
          onValueChange: {
            $: 'event',
            action: ['updateEffect', effectPath, 'value'],
          },
          label: 'Value',
          value: effect.value,
          max: 1,
          min: 0,
          step: 0.01,
        },
      },
      removeEffect,
    ])
  }
  return section(`Effect: ${effect.type}`, [removeEffect])
}
function getVideoTitle(state: VideoMedia, ctx: UIContext): string {
  if (state.track === null) return 'Video - Empty'
  const title = ctx.video.getTrackTitle(state.track)
  return title
}

export function getMediaTitle(state: Media, ctx: UIContext): string {
  if (state.label) return state.label
  if (state.type === 'color') return 'Color'
  if (state.type === 'sequence') return 'Sequence'
  if (state.type === 'layers') return 'Layers'
  if (state.type === 'video') return getVideoTitle(state, ctx)
  return 'Media'
}

const newMediaOptions = [
  { key: 'off', label: 'Off' },
  { key: 'color', label: 'Color' },
  { key: 'video', label: 'Video' },
  { key: 'layers', label: 'Layers' },
  { key: 'sequence', label: 'Sequence' },
]

export function getMediaControls(state: Media, mediaLinkPath: string, ctx: UIContext): DataState[] {
  if (state.type === 'off') {
    return [
      {
        $: 'component',
        key: 'MediaMode',
        component: 'RiseSelectField',
        props: {
          value: state.type,
          onValueChange: {
            $: 'event',
            action: ['updateMedia', mediaLinkPath, 'mode'],
          },
          options: newMediaOptions,
        },
      },
    ]
  }
  return [
    {
      $: 'component',
      key: 'MediaMode',
      component: 'XStack',
      children: [
        {
          $: 'component',
          key: 'link',
          component: 'Button',
          props: {
            f: 1,
            onPress: {
              $: 'event',
              action: ['navigate', mediaLinkPath],
            },
          },
          children: `Open ${getMediaTitle(state, ctx)}`,
        },
        {
          $: 'component',
          key: 'clear',
          component: 'Button',
          props: {
            chromeless: true,
            backgroundColor: '$transparent',
            onPress: {
              $: 'event',
              action: ['updateMedia', mediaLinkPath, 'clear'],
            },
          },
          children: {
            $: 'component',
            key: 'icon',
            component: 'RiseIcon',
            props: { icon: 'X' },
          },
        },
      ],
    },
  ]
}

export function getTransitionControls(transition: Transition, state: TransitionState): DataState[] {
  return [
    {
      $: 'component',
      key: 'manual',
      component: 'RiseSliderField',
      props: {
        label: 'Manual',
        value: state.manual || 0,
        onValueChange: {
          $: 'event',
          action: ['updateTransition', 'manual'],
        },
        max: 0.99,
        min: 0,
        step: 0.01,
      },
    },
    {
      $: 'component',
      key: 'transition',
      component: 'Button',
      children: 'Start Transition',
      props: {
        onPress: {
          $: 'event',
          action: ['updateTransition', 'startAuto'],
        },
      },
    },
    {
      $: 'component',
      key: 'duration',
      component: 'RiseSliderField',
      props: {
        label: `Duration ${Math.round(transition.duration / 100) / 10}sec`,
        value: transition.duration || 0,
        onValueChange: {
          $: 'event',
          action: ['updateTransition', 'duration'],
        },
        max: 10000,
        min: 0,
        step: 1,
      },
    },
  ]
}

export function getUIRoot(state: MainState, ctx: UIContext) {
  return scroll([
    section('Live', getMediaControls(state.liveMedia, 'liveMedia', ctx)),
    section('Ready', getMediaControls(state.readyMedia, 'readyMedia', ctx)),
    section('Library', [
      {
        $: 'component',
        component: 'Button',
        children: 'Library',
        props: {
          onPress: { $: 'event', action: ['navigate', 'library'] },
          icon: icon('LibraryBig'),
        },
      },
    ]),
    section('Transition', getTransitionControls(state.transition, state.transitionState)),
  ])
}

//  function getUIRootLegacy(state: MainState) {
//   return {
//     $: 'component',
//     component: 'ScrollView',
//     props: {
//       padding: '$4',
//       gap: '$4',
//     },
//     children: [
//       {
//         $: 'component',
//         key: '1',
//         component: 'Paragraph',
//         props: {
//           children: `Mode: ${state.mode}`,
//         },
//       },
//       {
//         $: 'component',
//         key: 'mode',
//         component: 'RiseSelectField',
//         props: {
//           value: state.mode,
//           onValueChange: {
//             $: 'event',
//           },
//           options: [
//             { key: 'off', label: 'Off' },
//             { key: 'white', label: 'White' },
//             { key: 'color', label: 'Color' },
//             { key: 'rainbow', label: 'Rainbow' },
//             { key: 'layers', label: 'Layers' },
//             { key: 'video', label: 'Video' },
//             // { key: 'simple', label: 'Simple' },
//             // { key: 'advanced', label: 'Advanced' },
//             // { key: 'beatmatch', label: 'Beatmatch' },
//           ],
//         },
//       },

//       {
//         $: 'component',
//         key: 'offButton',
//         component: 'Button',
//         children: 'All Off',
//         props: {
//           disabled: state.mode === 'off',
//           onPress: {
//             $: 'event',
//           },
//         },
//       },
//       ...getModeControls(state),
//       // {
//       //   $: 'component',
//       //   key: 'button',
//       //   component: 'Button',
//       //   children: {
//       //     $: 'component',
//       //     component: 'XStack',
//       //     key: 'XStack',
//       //     props: {
//       //       jc: 'space-between',
//       //       ai: 'center',
//       //       f: 1,
//       //     },
//       //     children: [
//       //       'Quick Effects',
//       //       { $: 'component', key: 'lol', component: 'RiseIcon', props: { icon: 'Sparkles' } },
//       //     ],
//       //   },
//       //   props: {
//       //     onPress: ['navigate', 'effects'],
//       //     // icon: { $: 'component', key: 'lol', component: 'RiseIcon', props: { icon: 'Check' } },
//       //   },
//       // },

//       {
//         $: 'component',
//         key: 'quickEffects',
//         component: 'Button',
//         children: 'Quick Effects',
//         props: {
//           onPress: {
//             $: 'event',
//             action: ['navigate', 'quickEffects'],
//           },
//           spaceFlex: 1,
//           iconAfter: {
//             $: 'component',
//             key: 'icon',
//             component: 'RiseIcon',
//             props: { icon: 'Sparkles' },
//           },
//         },
//       },
//       {
//         $: 'component',
//         key: 'beatEffects',
//         component: 'Button',
//         children: 'Beat Effects',
//         props: {
//           onPress: {
//             $: 'event',
//             action: ['navigate', 'beatEffects'],
//           },
//           spaceFlex: 1,
//           iconAfter: {
//             $: 'component',
//             key: 'icon',
//             component: 'RiseIcon',
//             props: { icon: 'HeartPulse' },
//           },
//         },
//       },
//     ],
//   }
// }

function getLayersControls(
  mediaPath: string,
  state: LayersMedia,
  ctx: UIContext,
  { header = [], footer = [] }: { header?: DataState[]; footer?: DataState[] } = {}
): DataState {
  return {
    $: 'component',
    component: 'RiseSortableList',
    props: {
      onReorder: {
        $: 'event',
        action: ['updateMedia', mediaPath, 'layerOrder'],
      },
      header: {
        $: 'component',
        component: 'YStack',
        children: header,
      },
      footer: {
        $: 'component',
        key: 'addLayer',
        component: 'YStack',
        children: [
          ...header,
          {
            key: 'addLayer',
            $: 'component',
            component: 'RiseSelectField',
            props: {
              value: null,
              onValueChange: {
                $: 'event',
                action: ['updateMedia', mediaPath, 'addLayer'],
              },
              options: newMediaOptions,
              unselectedLabel: 'Add Layer...',
            },
          },
          ...footer,
          ...getGenericMediaUI(mediaPath, state, ctx),
        ],
      },
      items: (state.layers || []).map((layer) => {
        return {
          key: layer.key,
          label: getMediaTitle(layer.media, ctx),
          onPress: {
            $: 'event',
            action: ['navigate', `${mediaPath}:layer:${layer.key}`],
          },
        }
      }),
    },
  }
}

function getSequenceControls(
  mediaPath: string,
  state: SequenceMedia,
  ctx: UIContext,
  footer: DataState[] = []
): DataState {
  const activeMedia = getSequenceActiveItem(state)
  return {
    $: 'component',
    component: 'RiseSortableList',
    props: {
      onReorder: { $: 'event', action: ['updateMedia', mediaPath, 'layerOrder'] },
      header: {
        $: 'component',
        key: 'header',
        component: 'YStack',
        children: [
          {
            key: 'goNext',
            $: 'component',
            component: 'Button',
            children: 'Go Next',
            props: {
              onPress: {
                $: 'event',
                action: ['updateMedia', mediaPath, 'goNext'],
              },
            },
          },
        ],
      },
      footer: {
        $: 'component',
        key: 'footer',
        component: 'YStack',
        children: [
          {
            key: 'addToSequence',
            $: 'component',
            component: 'RiseSelectField',
            props: {
              value: null,
              onValueChange: {
                $: 'event',
                action: ['updateMedia', mediaPath, 'addToSequence'],
              },
              options: newMediaOptions,
              unselectedLabel: 'Add to Sequence...',
            },
          },
          ...getGenericMediaUI(mediaPath, state, ctx),
          ...footer,
        ],
      },
      items: (state.sequence || []).map((item) => {
        return {
          key: item.key,
          label: `${getMediaTitle(item.media, ctx)}${item.key === activeMedia?.key ? ' (Active)' : ''}`,
          onPress: { $: 'event', action: ['navigate', `${mediaPath}:item:${item.key}`] },
        }
      }),
    },
  }
}

export function getMediaLayerUI(mediaPath: string, layer: Layer, context: UIContext): DataState {
  return getMediaUI(mediaPath, layer.media, context, {
    header: [],
    footer: [
      section('Layer Controls', [
        {
          $: 'component',
          key: 'blendMode',
          component: 'RiseSelectField',
          props: {
            value: layer.blendMode,
            label: 'Blend Mode',
            onValueChange: {
              $: 'event',
              action: ['updateMedia', mediaPath, 'blendMode'],
            },
            options: [
              { key: 'mix', label: 'Blend' },
              { key: 'add', label: 'Add' },
              { key: 'mask', label: 'Mask' },
            ],
          },
        },
        {
          $: 'component',
          key: 'blendAmount',
          component: 'RiseSliderField',
          props: {
            onValueChange: {
              $: 'event',
              action: ['updateMedia', mediaPath, 'blendAmount'],
            },
            label: 'Blend Amount',
            value: layer.blendAmount,
            max: 1,
            min: 0,
            step: 0.01,
          },
        },
        {
          $: 'component',
          key: 'removeLayer',
          component: 'Button',
          children: 'Remove Layer',
          props: {
            onPress: [
              {
                $: 'event',
                action: ['updateMedia', mediaPath, 'removeLayer', layer.key],
              },
              {
                $: 'event',
                action: 'navigate-back',
              },
            ],
          },
        },
      ]),
    ],
  })
}

export function getLibraryUI(keys: string[]): ComponentDataState[] {
  return [
    { $: 'component', component: 'Screen', props: { title: 'Media Library' } },
    scroll(
      keys.map((key) => ({
        $: 'component',
        component: 'Button',
        children: key,
        props: {
          onPress: [
            { $: 'event', action: 'navigate-back' },
            { $: 'event', action: ['libraryAction', key, 'goReady'] },
          ],
          onLongPress: { $: 'event', action: ['navigate', `library/${key}`] },
        },
      }))
    ),
  ]
}

export function getLibraryKeyUI(key: string): ComponentDataState[] {
  return [
    { $: 'component', component: 'Screen', props: { title: key } },
    {
      $: 'component',
      component: 'Button',
      children: 'Go Ready',
      props: {
        icon: icon('Upload'),
        onPress: {
          $: 'event',
          action: ['libraryAction', key, 'goReady'],
        },
      },
    },
    {
      $: 'component',
      component: 'Button',
      children: 'Delete',
      props: {
        theme: 'red',
        icon: icon('Trash'),
        onPress: [
          { $: 'event', action: 'navigate-back' },
          { $: 'event', action: ['libraryAction', key, 'delete'] },
        ],
      },
    },
  ]
}

function getGenericMediaUI(mediaPath: string, media: Media, ctx: UIContext): ComponentDataState[] {
  return [
    { $: 'component', component: 'Screen', props: { title: getMediaTitle(media, ctx) } },
    {
      $: 'component',
      component: 'Button',
      children: 'Save Media to Library',
      props: {
        icon: icon('LibraryBig'),
        onPress: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'saveMedia'],
        },
      },
    },
    {
      $: 'component',
      component: 'RiseForm',
      props: {
        onSubmit: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'metadata'],
        },
      },
      children: [
        {
          $: 'component',
          component: 'RiseTextField',
          props: {
            name: 'label',
            label: {
              $: 'component',
              component: 'Label',
              children: 'Media Label',
              props: {
                htmlFor: 'label',
              },
            },
            value: media.label,
            placeholder: 'Enter label...',
            autoCapitalize: 'none',
            autoCorrect: false,
          },
        },
        {
          $: 'component',
          component: 'RiseSubmitButton',
          children: 'Submit',
        },
      ],
    },
  ]
}

function getSequenceItemMaxDuration(mediaPath: string, item: SequenceItem): DataState[] {
  const checkField: DataState = {
    $: 'component',
    key: 'maxDurationSwitch',
    component: 'RiseSwitchField',
    props: {
      label: 'Max Duration',
      value: !!item.maxDuration,
      onCheckedChange: {
        $: 'event',
        action: ['updateMedia', mediaPath, 'maxDuration'],
      },
    },
  }
  if (item.maxDuration == null || item.maxDuration == false) return [checkField]
  return [
    checkField,
    {
      $: 'component',
      key: 'maxDurationSlider',
      component: 'RiseSliderField',
      props: {
        label: `Max Duration - ${item.maxDuration}sec`,
        value: item.maxDuration,
        onValueChange: {
          $: 'event',
          action: ['updateMedia', mediaPath, 'maxDuration'],
        },
        max: 60,
        min: 0.1,
        step: 0.1,
      },
    },
  ]
}

export function getMediaSequenceUI(
  mediaPath: string,
  item: SequenceItem,
  context: UIContext
): DataState {
  let videoEnd: DataState[] = []
  if (item.media.type === 'video') {
    videoEnd = [
      {
        $: 'component',
        key: 'videoEnd',
        component: 'RiseSwitchField',
        props: {
          value: item.goOnVideoEnd || false,
          label: 'Go Next on Video End',
          onCheckedChange: {
            $: 'event',
            action: ['updateMedia', mediaPath, 'goOnVideoEnd'],
          },
        },
      },
    ]
  }
  return getMediaUI(mediaPath, item.media, context, {
    header: [
      section('Sequence Item Controls', [
        ...getSequenceItemMaxDuration(mediaPath, item),
        ...videoEnd,
        {
          $: 'component',
          key: 'removeItem',
          component: 'Button',
          children: 'Remove Item',
          props: {
            onPress: [
              {
                $: 'event',
                action: ['updateMedia', mediaPath, 'removeItem', item.key],
              },
              {
                $: 'event',
                action: 'navigate-back',
              },
            ],
          },
        },
      ]),
    ],
  })
}

export function getMediaUI(
  mediaPath: string,
  mediaState: Media,
  ctx: UIContext,
  { header = [], footer = [] }: { header?: DataState[]; footer?: DataState[] } = {}
): DataState {
  if (mediaState.type === 'color') {
    return scroll([...header, ...getColorControls(mediaPath, mediaState, ctx), ...footer])
  }
  if (mediaState.type === 'video') {
    return scroll([...header, ...getVideoControls(mediaPath, mediaState, ctx), ...footer])
  }
  if (mediaState.type === 'sequence') {
    return getSequenceControls(mediaPath, mediaState, ctx)
  }
  if (mediaState.type === 'layers') {
    return getLayersControls(mediaPath, mediaState, ctx, { header, footer })
  }
  return scroll([
    ...header,
    {
      $: 'component',
      component: 'Text',
      children: mediaState.type,
    },
    ...footer,
  ])
}

// export function getQuickEffects() {
//   return {
//     $: 'component',
//     component: 'YStack',
//     props: {
//       padding: '$4',
//       gap: '$4',
//     },
//     children: [
//       { $: 'component', key: 'flash', component: 'Button', children: 'Flash' },
//       { $: 'component', key: 'waveIn', component: 'Button', children: 'WaveIn' },
//       { $: 'component', key: 'waveOut', component: 'Button', children: 'WaveOut' },
//     ],
//   }
// }

// export function getBeatEffects(mainState: MainState) {
//   return {
//     $: 'component',
//     component: 'YStack',
//     props: {
//       gap: '$4',
//     },
//     children: [
//       section(
//         'Beat Effect',
//         [
//           {
//             $: 'component',
//             key: 'intensitySlider',
//             component: 'RiseSliderField',
//             props: {
//               label: 'Intensity',
//               value: { $: 'ref', ref: ['mainState', 'beatEffect', 'intensity'] },
//               max: 100,
//               min: 0,
//               step: 1,
//               onValueChange: {
//                 $: 'event',
//               },
//             },
//           },
//           {
//             $: 'component',
//             key: 'waveLengthSlider',
//             component: 'RiseSliderField',
//             props: {
//               label: 'Wave Length %',
//               value: { $: 'ref', ref: ['mainState', 'beatEffect', 'waveLength'] },
//               max: 1,
//               min: 0,
//               step: 0.01,
//               onValueChange: {
//                 $: 'event',
//               },
//             },
//           },
//           {
//             $: 'component',
//             key: 'dropoffSlider',
//             component: 'RiseSliderField',
//             props: {
//               label: 'DropOff %',
//               value: { $: 'ref', ref: ['mainState', 'beatEffect', 'dropoff'] },
//               max: 1,
//               min: 0,
//               step: 0.01,
//               onValueChange: {
//                 $: 'event',
//               },
//             },
//           },
//           {
//             $: 'component',
//             key: 'effectSelect',
//             component: 'RiseSelectField',
//             props: {
//               value: mainState.beatEffect.effect,
//               options: [
//                 { key: 'flash', label: 'flash' },
//                 { key: 'waveIn', label: 'waveIn' },
//                 { key: 'waveOut', label: 'waveOut' },
//               ],
//               onValueChange: {
//                 $: 'event',
//               },
//             },
//           },
//         ],
//         'effect'
//       ),
//       section(
//         'Manual Beat Pace',
//         [
//           {
//             $: 'component',
//             key: 'manualBeatEnabledSwitch',
//             component: 'RiseSwitchField',
//             props: {
//               label: 'Enabled',
//               value: { $: 'ref', ref: ['mainState', 'manualBeat', 'enabled'] },
//               onCheckedChange: {
//                 $: 'event',
//               },
//             },
//           },
//           {
//             $: 'component',
//             key: 'tapBeat',
//             component: 'Button',
//             children: 'Tap Beat',
//             props: {
//               onPress: null,
//               onPressOut: null,
//               onPressIn: {
//                 $: 'event',
//                 action: 'manualTapBeat',
//               },
//               spaceFlex: 1,
//               iconAfter: icon('Activity'),
//             },
//           },
//         ],
//         'manualBeat'
//       ),
//       section('Denon Stagelinq', [
//         { $: 'ref', ref: ['stagelinqConnection'] },
//         // simpleLabel('Coming Soon')
//       ]),

//       // { $: 'component', key: 'waveIn', component: 'Button', children: 'WaveIn' },
//       // { $: 'component', key: 'waveOut', component: 'Button', children: 'WaveOut' },
//     ],
//   }
// }
