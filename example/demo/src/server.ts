import { createServer } from '@final-ui/server'

import { getInventoryExample } from './inventory/ui'
import { UIContext } from './types'

const models = {}
const server = createServer(models, 3999).then(() => {
  console.log('Server Started.')
})

// const ctx: UIContext = {
//   update: (key, updater) => {
//     server.update(key, updater(server.get(key)))
//   },
// }

// for (const [key, value] of Object.entries(getInventoryExample(ctx))) {
//   server.update(key, value)
// }
