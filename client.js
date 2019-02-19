const MqttClient = require('./lib/mqttClient');
let mqttClient = new MqttClient('localhost', 1884, 'abc', '123abc');
const body = {
    qos: 2,
    resQos: 0,
    retain: false,
    msg: 'blablabla',
    route: '/aaaa'
}
console.log('==========客户端发送请求')
mqttClient.request('global_req', body,function(data) {
    console.log('=========客户端收到的响应',data)
})

/**
 * 监听push消息
 */
mqttClient.onPush('message', function(topic, body) {
    // TODO 这里
    console.log('监听到了push的消息')
})