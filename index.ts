import { getImagePalette } from './src/index'

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
