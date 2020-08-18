const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return db.collection('content').where({
    _openid: wxContext.OPENID,
    garbage: _.neq(0)
  }).get()
}