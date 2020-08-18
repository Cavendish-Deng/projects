const util = require('../../utils/util.js')
const db = wx.cloud.database()
const recorderManager = wx.getRecorderManager()
const audioContext = wx.createInnerAudioContext()
let playTimeInterval
let recordTimeInterval
let saveTimeout
let editTimeout
let imgList = []
let app = getApp()
let audioTimer
let stamp
let videoCloudFileId = ''
let audioCloudFileId = ''
let imgCloudFileIdList = []
let timer
let currentTag = 'life'
Page({
  data: {
    hasTextContent: true,
    placeholder: '记下此刻的感受......',
    editDiary: true,
    tagDarkMode: 'tagDarkMode',
    tagStyle: 'tag',
    selectedItem: '生活',
    block: 'flex',
    none: 'none',
    time: new Date().getHours() + ':' + new Date().getMinutes(),
    hoverStyle: 'save-hover',
    inputContent: '',
    color: '',
    optionbackground: '#EDECE8',
    darkMode: '',
    mideaStyle: '',
    saveStyle: '',
    isDisabled: false,
    video: false,
    src: '',
    focus: false,
    photo: false,
    imageList: [],
    hide: true,
    count: 6,
    audio: false,
    recording: false,
    playing: false,
    hasRecord: false,
    recordTime: 0,
    playTime: 0,
    audioTempFilePath: '',
    formatedRecordTime: '00:00',
    formatedPlayTime: '00:00'
  },
  // generateShareImg() {
  //   wx.navigateTo({
  //     url: '/pages/share/share',
  //   })
  
  // },
  selectTag() {
    const that = this
    wx.showActionSheet({
      itemList: ['生活', '工作', '取消'],
      success(res) {
        if (res.tapIndex == 0) {
          that.setData({ selectedItem: '生活' })
          currentTag = 'life'
        } else if (res.tapIndex == 1) {
          that.setData({ selectedItem: '工作' })
          currentTag = 'work'
        } else {
          return
        }
      }
    })
  },
  photoPreview(e) {
    const that = this
    const current = e.target.dataset.src
    wx.previewImage({
      current,
      urls: that.data.imageList
    })
  },
  longPress(e) {
    const that = this
    const index = imgList.indexOf(e.currentTarget.dataset.src)
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function(res) {
        if (res.confirm) {
          imgList.splice(index, 1)
          that.setData({
            hide: true
          })
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          imageList: imgList
        });
        if (that.data.imageList.length === 0) {
          that.setData({
            photo: false
          })
        }
      }
    })
  },
  save() {
    const paths = this.data.imageList
    const len = this.data.imageList.length
    // 如果没有内容就不能上传
    if (!this.data.audioTempFilePath && !this.data.src && !len && !this.data.inputContent) {
      wx.showToast({
        title: '内容不能为空哦',
        icon: 'none',
        mask: true
      })
      return
    }
    const p2 = this.saveAudio()
    const p3 = this.saveVideo()
    const p4 = this.saveImage()
    wx.showLoading({
      title: '保存中',
    })
    const p = Promise.all([p3, p2, p4])
      .then(res => {
        // console.log(res)
        this.setData({
          isDisabled: true
        })
      }).then((res) => {
        this.saveInputContent()
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1000
        })
        wx.hideLoading()
        timer = setTimeout(() => {
          wx.reLaunch({
            url: '/pages/diary/diary?tag=' + currentTag
          })
        }, 1000)
      })
  },
  bindTextAreaBlur() {
    this.setData({
      blur: true
    })
  },
  modify() {
    this.setData({
      focus: true,
      isDisabled: false
    }) 
  },
  openVideo() {
    const that = this
    wx.showActionSheet({
      itemList: ['相册', '拍摄', '取消'],
      itemColor: '1296DB',
      success(res) {
        if (res.tapIndex == 0) {
          that.chooseVideo()
        } else if (res.tapIndex == 1) {
          that.goToVideo()
        } else if (res.tapIndex == 2) {
          return
        }
      }
    })
  },
  goToVideo() {
    wx.navigateTo({
      url: '/pages/camera/camera?video=true'
    })
  },
  chooseVideo() {
    const that = this
    wx.chooseVideo({
      compressed: true,
      sourceType: ['album'],
      success(res) {
        console.log(res.duration)
        if (res.duration > 10) {
          wx.showToast({
            title: '视频长度不能超过10秒',
            icon: 'none',
            duration: 1500
          })
          return
        }
        that.setData({
          video: true,
          src: res.tempFilePath
        })
      }
    })
  },
  deleteVideo() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除此视频吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            src: '',
            video: false
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  chooseImage() {
    if (this.data.hide == true) {
      //计算还有多少张图片可以选择
      this.data.count = this.data.count - imgList.length
      const that = this
      wx.chooseImage({
        sourceType: ['camera', 'album'],
        sizeType: ['compressed', 'original'],
        count: that.data.count,
        success(res) {
          imgList = that.data.imageList.concat(res.tempFilePaths)
          if (imgList.length == 6) {
            that.setData({
              photo: true,
              hide: false,
              imageList: imgList
            })
          } else {
            that.setData({
              photo: true,
              hide: true,
              imageList: imgList
            })
          }
        }
      })
    }
  },
  onHide() {
    this.setData({
      isDisabled: false
    })
    if (this.data.playing) {
      this.stopVoice()
    } else if (this.data.recording) {
      this.stopRecordUnexpectedly()
    }
  },
  onUnload() {
    app.globalData.audioPath = ''
    app.globalData.videosrc = ''
    app.globalData.cameraImageList = []
    imgList = []
    videoCloudFileId = ''
    audioCloudFileId = ''
    imgCloudFileIdList = []
    clearTimeout(timer)
  },
  onLoad(option) {
    console.log('option', option)
    currentTag = option.tag
    this.setData({
      selectedItem: option.tag === 'work' ? '工作' : '生活'
    })
    if(option.readDiary === 'true') {
      this.setData({
        editDiary: false
      })
    }
    // 从日记本页面打开，通过路由传递参数diaryId
    if (option.diaryId) {
      this.setData({ hasTextContent: false })
      let temp = app.globalData.diary[option.year].content[option.month]
      console.log('temp', temp)
      let diaryContent = temp.content[option.diaryId]
      console.log('diaryContent', diaryContent)
      app.globalData.currentDiary = diaryContent
      let tag = diaryContent.tag
      if(tag === 'life') {
        currentTag = 'life'
        this.setData({
          selectedItem: '生活',
          isDisabled: true,
        }) 
      } else if (tag === 'work') {
        currentTag = 'work'
        this.setData({
          selectedItem: '工作',
          isDisabled: true,
        })
      }
      if (diaryContent.video) {
        this.setData({
          src: diaryContent.video,
          video: true
        })
      }
      if (diaryContent.images.length !== 0) {
        this.setData({
          imageList: diaryContent.images,
          photo: true
        })
      }
      if (diaryContent.audio) {
        wx.showLoading({
          title: '加载中...',
        })
        wx.cloud.downloadFile({
          fileID: diaryContent.audio,
          success: res => {
            this.setData({
              audioTempFilePath: res.tempFilePath,
              audio: true,
              hasRecord: true,
              playing: false,
              formatedRecordTime: diaryContent.audioPlayTime
            })
            wx.hideLoading()
          }
        })
      }
      if (diaryContent.content) {
        this.setData({
          inputContent: diaryContent.content,
          hasTextContent: true
        })
      }
    }
    // camera传第参数app.globalData.cameraImageList
    if (app.globalData.cameraImageList.length > 0) {
      this.setData({
        photo: true,
        imageList: app.globalData.cameraImageList
      })
    }
    if (app.globalData.videosrc !== '') {
      this.setData({
        video: true,
        src: app.globalData.videosrc,
      })
    }
    if (option.audio) {
      this.openAudioPannel()
    } else if (option.edit && !this.data.isDisabled) {
      //拉起虚拟键盘
      this.setData({
        focus: true
      })
    }
    // 皮肤设置
    if (app.globalData.darkMode) {
      this.setData({
        darkMode: "#26272A",
        optionbackground: '#26272A',
        color: '#FFFFFF',
        saveStyle: 'save-darkmode',
        mideaStyle: 'midea-darkmode',
        hoverStyle: 'save-hover-darkmode'
      })
    } else {
      this.setData({
        darkMode: "",
        optionbackground: '#EDECE8',
        saveStyle: '',
        mideaStyle: '',
        hoverStyle: 'save-hover'
      })
    }
  },
  onShow() {
    if (this.data.imageList.length === 0) {
      this.setData({
        photo: false
      })
    }

  },
  openAudioPannel() {
    if(this.data.audio) return
    wx.showToast({
      title: '开始录音',
      icon: 'none'
    })
    if (!this.data.audio) {
      this.setData({
        audio: true
      })
      this.startRecord()
    }
  },
  deleteAudio() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除此录音吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            audio: false,
            recording: false,
            playing: false,
            hasRecord: false,
            audioTempFilePath: '',
            formatedRecordTime: util.formatTime(0),
            recordTime: 0,
            playTime: 0
          })
        } else if (res.cancel) {
          return false;
        }
      }
    })
  },
  startRecord() {
    this.setData({ recording: true })
    const that = this
    const options = {
      duration: 600000,// 10 minutes
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    }
    recorderManager.start(options)
    recorderManager.onStart(() => {
      recordTimeInterval = setInterval(() => {
        const recordTime = that.data.recordTime += 1
        that.setData({
          formatedRecordTime: util.formatTime(that.data.recordTime),
          recordTime
        })
      }, 1000)
    })
  },
  stopRecord() {
    const that = this
    recorderManager.stop()
    clearInterval(recordTimeInterval)
    recorderManager.onStop((res) => {
      that.setData({
        audioTempFilePath: res.tempFilePath,
        hasRecord: true,
        formatedPlayTime: util.formatTime(that.data.playTime),
        recording: false
      })
      clearTimeout(timer)
    })
  },
  stopRecordUnexpectedly() {
    const that = this
    recorderManager.stop()
    recorderManager.onStop((res) => {
      clearInterval(recordTimeInterval)
      that.setData({
        recording: false,
        hasRecord: false,
        recordTime: 0,
        audio: false,
        formatedRecordTime: util.formatTime(0)
      })
    })
  },
  playVoice() {
    const that = this
    playTimeInterval = setInterval(function() {
      const playTime = that.data.playTime + 1
      that.setData({
        formatedPlayTime: util.formatTime(playTime),
        playTime
      })
    }, 1000)
    audioContext.src = this.data.audioTempFilePath
    audioContext.play()
    audioContext.onPlay(() => {
      that.setData({ playing: true })
    })
    audioContext.onEnded(() => {
      clearInterval(playTimeInterval)
      const playTime = 0
      this.setData({
        playing: false,
        formatedPlayTime: util.formatTime(playTime),
        playTime
      })
    })
  },
  pauseVoice() {
    clearInterval(playTimeInterval)
    audioContext.pause()
    audioContext.onPause(() => {
      this.setData({ playing: false })
    })
  },
  stopVoice() {
    clearInterval(playTimeInterval)
    audioContext.stop()
    audioContext.onStop(() => {
      this.setData({
        playing: false,
        formatedPlayTime: util.formatTime(0),
        playTime: 0
      })
    })
  },
  saveInputContentToData(e) {
    this.setData({
      inputContent: e.detail.value
    })
  },
  saveInputContent() {
    const that = this
    let saveTime = new Date()
    let year = saveTime.getFullYear()
    let month = saveTime.getMonth() + 1
    let stamp = saveTime.getTime()
    let weekDay = util.getWeek()
    let clockTime = util.getClockTime()
    let day = saveTime.getDate()
    const content = db.collection('content')
    return new Promise((resolve, reject) => {
      content.add({
        data: {
          content: that.data.inputContent,
          images: imgCloudFileIdList,
          video: videoCloudFileId,
          audio: audioCloudFileId,
          tag: currentTag,
          clock: clockTime,
          week: weekDay,
          day: day,
          year: year,
          month: month,
          audioPlayTime: that.data.formatedRecordTime,
          stamp: stamp,
          garbage: 0
        }
      })
    })
  },
  saveAudio() {
    var stamp = this.getCurrentStamp()
    var filePath = this.data.audioTempFilePath
    var cloudPath = ''
    if (filePath) { cloudPath = stamp + filePath.match(/\.[^.]+?$/)[0] }
    return new Promise((resolve, reject) => {
      if (cloudPath) {
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
        }).then(res => {
          console.log(res)
          audioCloudFileId = res.fileID
          resolve(res)
        }, err => {
          reject(error)
        })
      } else {
        resolve("no audio")
      }
    })
  },
  saveVideo() {
    var stamp = this.getCurrentStamp()
    var filePath = this.data.src
    var cloudPath = ''
    if (filePath) { cloudPath = stamp + filePath.match(/\.[^.]+?$/)[0] }
    return new Promise((resolve, reject) => {
      if (cloudPath) {
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log(res)
            videoCloudFileId = res.fileID
            resolve(res)
          },
          fail: error => {
            reject(error)
          }
        })
      } else {
        resolve("no video")
      }
    })
  },
  saveImage() {
    var stamp = this.getCurrentStamp()
    var paths = this.data.imageList
    var len = this.data.imageList.length
    return new Promise((resolve, rejecte) => {
      if (len > 0) {
        const promises = paths.map((filePath, index) => {
          var cloudPath = stamp + [index] + filePath.match(/\.[^.]+?$/)[0]
          return wx.cloud.uploadFile({
            cloudPath,
            filePath,
          }).then(res => {
            imgCloudFileIdList[index] = res.fileID
          })
        })
        Promise.all(promises).then(res => {
          console.log(res)
          resolve(res)
        })
      } else {
        resolve("no image")
      }
    })
  },
  getCurrentStamp() {
    stamp = +new Date()
    return stamp.toString()
  }
})