export const clamp = (num: number, min: number, max: number): number => {
  if (num < min) {
    return min
  }
  if (num > max) {
    return max
  }
  return num
}

export const calcLength = (x: number, y: number): number => {
  return Math.sqrt(calcLengthSq(x, y))
}

export const calcLengthSq = (x: number, y: number): number => {
  return x * x + y * y
}
