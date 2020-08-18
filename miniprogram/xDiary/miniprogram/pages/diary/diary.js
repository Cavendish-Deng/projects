const util = require('../../utils/util.js')
let app = getApp();
let timer;
let diaryId
let deletedId
let reverseDiary = []
let deletedItem
const db = wx.cloud.database()
const contentCollection = db.collection('content')
const audioContext = wx.createInnerAudioContext()
const content = db.collection('content')
let isDiaryNoMore = false
let playTimeInterval
let tempFilePath = []
let allDiary = Array(2).fill([])
const date = new Date()
let currentMonth = date.getMonth() + 1
let currentYear = date.getFullYear()
let selectedYear
let lastYear
let selectedMonth
let tempDiary = []
let noMoreWork = false
let noMoreLife = false
let currentIndex = 1
let currentGallery = []
Page({
  data: {
    container: null,
    tag: 'life',
    hasPhoto: false,
    gallery: [],
    lifeTag: true,
    workTag: false,
    transformColor: '#26272A',
    whiteColor: '#fff',
    greyColor: 'EDECE8',
    diaryIndex: ['1'],
    active: 0,
    tipDark: 'noContents-dark',
    tipStyle: 'noContents',
    controlsStyle: 'controls',
    darkControls: 'dark-controls',
    titleYear: 'year',
    titleYearDark: 'dark-year',
    year: 'diary-year',
    darkYear: 'diary-year-dark',
    listWrapper: 'list-wrapper',
    listWrapperDark: 'list-wrapper-dark',
    currentRange: '全部',
    showLoadTips: false,
    hasContents: false,
    pageStyle: 'page-section',
    pageDarkMode: 'page-section-darkmode',
    voiceDarkMode: 'voice-wrapper-darkmode',
    voiceStyle: 'voice-wrapper',
    flex: 'flex',
    audioControls: false,
    formatedRecordTime: '',
    playing: false,
    showAddBtn: true,
    loadTips: '加载中...',
    loadStyle: 'load-more',
    loadDarkMode: 'load-darkmode',
    toggle: false,
    checkedbox: 'checkedbox',
    boxActive: 'box-active',
    darkMode: false,
    plus: 'plus',
    plusDarkMode: 'plus-darkmode',
    addsrc: '../../image/add.png',
    addStyle: 'add',
    addDarkMode: 'add-darkmode',
    diaryCover: '',
    contentStyle: 'content',
    contentDarkMode: 'content-darkmode',
    diary: [],
    closeOption: 50,
    openOption: 13,
    openOptionMiddle: 31,
    show: 1,
    hide: 0,
    hideMaskBg: 'none',
    showMaskBg: 'block',
    closeDeg: 0,
    openDeg: 45,
    flag: true,
    wrapperStyle: 'container',
    wrapperDarkMode: 'container-dark',
    previewDarkMode: 'preview-darkmode',
    preview: 'preview',
    formatedPlayTime: '00:00:00',
    playTime: 0,
    audioTempFilePath: ''
  },
  onClick(e) {
    if (e.detail.index + 1 === currentIndex) return
    if (e.detail.index + 1 == 3) {
      if (this.data.gallery.length == 0) {
        this.setData({
          hasPhoto: true
        })
      }
      console.log('click album')
    }
    currentIndex = e.detail.index + 1
  },
  selectTag() {
    const that = this
    wx.showActionSheet({
      itemList: ['生活', '工作'],
      success(res) {
        if (res.tapIndex == 0) {
          that.setData({
            lifeTag: true,
            workTag: false,
            tag: 'life'
          })
          that.loadContent('life', 0)
        } else {
          that.setData({
            lifeTag: false,
            workTag: true,
            tag: 'work'
          })
          that.loadContent('work', 1)
        }
      }
    })
  },
  onClose(event) {
    const that = this
    const {
      position,
      instance
    } = event.detail;
    switch (position) {
      case 'cell':
        instance.close();
        break;
      case 'right':
        that.deleteDiary(event)
        instance.close();
        break;
    }
  },
  onChangeMonth(event) {
    this.setData({
      diaryIndex: event.detail
    });
  },
  createOption() {
    if (this.data.flag) {
      this.setData({
        flag: false
      })
    } else {
      this.setData({
        flag: true
      })
    }
  },
  hideOption(e) {
    this.setData({
      flag: true
    })
  },
  undo() {
    this.setData({
      flag: true
    })
  },
  goEditAudio() {
    wx.navigateTo({
      url: `/pages/edit/edit?audio=true&tag=${this.data.tag}`
    });
  },
  goToVideo() {
    wx.navigateTo({
      url: `/pages/camera/camera?video=true&tag=${this.data.tag}`
    })
  },
  goToPhoto() {
    wx.navigateTo({
      url: `/pages/camera/camera?tag=${this.data.tag}`
    })
  },
  goEditEdit() {
    wx.navigateTo({
      url: `/pages/edit/edit?edit=true&tag=${this.data.tag}`
    });
  },
  readDiary(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/edit/edit?diaryId=' + e.currentTarget.id + '&readDiary=true&month=' + e.currentTarget.dataset.month + '&year=' + e.currentTarget.dataset.year
    });
  },
  deleteDiary(e) {
    const that = this
    wx.showModal({
      title: '确定要删除吗',
      content: '删除的日记可在回收站找回',
      success(res) {
        if (res.confirm) {
          let temp = app.globalData.diary[e.currentTarget.dataset.year].content
          let monthArr = temp[e.currentTarget.dataset.month]
          deletedId = monthArr.content[e.currentTarget.dataset.id]._id
          // 删除所选的日记
          deletedItem = monthArr.content.splice(e.currentTarget.dataset.id, 1)
          that.setData({
            diary: app.globalData.diary
          })
          // 数据库garbage字段加1，表示用户删除的数据
          wx.cloud.callFunction({
            name: 'addMarkGarbage',
            data: {
              itemId: deletedId
            }
          }).then(res => {
            if (that.data.diary.length === 0) {
              that.setData({
                hasContents: true
              })
            }
          })
        } else if (res.cancel) {
          return
        }
      }
    })

  },
  loadContent(option, number) {
    const that = this
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'loadContent',
      data: {
        tag: option
      }
    }).then(res => {
      console.log(res.result)
      wx.hideLoading()
      // 按年份分类内容
      let tempArr = res.result.data.map((item, index, arr) => {
        let array = arr.filter((v, i, a) => {
          return v.year == item.year
        })
        return {
          year: item.year,
          content: array
        }
      })
      // 数组深度去重
      let obj = {}
      let temp = tempArr.reduce((acc, current) => {
        if (!obj.hasOwnProperty(current.year)) {
          obj[current.year] = true;
          acc.push(current)
        }
        return acc
      }, [])
      // 增加month字段,树结构加深一层
      let temporary = temp.map((item, index, arr) => {
        let arr2 = item.content.map((t, index, ar) => {
          let array = ar.filter((v, i, a) => {
            return v.month == t.month
          })
          return {
            month: t.month,
            stamp: t.stamp,
            content: array
          }
        })
        return {
          year: item.year,
          content: arr2
        }
      })
      // 再次深度去重
      let objArr = []
      allDiary[number] = temporary.map((item, index, arr) => {
        objArr[index] = {}
        let arr3 = item.content.reduce((acc, current, idx) => {
          if (!objArr[index].hasOwnProperty(current.month)) {
            objArr[index][current.month] = true;
            acc.push(current)
          }
          return acc
        }, [])
        return {
          year: item.year,
          content: arr3
        }
      })
      // 增加hasAudio字段到month所处的对象中
      allDiary[number] = allDiary[number].map((item, index, arr) => {
        let newItem = item.content.map((v, id, ar) => {
          let hasAudio = false
          for (let t of v.content) {
            if (t.audio != '') {
              hasAudio = true
              break;
            }
          }
          return {
            content: v.content,
            month: v.month,
            stamp: v.stamp,
            hasAudio: hasAudio
          }
        })
        return {
          year: item.year,
          content: newItem
        }
      })
      // 增加hasAudio字段到year所处的对象中
      allDiary[number] = allDiary[number].map((item, index, arr) => {
        let hasAudio = false
        for (let v of item.content) {
          if (v.hasAudio === true) {
            hasAudio = true
            break;
          }
        }
        return {
          year: item.year,
          hasAudio: hasAudio,
          content: item.content
        }
      })
      app.globalData.diary = allDiary[number]
      currentGallery.splice(0, currentGallery.length)
      app.globalData.diary.forEach((item, index) => {
        item.content.forEach((v, ind) => {
          v.content.forEach(j => {
            currentGallery = currentGallery.concat(j.images)
          })
        })
      })
      this.setData({
        diary: app.globalData.diary,
        gallery: currentGallery
      })
      if (res.result.data.length < 10) {
        isDiaryNoMore = true
      }
      if (this.data.diary.length == 0) {
        this.setData({
          hasContents: true,
          showLoadTips: false
        })
      } else if (this.data.diary.length > 0) {
        if (this.data.hasContents === true) {
          this.setData({
            hasContents: false
          })
        }
      }
      isDiaryNoMore = false
    })
  },
  loadMore(tag) {
    const that = this
    let count = 0
    app.globalData.diary.forEach(item => {
      item.content.forEach(v => {
        count += v.content.length
      })
    })
    wx.cloud.callFunction({
      name: 'loadMore',
      data: {
        diaryCount: count,
        tag: tag
      }
    }).then(res => {
      console.log('res', res.result.data)
      // 计算有多少条内容
      let number = res.result.data.length
      let result = res.result.data
      let temp = JSON.parse(JSON.stringify(app.globalData.diary))
      app.globalData.diary.forEach((item, index) => {
        item.content.forEach((v, id) => {
          result.forEach((j, k) => {
            if (j.year == item.year && j.month == v.month) {
              temp[index].content[id].content.push(j)
            }
          })
        })
      })
      console.log('temp', temp)
      if (number > 0) {
        if (that.data.lifeTag === true) {
          allDiary[0] = temp
          app.globalData.diary = allDiary[0]

        } else if (that.data.workTag === true) {
          allDiary[1] = temp
          app.globalData.diary = allDiary[1]
        }
      }
      // 将图片src整合到一个数组中
      currentGallery.splice(0, currentGallery.length)
      app.globalData.diary.forEach((item, index) => {
        item.content.forEach((v, ind) => {
          v.content.forEach(j => {
            currentGallery = currentGallery.concat(j.images)
          })
        })
      })
      this.setData({
        diary: app.globalData.diary,
        gallery: currentGallery
      })
      // 少于10条
      if (number < 10) {
        isDiaryNoMore = true
        this.setData({
          loadTips: '-- 没有更多了 --'
        })
        if (this.data.workTag === true) {
          noMoreWork = true
        }
        if (this.data.lifeTag === true) {
          noMoreLife = true
        }
      }
    })
  },
  photoPreview(e) {
    console.log(e)
    const that = this
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: that.data.gallery
    })
    // const current = e.currentTarget.dataset.srcarray[e.currentTarget.id]
    // wx.previewImage({
    //   current,
    //   urls: e.currentTarget.dataset.srcarray
    // })
  },
  pauseVoice() {
    clearInterval(playTimeInterval)
    audioContext.pause()
    audioContext.onPause(() => {
      this.setData({
        playing: false
      })
    })
  },
  playVoice() {
    const that = this
    playTimeInterval = setInterval(function () {
      const playTime = that.data.playTime + 1
      that.setData({
        formatedPlayTime: util.formatTime(playTime),
        playTime
      })
    }, 1000)
    audioContext.src = this.data.audioTempFilePath
    audioContext.play()
    audioContext.onPlay(() => {
      that.setData({
        playing: true
      })
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
  play(e) {
    if (this.data.playing === true) {
      wx.showToast({
        title: 'playing',
        icon: 'none'
      })
      this.stopVoice()
    }
    if (typeof (tempFilePath[e.currentTarget.id]) === 'string') {
      console.log(tempFilePath)
      this.setData({
        audioTempFilePath: tempFilePath[e.currentTarget.id],
        formatedRecordTime: e.currentTarget.dataset.playtime,
        formatedPlayTime: util.formatTime(0),
        playTime: 0
      })
      clearInterval(playTimeInterval)
      this.playVoice()
    } else {
      wx.showLoading({
        title: '加载中...',
        icon: 'none'
      })
      const that = this
      wx.cloud.downloadFile({
        fileID: e.currentTarget.dataset.audio,
        success: res => {
          tempFilePath[e.currentTarget.id] = res.tempFilePath
          that.setData({
            audioTempFilePath: res.tempFilePath,
            formatedRecordTime: e.currentTarget.dataset.playtime,
            audioControls: true
          })
          wx.hideLoading()
          that.playVoice()
        }
      })
    }
  },
  saveVideoToLocal(e) {
    wx.showModal({
      title: '提示',
      content: '确定将视频保存到相册吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '保存中...',
          })
          wx.cloud.downloadFile({
            fileID: e.currentTarget.dataset.src
          }).then(res => {
            wx.saveVideoToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '已保存到相册',
                  icon: 'none'
                })
              }
            })
            wx.hideLoading()
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  onShow() {
    timer = setTimeout(() => {
      if (app.globalData.darkMode == true) {
        this.setData({
          darkMode: true,
          addsrc: '../../image/add_dark.png'
        })
      } else if (app.globalData.darkMode == false) {
        this.setData({
          darkMode: false,
          addsrc: '../../image/add.png'
        })
      }
    }, 500)
  },
  onHide() {
    if (this.data.playing) {
      this.stopVoice()
    }
    this.setData({
      flag: true,
      playing: false,
      formatedPlayTime: util.formatTime(0),
      playTime: 0
    })
    if (timer) {
      clearTimeout(timer)
    }
    clearInterval(playTimeInterval)
  },
  onLoad(option) {
    this.loadContent('life', 0)
  },
  onReachBottom() {
    if (tempDiary.length > 0) return
    if (!isDiaryNoMore) {
      this.setData({
        showLoadTips: true
      })
      if (this.data.lifeTag === true) {
        this.loadMore('life')
      } else if (this.data.workTag === true) {
        this.loadMore('work')
      }
    }
  },
  onShareAppMessage(res) {
    return {
      title: '记录生活，留住时光',
      path: '/pages/profile/profile',
      imageUrl: '../../image/time_diary.jpg'
    }
  },
  // onPullDownRefresh() {
  //   if (this.data.tag === 'life') {
  //     this.loadContent('life', 0)
  //   } else {
  //     this.loadContent('work', 1)
  //   }
  // },
})