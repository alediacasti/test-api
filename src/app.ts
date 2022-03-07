import express, {
  Express,
  Request,
  Response,
  NextFunction,
  Router
} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import { internalServerError, notFound } from './errors'
import { getRadarData } from './routes/public/radar'

export const app = (version = '/'): Express => {
  const app = express()

  // app settings
  app
    .set('json spaces', 2)
    .use(cors())
    .use(express.json())
    .use(cookieParser())
    .use((_, res, next) => {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8')
      next()
    })

  // global variables
  app.use((req: Request, res: Response, next: NextFunction) => {
    next()
  })

  /**
   * Public routes.
   */
  const publicRouter = Router()
  publicRouter.post('/radar', getRadarData)
  app.use(version, publicRouter)

  // error handling
  app.all('*', (req, res) => notFound(res, 'URL not found'))
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err)
    return internalServerError(res, err.message)
  })

  return app
}
