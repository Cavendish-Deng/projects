const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  console.log(event.itemId)
  return db.collection('content').doc(event.itemId).update({
    data: {
      garbage: _.inc(-1)
    }
  })
}