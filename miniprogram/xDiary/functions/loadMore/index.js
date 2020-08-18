const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('content').where({
    _openid: wxContext.OPENID,
    garbage: _.eq(0),
    tag: event.tag
  })
    .orderBy('stamp', 'desc')
    .skip(event.diaryCount)
    .limit(10)
    .get()
}