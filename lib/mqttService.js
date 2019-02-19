const mosca = require('moiot-mosca');
const ROLE = require('./role');
const TOPICS = require('./topics');
const redis = require('redis');
const doHandler = require('../routes/index')
let {
    checkRequest,
    checkResponse
} = require('./schemaFilter')
const mqttExpress = require('./onionService')

class MqttServer {
    constructor(storageType = 'redis', config) {
        this.storageType = storageType;
        if (this.storageType === 'mongodb') {
            this.moscaSettings = {
                port: 1883, //mqtt端口
                backend: {
                    //using ascoltatore
                    type: 'mongo',
                    url: 'mongodb://localhost:27017/mqtt',
                    pubsubCollection: 'ascoltatori',
                    mongo: {}
                } //应用上在的pub/set
            }
        } else {
            this.moscaSettings = {
                id: TOPICS.ID,
                port: 1884,
                backend: {
                    type: 'redis',
                    redis: redis,
                    db: 0,
                    port: 6379,
                    return_buffers: true, // 处理二进制的payload
                    host: "localhost"
                },
                persistence: {
                    factory: mosca.persistence.Redis,
                    ttl: {
                        subscriptions: 60 * 1000,
                        packets: 60 * 1000
                    }
                }
            }
        }

        if (!!config) {
            this.moscaSettings = config;
        }

        this.server = initServer(this.moscaSettings);
    }

    response(message) {
        // broker消息格式
        // const message = {
        //     topic: '/hello/world',
        //     payload: 'abcde', // or a Buffer
        //     qos: 0, // 0, 1, or 2
        //     retain: false // or true
        // };
        try {
            const self = this
            return new Promise((resolve, reject) => {
                self.server.publish(message, function () {
                    return resolve(true)
                });
            })
        } catch (error) {
            console.log(error)
        }
    }


}

const initServer = function (moscaSettings) {
    // 连接鉴权 TODO need load data from db
    const authenticate = function (client, username, password, callback) {
        const usersData = require('../config/users.json');
        let authResult = true;
        if (!!usersData[username]) {
            if (usersData[username].pwd === password.toString()) {
                authResult = true;
                client.user = username;
                client.role = usersData[username].role;
            } else {
                authResult = false;
            }
        } else {
            authResult = false;
        }
        if (authResult == true) {
            console.log("connect auth success:", `user:${client.user} | role:${client.role} | username: ${username} | password: ${password}`)
        } else {

        }
        callback(null, authResult);
    };

    // 发布鉴权 TODO 普通用户没有想全局推送频道发送消息的权限
    const authorizePublish = function (client, topic, payload, callback) {
        //全局推送不需要鉴权 
        if (topic === TOPICS.GLOBAL_REQ && client.id !== null) {
            callback(null, true);
            return;
        }
        // server不能用 req
        if(topic === TOPICS.GLOBAL_PUSH && client.id === null) {
            callback(null, true)
        }
        if (client.role === ROLE.ADMIN) {
            callback(null, true);
        }
        console.log(`publish auth faild to topic:${topic}:clientId `, client.id);
        callback(null, false);
    };

    // 订阅鉴权
    const authorizeSubscribe = function (client, topic, callback) {
        //全局订阅不需要鉴权
        if (topic === TOPICS.GLOBAL_PUSH) {
            callback(null, true);
            return;
        }

        if (client.role !== ROLE.ADMIN) {
            if (topic === TOPICS.SINGLE_PUSH_PRE + client.id) {
                callback(null, true);
                return;
            }
        } else {
            callback(null, true);
            return;
        }

        console.log("subscribe auth faild to topic: ", topic);
        callback(null, false);
        return;
    };

    // 转发授权 用于授权转发数据包到客户端的功能。此默认实现为任何客户端授权任何数据包。
    const authorizeForward = function (client, packet, callback) {
        // 例子
        // if (packet.topic==='xxx'&&client.id==="I should not see this") {
        //     callback(null, false);
        //     return 
        // }
        callback(null, true);
        console.log("Forward auth success to clientId:", client.id);
    };

    const server = new mosca.Server(moscaSettings);
    // 服务启动触发
    server.on('ready', function () {
        console.log('server start success');
    });

    server.authenticate = authenticate;
    server.authorizePublish = authorizePublish;
    server.authorizeSubscribe = authorizeSubscribe;
    server.authorizeForward = authorizeForward;

    server.on('clientConnected', function (client) {
        console.log('Client Connected:', `clientId: ${client.id}`);
    });

    server.on('clientDisconnected', function (client) {
        console.log('Client Disconnected:', `clientId: ${client.id}`);
    });

    server.on('subscribed', function (topic, client) {
        console.log(`Client subscribed success to topic:${topic}:clientId:`, client.id);
    });

    server.on('unsubscribed', function (topic, client) {
        console.log('Client unsubscribed:==========', topic, client.id);
    });
    server.on('published', function (packet, client) {
        // 转到路由层
        try {
            // 过滤掉系统事件和服务端自己的响应
            if (packet.topic.split('/')[0] === '$SYS' || client === null) {
                return null
            }
            const app = mqttExpress()
            app.use(checkRequest)
            app.use(doHandler)
            app.use(checkResponse)
            app.do(packet, client)
        } catch (e) {
            console.log(e)
        }

    });

    return server;
};


module.exports = MqttServer;