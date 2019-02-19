const mqtt = require('mqtt');
const EventEmitter = require('events').EventEmitter;
const TOPICS = require('./topics');
/**
 * MqttClient类会自动做以下处理
 * 到服务器的定时HeartBeat或ping
 * 自动重连
 */
class MqttClient {
    constructor(host, port, username, password) {
        const clientId = 'mqttjs_' + username;
        const options = {
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            host: host,
            port: port,
            username: username,
            password: password,
            clientId: clientId,
            rejectUnauthorized: false,
            // will: { // 重连失败时发送消息内容
            //     topic: TOPICS.GLOBAL_REQ,
            //     payload: JSON.stringify({body: TOPICS.WILL}),
            //     qos: 2,
            //     retain: false
            // }
        }
        this.reqId = 0
        this.clientId = clientId;
        this.callbacks = {}
        this.myEvent = Object.create(EventEmitter.prototype)
        this.onPush = this.myEvent.on
        this.client = initClient(clientId, options, this);
    };



    /**
     * 发消息
     * options参数
     * @params qos：QoS级别，默认0
     * @params  retain：retain标识，默认false
     * */
    request(topic, body, cb) {
        const self = this
        if (!body || !body.route) {
            throw new Error('params is required')
        }
        let {
            qos,
            retain
        } = body
        let reqId = ++this.reqId;
        const msg = JSON.stringify({
            body,
            reqId
        })
        this.client.publish(topic, msg, {
            qos,
            retain
        }, function (err) {
            if (err) {
                console.error("publish error:", err);
            }
        });
        self.callbacks[self.reqId] = cb;
        // 如果服务器响应超时，则删除回调，防止内存泄漏
        setTimeout(function () {
            delete self.callbacks[self.reqId];
        }, 10 * 1000)
    };

    // options {qos:number} default 0
    subscribe(topic, options = {}) {
        const self = this
        return new Promise((resolve, reject) => {
            self.client.subscribe(topic, options, function (err, data) {
                if (err) {
                    return reject(err)
                }
                return resolve(data)
            })
        })
    };

    // 取消订阅
    // unsubscribe(topic) {
    //     const self = this
    //     return new Promise((resolve, reject) => {
    //         self.client.unsubscribe(topic, function(topic, message, packet) {
    //             if (err) reject(err)
    //         })
    //     })
    // };


    // 断开连接
    end() {
        this.client.end();
    };
}

// 私有初始化方法
const initClient = function (clientId, options, self) {
    const client = mqtt.connect(options);
    client.on('connect', function (data) {
        if (data.returnCode === 0) {
            console.log('connect mqtt server success');
            //  options {qos:number} default 0
            const option = {};
            client.subscribe(TOPICS.GLOBAL_PUSH, option, function (err, data) {
                console.log('subscribe:' + TOPICS.GLOBAL_PUSH);
            });
            client.subscribe(TOPICS.SINGLE_PUSH_PRE + clientId, option, function (err, data) {
                if (err) {
                    throw new Error('subscribe SINGLE_PUSH_PRE faild')
                }
                console.log('subscribe:' + TOPICS.SINGLE_PUSH_PRE + clientId);
            });
        } else {
            console.log('connect mqtt data', data);
        }
    });

    client.on('reconnect', function () {
        console.log('mqtt client reconnect sucess')
    });

    client.on('close', function () {
        console.log('mqtt client close')
    });

    client.on('error', function (error) {
        console.log('mqtt client error：', error)
    });

    client.on('message', function (topic, message, packet) {
        message = JSON.parse(message)

        if (!message.reqId) {
            self.myEvent.emit('message', topic, message.body)
            return
        } else {

            let cb = self.callbacks[message.reqId];

            delete self.callbacks[message.reqId];
            if (typeof cb !== 'function') {

                return;
            }

            cb(message.body);
            return
        }
    });
    return client;
};
module.exports = MqttClient;