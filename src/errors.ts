import { Response } from 'express'

enum Status {
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500
}

export const badRequest = (
  res: Response,
  reason?: any,
  error = 'bad_request'
) => {
  return res.status(Status.BadRequest).send({ error, reason })
}

export const notFound = (res: Response, reason?: any) => {
  return res.status(Status.NotFound).send({ error: 'not_found', reason })
}

export const internalServerError = (res: Response, reason?: any) => {
  return res
    .status(Status.InternalServerError)
    .send({ error: 'internal_server_error', reason })
}
