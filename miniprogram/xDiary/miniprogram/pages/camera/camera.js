let app = getApp()
app.globalData.cameraImageList
let recordInterval
let recordTimeout
let seconds = 0
let currentTag = 'life'
Page({
  data: {
    showVideoAlbum: false,
    seconds: 0,
    showTime: false,
    currentImgSrc: '',
    defaultText: '',
    whiteText: '#FFFFFE',
    redText: '#C62F2F',
    photo: true,
    videoStopBtn: false,
    videoBtn: false,
    show: 'block',
    hide: 'none',
    visible: '1',
    hidden: '0',
    camera: 'block',
    video: false,
    iamgeList: [],
    showPhotoAlbum: false,
    videosrc: '',
    direction: 'back',
  },
  ctx: '',
  change() {
    if (seconds !== 0) {
      wx.showToast({
        title: '正在录制',
        icon: 'none'
      })
      return
    }
    if (this.data.direction == 'back') {
      this.setData({
        direction: 'front'
      })
    } else if (this.data.direction == 'front') {
      this.setData({
        direction: 'back'
      })
    }
  },
  switchToPhoto() {
    if (seconds !== 0) {
      wx.showToast({
        title: '正在录制',
        icon: 'none'
      })
      return
    }
    this.setData({
      photo: true,
      videoBtn: false,
    })
    if (this.data.seconds > 0) {
      this.setData({
        showTime: true
      })
    }
    // 如果图片和视频都有就优先显示图片,图片和视频有其一就显示有的那个
    if (this.data.currentImgSrc === '' && this.data.videosrc === '') {
      this.setData({
        showPhotoAlbum: false,
        showVideoAlbum: false
      })
    } else if (this.data.currentImgSrc !== '' && this.data.videosrc === '') {
      this.setData({
        showPhotoAlbum: true,
        showVideoAlbum: false
      })
    } else if (this.data.currentImgSrc === '' && this.data.videosrc !== '') {
      this.setData({
        showPhotoAlbum: false,
        showVideoAlbum: true
      })
    } else if (this.data.currentImgSrc !== '' && this.data.videosrc !== '') {
      this.setData({
        showPhotoAlbum: true,
        showVideoAlbum: false
      })
    }
  },
  switchToVideo() {
    if (seconds !== 0) {
      wx.showToast({
        title: '正在录制',
        icon: 'none'
      })
      return
    }
    this.setData({
      videoBtn: true,
      photo: false
    })
    if (this.data.seconds > 0) {
      this.setData({
        showTime: true
      })
    }
    if (this.data.currentImgSrc === '' && this.data.videosrc === '') {
      this.setData({
        showPhotoAlbum: false,
        showVideoAlbum: false
      })
    } else if (this.data.currentImgSrc !== '' && this.data.videosrc === '') {
      this.setData({
        showPhotoAlbum: true,
        showVideoAlbum: false
      })
    } else if (this.data.currentImgSrc === '' && this.data.videosrc !== '') {
      this.setData({
        showPhotoAlbum: false,
        showVideoAlbum: true
      })
    } else if (this.data.currentImgSrc !== '' && this.data.videosrc !== '') {
      this.setData({
        showPhotoAlbum: false,
        showVideoAlbum: true
      })
    }
  },
  Comfirm() {
    if (seconds !== 0) {
      wx.showToast({
        title: '正在录制',
        icon: 'none'
      })
      return
    }
    if (app.globalData.cameraImageList.length === 0 && this.data.videosrc === '') {
      wx.showToast({
        title: '至少拍摄一张照片或一段视频',
        icon: 'none'
      })
      return
    }
    if (this.data.videosrc !== '') {
      app.globalData.videosrc = this.data.videosrc
    }
    wx.redirectTo({
      url: `/pages/edit/edit?tag=${currentTag}`
    })
  },
  onLoad(option) {
    console.log('option', option)
    currentTag = option.tag
    if (option.video) {
      this.setData({
        videoBtn: true,
        photo: false,
        videosrc: '',
      })
    }
    app.globalData.cameraImageList = []
    this.ctx = wx.createCameraContext()
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera'
          })
        }
      }
    })
  },
  takePhoto() {
    const that = this
    if (app.globalData.cameraImageList.length <= 5) {
      this.ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          app.globalData.cameraImageList.unshift(res.tempImagePath)
          that.setData({
            iamgeList: app.globalData.cameraImageList,
            showPhotoAlbum: true,
            showVideoAlbum: false,
            currentImgSrc: app.globalData.cameraImageList[0]
          })
        }
      })
    } else {
      wx.showToast({
        title: '最多只能拍6张照片',
        icon: 'none'
      })
    }
  },
  photoPreview(e) {
    const that = this
    const current = e.target.dataset.src
    wx.previewImage({
      current,
      urls: that.data.iamgeList
    })
  },
  videoPreview() {
    this.setData({
      camera: 'none',
      video: 'block'
    })
  },
  startRecord() {
    if (seconds > 0) {
      wx.showToast({
        title: '正在录制',
        icon: 'none'
      })
      return
    }
    this.setData({
      showTime: true
    })
    const that = this
    if (this.data.seconds > 0) {
      wx.showModal({
        title: '提示',
        content: '你已录制一段视频了，是否要重新录制？',
        success(res) {
          if (res.confirm) {
            that.setData({
              seconds: 0,
              videoStopBtn: true,
              videoBtn: false,
            })
            wx.showToast({
              title: '重新录制中...',
              icon: 'none'
            })
            that.ctx.startRecord({
              success: (res) => {
                recordInterval = setInterval(() => {
                  seconds += 1
                  that.setData({
                    seconds: seconds
                  })
                  if (that.data.seconds == 10) {
                    clearInterval(recordInterval)
                    wx.showLoading({
                      title: '处理中...',
                    })
                    recordTimeout = setTimeout(() => {
                      that.ctx.stopRecord({
                        success: (res) => {
                          wx.hideLoading()
                          that.setData({
                            videosrc: res.tempVideoPath
                          })
                          wx.showToast({
                            title: '录制完成',
                            icon: 'none'
                          })
                          seconds = 0
                          clearTimeout(recordTimeout)
                        }
                      })
                    }, 1000)
                  }
                }, 1000)
                return
              }
            })
          } else if (res.cancel) {
            return
          }
        }
      })
      return
    }
    wx.showToast({
      title: '开始录制',
      icon: 'none'
    })
    this.ctx.startRecord({
      success: (res) => {
        that.setData({
          videoStopBtn: true,
          videoBtn: false,
        })
        recordInterval = setInterval(() => {
          seconds += 1
          that.setData({
            seconds: seconds
          })
          if (that.data.seconds == 10) {
            clearInterval(recordInterval)
            wx.showLoading({
              title: '处理中...',
            })
            recordTimeout = setTimeout(() => {
              that.ctx.stopRecord({
                success: (res) => {
                  that.setData({
                    showVideoAlbum: true,
                    showPhotoAlbum: false,
                    videoStopBtn: false,
                    videoBtn: true,
                    videosrc: res.tempVideoPath,
                  })
                  wx.hideLoading()
                  seconds = 0
                  clearTimeout(recordTimeout)
                  // that.saveVideoToAlbum()
                }
              })
            }, 1000)
          }
        }, 1000)
      }
    })
  },
  stopRecord() {
    clearInterval(recordInterval)
    const that = this
    this.ctx.stopRecord({
      success: (res) => {
        wx.showToast({
          title: '录制完成',
          icon: 'none'
        })
        that.setData({
          videosrc: res.tempVideoPath,
          showVideoAlbum: true,
          showPhotoAlbum: false,
          videoStopBtn: false,
          videoBtn: true
        })
        seconds = 0
        clearTimeout(recordTimeout)
      }
    })
  },
  videoEnded() {
    this.setData({
      video: false,
      camera: 'block'
    })
  },
  onShow() {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log("用户通同意权限")
            }
          })
        }
      }
    })
  }
})