const specialLogger = require('./logger/service/logger')(__filename).specialLogger;
const str="denghuanyin";
specialLogger.debug('[request]decrypt msg: ', str);