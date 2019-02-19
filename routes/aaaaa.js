const missRoute = require('./missRoute')
const {
    homeService,
    a1Service
} = require('../service/aaaaa')
const aRoute = function (req, client,next) {
    const pathAry = req.body.route.split('/')
    const path = pathAry[2]
    switch (path) {
        case '1':
            a1Service(req, client, next)
            break;
        case '':
            homeService(req, client, next)
        break;
        default:
            missRoute(req, client.id, next)
    }
   
}
module.exports = aRoute