/**
 * 颜色通道
 */
export type ColorChanel = 'r' | 'g' | 'b'

/**
 * 像素点对象
 */
export type Pixel = { r: number; g: number; b: number }

/**
 * rgb 颜色对象
 */
export type Color = Pixel

/**
 * canvas 矩形区域
 */
export type CanvasArea = {
  sx: number // 区域横坐标（左上角）
  sy: number // 区域纵坐标
  sw: number // 区域宽度
  sh: number // 区域高度
}

/**
 * 从 \<img> 元素中提取主色调
 * @param image 目标 \<img> 元素
 * @param n 提取颜色的数量，默认值为 1，最大值为 16
 * @returns 提取出的 rgb 颜色数组，例如 [{ r: 0, g: 0, b: 0}]
 */
export const getImagePalette = (image: HTMLImageElement, n: number = 1) => {
  // 1. 加载图片，并将图片绘制到 canvas 画布上
  const context = drawImageToCanvas(image)
  // 2. 获取图片的所有像素点
  const pixels = getPixelsByContext(context, {
    sx: 0,
    sy: 0,
    sw: image.width,
    sh: image.height,
  })
  // 3. 利用中值切割算法进行颜色量化
  return quantizeColor(pixels, n)
}

/**
 * 将 \<img> 元素绘制到 \<canvas> 画布上
 * @param image 目标 \<img> 元素
 * @returns \<canvas> 的 context 对象
 */
export const drawImageToCanvas = (image: HTMLImageElement) => {
  // 创建 canvas 画布
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height

  // 将图片绘制到 canvas 上
  const context = canvas.getContext('2d') // context 相当于画笔
  // 类型收窄
  if (!context) {
    throw new Error('Canvas is not support.')
  }
  context.drawImage(image, 0, 0)

  return context
}

/**
 * 通过 \<canvas> 的 context 对象获取目标区域 area 内的所有像素点
 * @param context \<canvas> 的 context 对象
 * @param area 目标 \<canvas> 区域
 * @returns area 区域内的所有像素点组成的数组
 */
export const getPixelsByContext = (
  context: CanvasRenderingContext2D,
  area: CanvasArea
): Pixel[] => {
  const pixels: Pixel[] = []

  const { sx, sy, sw, sh } = area
  // 获取图片的所有通道值：r, g, b, a, r, g, b, a ...
  const imageData = context.getImageData(sx, sy, sw, sh).data

  // 提取图片的所有像素点
  for (let i = 0, len = imageData.length; i < len; i += 4) {
    const pixel: Pixel = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    }
    pixels.push(pixel)
  }

  return pixels
}

/**
 *
 * @param pixels 需要量化的像素点数组
 * @param n 需要量化的颜色，默认值为 1，最大值为 16
 * @returns 量化后的 rgb 颜色数组
 */
export const quantizeColor = (pixels: Pixel[], n: number = 1): Color[] => {
  const pixelNum = pixels.length

  // 最多只能处理 16 个颜色
  n = Math.min(n, 16)

  // 递归，直到像素点已经被分成目标颜色数量个部分
  const t = Math.log2(n) // 所需切割次数
  if (t < 1 || pixelNum === 0) {
    // 如果像素点已经被分成目标数量个部分，则统计各个颜色通道的平均值
    const color = pixels.reduce(
      (prevPixel, currPixel) => {
        prevPixel.r += currPixel.r
        prevPixel.g += currPixel.g
        prevPixel.b += currPixel.b

        return prevPixel
      },
      { r: 0, g: 0, b: 0 }
    )

    color.r = Math.round(color.r / pixelNum)
    color.g = Math.round(color.g / pixelNum)
    color.b = Math.round(color.b / pixelNum)

    return [color]
  }

  // 获取值域最大的颜色通道 maxRangeChanel
  const maxRangeChanel = findMaxRangeChanel(pixels)
  // 根据 maxRangeChanel 对所有像素点进行排序
  sortPixelsByChanel(pixels, maxRangeChanel)
  // 将像素点进行二分，递归颜色量化
  const mid = Math.floor(pixelNum / 2)
  return [
    ...quantizeColor(pixels.slice(0, mid), n / 2),
    ...quantizeColor(pixels.slice(mid), n / 2),
  ]
}

/**
 * 获取像素点中值域最大的颜色通道
 * @param pixels 目标像素点数组
 * @returns 像素点中值域最大的颜色通道，如 'r', 'g', 'b'
 */
export const findMaxRangeChanel = (pixels: Pixel[]): ColorChanel => {
  // 通道最小值
  let rMin = Number.MAX_VALUE,
    gMin = Number.MAX_VALUE,
    bMin = Number.MAX_VALUE

  // 通道最大值
  let rMax = Number.MAX_VALUE,
    gMax = Number.MAX_VALUE,
    bMax = Number.MAX_VALUE

  // 统计各个颜色通道的值域
  pixels.forEach((pixel) => {
    const { r, g, b } = pixel

    rMin = Math.min(rMin, r)
    gMin = Math.min(gMin, g)
    bMin = Math.min(bMin, b)

    rMax = Math.max(rMax, r)
    gMax = Math.max(gMax, g)
    bMax = Math.max(bMax, b)
  })

  // 找出值域最大的颜色通道
  const rRange = rMax - rMin
  const gRange = gMax - gMin
  const bRange = bMax - bMin
  const maxRange = Math.max(rRange, gRange, bRange)

  if (maxRange === rRange) {
    return 'r'
  } else if (maxRange === gRange) {
    return 'g'
  } else {
    return 'b'
  }
}

/**
 * 根据颜色通道对像素点数组进行排序
 * @param pixels 需要排序的像素点数组
 * @param chanel 排序依据的颜色通道，如 'r', 'g', 'b'
 */
export const sortPixelsByChanel = (pixels: Pixel[], chanel: ColorChanel) => {
  pixels.sort((p1, p2) => p1[chanel] - p2[chanel])
}
