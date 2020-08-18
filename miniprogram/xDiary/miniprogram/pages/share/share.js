
let app = getApp()
let tempFilePath
Page({
  data: {
    QRurl: ''
  },
  saveSharePhoto() {
    const that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.QRurl,
      success(res) {
        wx.showToast({
          title: '图片已保存到相册',
          icon: 'none'
        })
      }
    })
  },
  onLoad() {
    console.log(app.globalData.currentDiary._id)
    const that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
            }
          })
        }
      }
    })
    wx.showLoading({
      title: '正在生成图片',
    })
    const ctx = wx.createCanvasContext('shareCanvas')
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, 300, 400)
    // ctx.drawImage(tempFilePath, 50, 110, 10, 10)
    ctx.setFontSize(18)
    ctx.setFillStyle('white')
    ctx.setFillStyle('#26272A')
    ctx.setTextAlign('center')
    ctx.fillText('今天的我', 150, 40)
    ctx.fillText('长按查看详情', 150, 360)
    ctx.draw()
    wx.hideLoading()
    // wx.cloud.callFunction({
    //   name: 'qrCode'
    // }).then(res => {
    //   wx.cloud.downloadFile({
    //     fileID: res.result.fileID
    //   }).then(res => {
    //     console.log(res.tempFilePath)
    //     tempFilePath = res.tempFilePath
        
    //     wx.canvasToTempFilePath({
    //       x: 0,
    //       y: 0,
    //       width: 545,
    //       height: 771,
    //       destWidth: 545 * 2,
    //       destHeight: 771 * 2,
    //       canvasId: 'shareCanvas',
    //       success(res) {
    //         that.setData({
    //           QRurl: res.tempFilePath
    //         })
            
    //       }
    //     })
    //   })
    // })
  }
})