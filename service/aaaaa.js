
const TOPICS = require('../lib/topics');
const a1Service = function (req, client,next) {
    const msg = JSON.stringify({body: 'i am a a1Service', reqId: req.reqId})
     const message = {
        topic: TOPICS.SINGLE_PUSH_PRE + client.id,
        payload: msg, // or a Buffer
        qos: 2, // 0, 1, or 2
        retain: false // or true
    };
    next(message)
}

const homeService = function (req, client,next) {
    const msg = JSON.stringify({body: 'i am a homeService', reqId: req.reqId})
     const message = {
        topic: TOPICS.SINGLE_PUSH_PRE + client.id,
        payload: msg, // or a Buffer
        qos: 2, // 0, 1, or 2
        retain: false // or true
    };
    next(message)
}
module.exports = {
    a1Service: a1Service,
    homeService:homeService
}