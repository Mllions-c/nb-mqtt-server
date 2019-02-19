const checkRequest = function(packet, client,next) {
    try {
    const req = JSON.parse(packet.payload.toString())
    console.log("[request]", req);
    next()
    } catch (e) {
        console.log(e)
    }
    
}
const checkResponse = function(packet, client,next, res) {
    try {
        console.log("[response]", res);
        process.mqttServer.response(res).then()
        next()
    } catch (e) {
        console.log(e)
    }
    
}
module.exports = {
    checkRequest: checkRequest,
    checkResponse: checkResponse
}