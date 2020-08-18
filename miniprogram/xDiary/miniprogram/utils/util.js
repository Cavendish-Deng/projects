function getWeek() {
  let now = new Date()
  let weekday = new Array(7);
  weekday[0] = "周日";
  weekday[1] = "周一";
  weekday[2] = "周二";
  weekday[3] = "周三";
  weekday[4] = "周四";
  weekday[5] = "周五";
  weekday[6] = "周六";
  return weekday[now.getDay()];
}
function getClockTime() {
  let now = new Date()
  let hour = now.getHours()
  let minute = now.getMinutes()
  let finalMinute;
  let finalHour;
  if(minute < 10) {
    finalMinute = `0${minute}`
  } else {
    finalMinute = minute
  }

  if(hour < 10) {
    finalHour = `0${finalHour}`
  } else {
    finalHour = hour
  }
  return `${hour}:${finalMinute}`
}
function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  time %= 3600
  const minute = parseInt(time / 60, 10)
  time = parseInt(time % 60, 10)
  const second = time

  return ([minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}
module.exports = {
  formatTime,
  getWeek,
  getClockTime
}
