let app = getApp();
let timer
Page({
  data: {
    show: false,
    darkMode: false,
    btnDark: 'btn-dark',
    btn: 'btn-wrapper',
    wrapper: 'wrapper',
    wrapperDark: 'dark-wrapper',
    text: 'text',
    textDark: 'dark-text',
    darkButton: 'dark-button',
    hover: 'hover',
    hoverDark: 'dark-hover'
  },
  onShow() {
    timer = setTimeout(() => {
      if (app.globalData.darkMode == true) {
        this.setData({
          darkMode: true,
          show: true
        })
      } else if (app.globalData.darkMode == false) {
        this.setData({
          darkMode: false,
          show: true,
        })
      }
    }, 500)
  },
  onHide() {
    clearTimeout(timer)
  }
})