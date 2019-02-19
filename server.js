const specialLogger = require('./lib/logger/service/logger')(__filename).specialLogger;
const MqttService = require("./lib/mqttService");
const mqttServer = new MqttService();
process.mqttServer = mqttServer
