const aRoute = require('./aaaaa')
const missRoute = require('./missRoute')
const doHandler = function(packet, client, next) {
    try {
        let {
            topic
        } = packet
     
        const req = JSON.parse(packet.payload.toString())
        const pathAry = req.body.route.split('/')
        if(pathAry.length === 2) {
            req.body.route = req.body.route + '/'
        }
        const path1 = pathAry[1]
            switch (path1) {
                case 'aaaa':
                    aRoute(req,client,next)
                    break;
                case 'disconnect':
                    // TODO 客户端断连时逻辑
                break;
                default:
                    missRoute(req, client.id, next)
            }
    } catch (e) {
        console.log(e)
    }
  
}
module.exports = doHandler