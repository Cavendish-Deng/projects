const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('content').where({
    _openid: wxContext.OPENID,
    garbage: _.eq(0),
    tag: _.eq(event.tag)
  }).orderBy('stamp', 'desc').limit(10).get()
}