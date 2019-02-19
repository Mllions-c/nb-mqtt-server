const TOPICS = require('../lib/topics');
const missRoute = function (req, id,next) {
   console.error('============miss route:', req.body.route)
   const msg = JSON.stringify({body: '404 not found', reqId: req.reqId})
   const message = {
      topic: TOPICS.SINGLE_PUSH_PRE + id,
      payload: msg, // or a Buffer
      qos: 1, // 0, 1, or 2
      retain: false // or true
  };
  next(message)
}
module.exports = missRoute