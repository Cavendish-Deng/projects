App({
  onLaunch: function() {
    wx.cloud.init({
      // env: 'final-703458-5d0a12',
      traceUser: true
    })
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '新版本下载失败',
        icon: 'none'
      })
    })
  },
  globalData: {
    currentDiary: '',
    audioPath: '',
    videosrc: '',
    colorMode: '',
    darkMode: false,
    diary: [],
    cameraImageList: [],
    allImages: []
  }
})