import { app } from './src/app'

const API_PORT = process.env.API_PORT!
const API_VERSION = process.env.API_VERSION!

app(API_VERSION).listen(API_PORT, () =>
  console.log(`Listening on port ${API_PORT}`)
)
