let clock = document.getElementById('clock')
let ctx = clock.getContext('2d')
let height = ctx.canvas.height;
let width = ctx.canvas.width;
let r = width / 2 // 半径
let rem = width / 200 // 缩放比例

function drawBackground() {
  ctx.save()
  ctx.translate(r, r)
  ctx.beginPath()
  ctx.lineWidth = 10 * rem
  ctx.arc(0, 0, r - ctx.lineWidth, 0, 2 * Math.PI, false)
  ctx.stroke()

  let hourNumber = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]
  ctx.font = 18 * rem + 'px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  hourNumber.forEach((number, i) => {
    // 弧度
    let rad = 2 * Math.PI / 12 * i;
    let x = Math.cos(rad) * (r - 30 * rem)
    let y = Math.sin(rad) * (r - 30 * rem)
    ctx.fillText(number, x, y)
  })

  for (let i = 0; i < 60; i++) {
    let rad = 2 * Math.PI / 60 * i;
    let x = Math.cos(rad) * (r - 18 * rem)
    let y = Math.sin(rad) * (r - 18 * rem)
    ctx.beginPath()
    if (i % 5 === 0) {
      ctx.fillStyle = '#000';
    } else {
      ctx.fillStyle = '#ccc';
    }
    ctx.arc(x, y, 2 * rem, 0, 2 * Math.PI, false)
    ctx.fill()
  }
}

function drawHour(hour, minute) {
  ctx.save()
  ctx.beginPath()
  let rad = 2 * Math.PI / 12 * hour
  // minute 引起的弧度
  let mrad = 2 * Math.PI / 12 / 60 * minute
  ctx.rotate(rad + mrad)
  ctx.lineWidth = 6 * rem
  ctx.lineCap = 'round'
  ctx.moveTo(0, 10 * rem)
  ctx.lineTo(0, - r / 2)
  ctx.stroke()
  ctx.restore() // 还原画时针之前的状态，这样做是为了下面画分针
}

function drawMinute(minute) {
  ctx.save()
  ctx.beginPath()
  let rad = 2 * Math.PI / 60 * minute
  ctx.rotate(rad)
  ctx.lineWidth = 3 * rem
  ctx.lineCap = 'round'
  ctx.moveTo(0, 10 * rem)
  ctx.lineTo(0, - r + 30 * rem)
  ctx.stroke()
  ctx.restore() // 还原画分针之前的状态，这样做是为了下面画秒针
}

function drawSecond(second) {
  ctx.save()
  ctx.beginPath()
  ctx.fillStyle = '#c14543'
  let rad = 2 * Math.PI / 60 * second
  ctx.rotate(rad)
  ctx.moveTo(-2 * rem, 20 * rem)
  ctx.lineTo(2 * rem, 20)
  ctx.lineTo(1, - r + 18 * rem)
  ctx.lineTo(-1, - r + 18 * rem)
  ctx.fill()
  ctx.restore()
}

function drawDot() {
  ctx.beginPath()
  ctx.lineStyle = '#fff'
  ctx.arc(0, 0, 3 * rem, 0, 2 * Math.PI, false)
  ctx.fill()
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  let now = new Date()
  let hour = now.getHours()
  let minute = now.getMinutes()
  let second = now.getSeconds()
  drawBackground()
  drawHour(hour, minute)
  drawMinute(minute)
  drawSecond(second)
  drawDot()
  ctx.restore()
}

window.onload = function () {
  draw()
  setInterval(draw, 1000)
}