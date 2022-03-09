export const getDistance = (valueX: number, valueY: number) => {
  const valueSqrt = Math.sqrt(valueX * valueX + valueY * valueY)
  return valueSqrt
}
