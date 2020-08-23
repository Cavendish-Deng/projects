let canvas = document.getElementById('canvas')
let erase = document.getElementById('erase')
let brush = document.getElementById('brush')
let clear = document.getElementById('clear')
let save = document.getElementById('save')
let red = document.getElementById('red')
let green = document.getElementById('green')
let blue = document.getElementById('blue')
let black = document.getElementById('black')
let yellow = document.getElementById('yellow')
let actions = document.getElementById('actions')
let thin = document.getElementById('thin')
let thick = document.getElementById('thick')
let ctx = canvas.getContext('2d')
let a = document.createElement('a')
a.target = '_blank'
document.body.appendChild(a);
// 特性检测，检测设备是否事移动设备，若存在触摸事件，则表明是移动设备，否则是PC电脑
let isMobileDevice = document.body.ontouchstart !== undefined ? true : false
let usingEraser = false
let isMouseDown = false
// 记录前一个坐标
let previousPoint = nextPoint = { x: undefined, y: undefined }
// 线条粗细
let lineWidth = 5
let penColor = ""

resizeCanvas()
window.onresize = debounce(function () {
  resizeCanvas()
}, 500)

setCanvasBackground('white')

thin.onclick = function () {
  lineWidth = 5
  usePen()
  removeSizeActivedClass()
  thin.classList.add('actived')
}
thick.onclick = function () {
  lineWidth = 10
  usePen()
  removeSizeActivedClass()
  thick.classList.add('actived')
}

erase.onclick = function () {
  useErase()
}

brush.onclick = function () {
  usePen()
}

clear.onclick = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // 清楚后记得要重新设置背景颜色
  setCanvasBackground('white')
}

save.onclick = function() {
  a.href = canvas.toDataURL()
  a.download = '我的画板.png'
  a.click()
  setCanvasBackground('white')
}

red.onclick = function () {
  penColor = 'red'
  ctx.fillStyle = penColor
  ctx.strokeStyle = penColor
  removeActivedClass('')
  red.classList.add('actived')
  usePen()
}

green.onclick = function () {
  penColor = 'green'
  ctx.fillStyle = penColor
  ctx.strokeStyle = penColor
  removeActivedClass()
  green.classList.add('actived')
  usePen()

}

yellow.onclick = function () {
  penColor = 'yellow'
  ctx.fillStyle = penColor
  ctx.strokeStyle = penColor
  removeActivedClass()
  yellow.classList.add('actived')
  usePen()

}

blue.onclick = function () {
  penColor = 'blue'
  ctx.fillStyle = penColor
  ctx.strokeStyle = penColor
  removeActivedClass()
  blue.classList.add('actived')
  usePen()

}

black.onclick = function () {
  penColor = 'black'
  ctx.fillStyle = penColor
  ctx.strokeStyle = penColor
  removeActivedClass()
  black.classList.add('actived')
  usePen()
}

if (isMobileDevice) {
  // Mobile
  canvas.ontouchstart = function (e) {
    // console.log('touch start');
    let [x, y] = [e.touches[0].lientX, e.touches[0].clientY]
    isMouseDown = true
    if (usingEraser) {
      ctx.clearRect(x, y, 2 * lineWidth, 2 * lineWidth)
    } else {
      previousPoint = { x, y }
    }
  }
  canvas.ontouchmove = function (e) {
    let [x, y] = [e.touches[0].clientX, e.touches[0].clientY]
    if (isMouseDown) {
      if (usingEraser) {
        ctx.clearRect(x, y, 2 * lineWidth, 2 * lineWidth)
      } else {
        nextPoint = { x, y }
        drawLine(previousPoint, nextPoint)
        // 更新前一个坐标 previousPoint 为 nextPoint
        previousPoint = nextPoint
      }
    }
  }
  canvas.ontouchend = function (e) {
    // console.log('touch end');
    isMouseDown = false
  }

} else {
  // PC
  canvas.onmousedown = function (e) {
    let [x, y] = [e.clientX, e.clientY]
    isMouseDown = true
    if (usingEraser) {
      ctx.clearRect(x, y, 2 * lineWidth, 2 * lineWidth)
    } else {
      previousPoint = { x, y }
    }
  }

  canvas.onmousemove = function (e) {
    let [x, y] = [e.clientX, e.clientY]
    if (isMouseDown) {
      if (usingEraser) {
        ctx.clearRect(x, y, 2 * lineWidth, 2 * lineWidth)
      } else {
        nextPoint = { x, y }
        drawLine(previousPoint, nextPoint)
        // 更新前一个坐标 previousPoint 为 nextPoint
        previousPoint = nextPoint
      }
    }
  }

  canvas.onmouseup = function (e) {
    isMouseDown = false
  }
}

function resizeCanvas() {
  let pageHeight = document.documentElement.clientHeight
  let pageWidth = document.documentElement.clientWidth
  canvas.height = pageHeight
  canvas.width = pageWidth
  setCanvasBackground('white')
  console.log('penColor', penColor);
  switch(penColor) {
    case 'blue' :
      ctx.fillStyle = penColor
      ctx.strokeStyle = penColor
    case 'red' :
      ctx.fillStyle = penColor
      ctx.strokeStyle = penColor
    case 'yellow' :
      ctx.fillStyle = penColor
      ctx.strokeStyle = penColor
    case 'green' :
      ctx.fillStyle = penColor
      ctx.strokeStyle = penColor
    case 'black' :
      ctx.fillStyle = penColor
      ctx.strokeStyle = penColor
  }
}

function drawLine(previousPoint = {}, nextPoint = {}) {
  ctx.beginPath()
  ctx.moveTo(previousPoint.x, previousPoint.y)
  ctx.lineWidth = lineWidth
  ctx.lineTo(nextPoint.x, nextPoint.y)
  ctx.closePath()
  ctx.stroke()
}

function usePen() {
  usingEraser = false
  erase.classList.remove('actived')
  brush.classList.add('actived')
}

function useErase() {
  usingEraser = true
  erase.classList.add('actived')
  brush.classList.remove('actived')
}

function removeActivedClass() {
  red.classList.remove('actived')
  blue.classList.remove('actived')
  yellow.classList.remove('actived')
  green.classList.remove('actived')
  black.classList.remove('actived')
}
function removeSizeActivedClass() {
  thin.classList.remove('actived')
  thick.classList.remove('actived')
}

function setCanvasBackground(color) {
  // 设置背景颜色
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function debounce (fn, delay=1000, immediate=false) {
  let timer = null
  return function() {
      // 修正this指向和event对象能够被传递,
      // 保证不使用debounce函数时与使用debounce函数时 的this指向相同和参数能够被传递
      const context = this
      const args = arguments

      timer && clearTimeout(timer);
      
      if(immediate) {
          // 如果已经执行过，不再执行
          let callNow = !timer
          timer = setTimeout(function(){
              timer = null
          }, delay)
          callNow && fn.apply(context, args)
      } else {
          timer = setTimeout(function() {
              fn.apply(context, args)
          }, delay)
      }
  }
}