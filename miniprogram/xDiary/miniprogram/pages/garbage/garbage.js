let deleledDiary
let app = getApp()
let rostoreItem
let timer
Page({
  data: {
    listWrapper: 'list-wrapper',
    listWrapperDark: 'list-wrapper-dark',
    isNoContent: false,
    wrapperStyle: 'container',
    wrapperDarkMode: 'container-dark',
    darkMode: false,
    diaryList: []
  },
  restoreDiary(e) {
    const that = this
    rostoreItem = deleledDiary[e.currentTarget.id]
    wx.showModal({
      title: '提示',
      content: '确定要永久删除或还原吗？',
      success(res) {
        if(res.confirm) {
          wx.showModal({
            title: '提示',
            content: '删除的日记只保存7天哦！',
            cancelText: '永久删除',
            cancelColor: '#C62F2F',
            confirmText: '还原',
            success(res) {
              if (res.confirm) {
                deleledDiary.splice(e.currentTarget.id, 1)
                if (deleledDiary.length == 0) {
                  that.setData({
                    isNoContent: true,
                    diaryList: deleledDiary
                  })
                } else if (deleledDiary.length > 0) {
                  that.setData({
                    diaryList: deleledDiary,
                    isNoContent: false
                  })
                }
                wx.cloud.callFunction({
                  name: 'restoreDiary',
                  data: {
                    itemId: rostoreItem._id
                  }
                })
              } else if (res.cancel) {
                deleledDiary.splice(e.currentTarget.id, 1)
                wx.cloud.callFunction({
                  name: 'deleteDiary',
                  data: {
                    itemId: rostoreItem._id
                  }
                })
                if (deleledDiary.length == 0) {
                  that.setData({
                    isNoContent: true,
                    diaryList: deleledDiary
                  })
                } else if (deleledDiary.length > 0) {
                  that.setData({
                    diaryList: deleledDiary,
                    isNoContent: false
                  })
                }
              }
            }
          })
        }else if(res.cancel) {
          return
        }
      }
    })
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'loadDeletedContent'
    }).then(res => {
      wx.hideLoading()
      deleledDiary = res.result.data.reverse()
      if (res.result.data.length == 0) {
        this.setData({
          isNoContent: true
        })
        return
      }
      this.setData({
        diaryList: deleledDiary,
        isNoContent: false
      })
    })
  },
  onShow: function () {
    timer = setTimeout(() => {
      if (app.globalData.darkMode == true) {
        this.setData({
          darkMode: true
        })
      } else if (app.globalData.darkMode == false) {
        this.setData({
          darkMode: false
        })
      }
    }, 500)
  },
  onHide: function () {
    clearTimeout(timer)
  }
})