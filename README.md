# 🎨 Image Palette Extraction

## 作用

提取图片中的主色调

## 原理

 1. 加载图片，将图片绘制到 canvas 画布上
 2. 获取图片的所有像素点
 3. 利用中值切割算法进行颜色量化，获取主色调

> <a href="https://en.wikipedia.org/wiki/Median_cut">中值切割算法</a>
> 1. 找出像素点中 值域最大的颜色通道 maxRangeChanel (r, g, b)
> 2. 根据 maxRangeChanel 对像素点进行排序
> 3. 将像素点一分为二
> 4. 递归执行以上过程，直到图片的所有像素点被分成目标颜色数量个部分。此时，每个部分的像素点代表一个量化后的颜色。对某个部分的像素点进行统计，求出 r，g，b 各个通道的平均值，即可得到该部分像素点代表的颜色。

## 安装

```shell
npm i image-palette-extraction
```

## 使用

```ts
// index.ts
import { getImagePalette } from 'image-palette-extraction'

// 加载图片
const image = document.createElement('img')
image.src = '../images/girl1.jpg'
image.width = 500
image.height = 300

const container = document.getElementById('container')

document.body.insertBefore(image, container)

// 图片加载完成后，计算图片主题色
image.addEventListener('load', () => {
  console.log('图片加载完成')

  console.time('extract palette')
  const palettes = getImagePalette(image, 8)
  console.log(palettes)
  console.timeEnd('extract palette')

  palettes.forEach((pixel) => {
    const { r, g, b } = pixel
    const bgcolor = `rgb(${r}, ${g}, ${b})`

    const div = document.createElement('div')
    div.className = 'coloredBox'
    div.setAttribute('style', `background-color: ${bgcolor};`)
    div.innerText = bgcolor

    container && container.appendChild(div)
  })
})
```
