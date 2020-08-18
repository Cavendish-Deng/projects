const app = getApp()
let timer
Page({
  data: {
    checked: false,
    btn: '授权登录',
    load: '加载中...',
    isGetting: true,
    dark: 'default-dark',
    light: 'default-light',
    darkMode: false,
    wrapper: 'profile-wrapper',
    wrapperStyle: 'profile-darkmode',
    head: 'head',
    headStyle: 'head-drakmode',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onHide() {
    if(timer) {
      clearTimeout(timer)
    }
  },
  onLoad() {
    const that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            isGetting: false
          })
          wx.getUserInfo({
            success(res) {
              that.setData({
                userInfo: res.userInfo,
                canIUse: false
              })
            }
          })
        } else {
          wx.getUserInfo({
            success(res) {
              that.setData({
                userInfo: res.userInfo,
                canIUse: false,
                isGetting: false
              })
            }
          })
        }
      }
    })
  },
  onGetQrCode() {
    wx.showLoading({
      title: '生成中',
      mask: true
    })
    wx.cloud.callFunction({
      name: "getQRCode"
    }).then(res => {
      console.log('res', res)
      wx.previewImage({
        urls: [res.result],
        current: res.result
      })
      wx.hideLoading()
    })
  },
  switchChange(e) {
    if (e.detail === true) {
      timer = setTimeout(() => {
        this.setData({
          darkMode: true,
          checked: true
        })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#7A7E83',
          animation: {
            duration: 500,
            timingFunc: 'ease'
          }
        })
        app.globalData.darkMode = true
        wx.setTabBarStyle({
          backgroundColor: '#26272A'
        })
      }, 500)
    } else if (e.detail === false) {
      timer = setTimeout(() => {
        this.setData({
          darkMode: false,
          checked: false
        })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#26272A',
          animation: {
            duration: 500,
            timingFunc: 'ease'
          }
        })
        app.globalData.darkMode = false
        wx.setTabBarStyle({
          backgroundColor: '#ffffff'
        })
      }, 500)
    }
  },
  goToAboutPage() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },
  bindGetUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo,
      canIUse: false
    })
  },
  onShareAppMessage() {
    return {
      title: '记录生活，留住时光',
      path: '/pages/profile/profile',
      imageUrl: '../../image/time_diary.jpg'
    }
  }
})
