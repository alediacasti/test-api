import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { badRequest } from '../errors'

export default (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors =  validationResult(req)

  if (!errors.isEmpty()) {
    return badRequest(
      res,
      errors.array().map(error => ({ message: error.msg, field: error.param }))
    )
  }

  next()
}
