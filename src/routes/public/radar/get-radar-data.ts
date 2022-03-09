import { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validateRequest from '../../../middlewares/validate-request'
import { getDistance } from '../../../libs/utils'
import { badRequest } from '../../../errors'

export default [
  // TODO: finish request validation
  body(['protocols', 'scan']).isArray().withMessage('Must be an array'),
  body('scan.*.coordinates')
    .isObject()
    .withMessage('Must be a non-empty object'),
  body('scan.*.coordinates.x').isInt().withMessage('Must be a number'),
  body('scan.*.coordinates.y').isInt().withMessage('Must be a number'),
  validateRequest,

  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const { protocols, scan } = body

    let coordinates = {
      x: 0,
      y: 0
    }

    // others variables
    const valueList = []
    const validScanList = []
    let valueSqrt = 0
    let minValue = 0
    let maxValue = 0
    let position = 0
    let distance = 0
    const newValuesList = []

    // avoid-mech
    if (protocols.length === 1 && protocols[0] === 'avoid-mech') {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        if (item.enemies.type !== 'mech' && distance <= 100) {
          coordinates = item.coordinates
        }
      }
    }

    // prioritize-mech
    if (protocols.length === 1 && protocols[0] === 'prioritize-mech') {
      let i = 0
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        if (distance <= 100) {
          if (item.enemies.type === 'mech') {
            coordinates = item.coordinates
          } else {
            coordinates = scan[i].coordinates
          }
        }
        i++
      }
    }

    // closest-enemies
    if (protocols.length === 1 && protocols[0] === 'closest-enemies') {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        valueList.push(distance)
      }
      for (let value of valueList) {
        if (value <= 100) {
          newValuesList.push(value)
        }
      }
      minValue = Math.min(...newValuesList)
      position = valueList.indexOf(minValue)
      if (position !== -1) {
        coordinates = scan[position].coordinates
      }
    }

    // furthest-enemies
    if (protocols.length === 1 && protocols[0] === 'furthest-enemies') {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        valueList.push(distance)
      }
      for (let value of valueList) {
        if (value <= 100) {
          newValuesList.push(value)
        }
      }
      maxValue = Math.max(...newValuesList)
      position = valueList.indexOf(maxValue)
      if (position !== -1) {
        coordinates = scan[position].coordinates
      }
    }

    // assist-allies
    if (protocols.length === 1 && protocols[0] === 'assist-allies') {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        if (distance <= 100) {
          if (item.allies) {
            coordinates = item.coordinates
          }
        }
      }
    }

    // avoid-crossfire
    if (protocols.length === 1 && protocols[0] === 'avoid-crossfire') {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        if (distance <= 100) {
          if (!item.allies) {
            coordinates = item.coordinates
          }
        }
      }
    }

    // closest-enemies && avoid-mech
    if (
      protocols.includes('closest-enemies') &&
      protocols.includes('avoid-mech')
    ) {
      for (let item of scan) {
        if (item.enemies.type !== 'mech') {
          distance = getDistance(item.coordinates.x, item.coordinates.y)
          if (distance <= 100) {
            valueList.push(distance)
            validScanList.push(item)
          }
        }
      }
      minValue = Math.min(...valueList)
      position = valueList.indexOf(minValue)
      if (position !== -1) {
        coordinates = validScanList[position].coordinates
      }
    }

    // furthest-enemies && avoid-mech
    if (
      protocols.includes('furthest-enemies') &&
      protocols.includes('avoid-mech')
    ) {
      for (let item of scan) {
        if (item.enemies.type !== 'mech') {
          distance = getDistance(item.coordinates.x, item.coordinates.y)
          if (distance <= 100) {
            valueList.push(distance)
            validScanList.push(item)
          }
        }
      }
      maxValue = Math.max(...valueList)
      position = valueList.indexOf(maxValue)
      if (position !== -1) {
        coordinates = validScanList[position].coordinates
      }
    }

    // closest-enemies && prioritize-mech
    if (
      protocols.includes('closest-enemies') &&
      protocols.includes('prioritize-mech')
    ) {
      for (let item of scan) {
        if (item.enemies.type === 'mech') {
          distance = getDistance(item.coordinates.x, item.coordinates.y)
          if (distance <= 100) {
            valueList.push(distance)
            validScanList.push(item)
          }
        }
      }
      minValue = Math.min(...valueList)
      position = valueList.indexOf(minValue)
      if (position !== -1) {
        coordinates = validScanList[position].coordinates
      }
    }

    // closest-enemies && prioritize-mech && avoid-crossfire
    if (
      protocols.includes('closest-enemies') &&
      protocols.includes('prioritize-mech') &&
      protocols.includes('avoid-crossfire')
    ) {
      for (let item of scan) {
        distance = getDistance(item.coordinates.x, item.coordinates.y)
        if (distance <= 100) {
          if (item.enemies.type === 'mech') {
            if (!item.allies) {
              valueList.push(distance)
              validScanList.push(item)
            }
          }
        }
      }
      minValue = Math.min(...valueList)
      position = valueList.indexOf(minValue)
      if (position !== -1) {
        coordinates = validScanList[position].coordinates
      }
    }

    return res.json(coordinates)
  }
]
