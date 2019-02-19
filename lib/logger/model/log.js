/**
 *author:huanyindeng
 *date:2/12/2019
 *description:log4js console datefile
 */
const log4js=require('log4js');
const log=module.exports;

const colorizeStart =(style)=> {
    return style ? '\x1B[' + styles[style][0] + 'm' : '';
};

const colorizeEnd =(style)=> {
    return style ? '\x1B[' + styles[style][1] + 'm' : '';
};

const colorize =(str, style)=> {
    return colorizeStart(style) + str + colorizeEnd(style);
};

const styles = {
    'bold': [1, 22],
    'italic': [3, 23],
    'underline': [4, 24],
    'inverse': [7, 27],
    'white': [37, 39],
    'grey': [90, 39],
    'black': [90, 39],
    'blue': [34, 39],
    'cyan': [36, 39],
    'green': [32, 39],
    'magenta': [35, 39],
    'red': [31, 39],
    'yellow': [33, 39]
};

const colours = {
    'all': "grey",
    'trace': "blue",
    'debug': "cyan",
    'info': "green",
    'warn': "yellow",
    'error': "red",
    'fatal': "magenta",
    'off': "grey"
};

log.init=(serverId)=>{
    const config={
        "appenders":[
            {
                "type":"console"
            },
            {
                "type":"dateFile",
                "filename":"./lib/logs/common/${opts:serverId}-",
                "alwaysIncludePattern":true,
                "pattern":"yyyyMMdd.log",
                "category":"common"
            },
            {
                "type":"dateFile",
                "filename":"./lib/logs/special/${opts:serverId}-",
                "alwaysIncludePattern":true,
                "pattern":"yyyyMMdd.log",
                "category":"special"
            }
        ],
        "levels":{
            "common":"all",
            "special":"all"
        },
        "replaceConsole":true
    };
    const arr = config.appenders;
    for (let i = 0, len = arr.length; i < len; i++) {
        if (!!arr[i].filename) {
            arr[i].filename = arr[i].filename.replace('${opts:serverId}', serverId);
        }
    }
    log4js.configure(config);
};

log.getLogger=(logType,filename)=>{
    const logger=log4js.getLogger(logType);
    const newLogger={};
    for(const key in logger){
        newLogger[key]=logger[key];
    }
    const index = filename.indexOf("webserver");
    const length=filename.length;
    filename=filename.substring(index+10,length);
    const rank=['trace','debug','info','warn','error','fatal'];
    for(let i=0,len=rank.length;i<len;i++){
        const filenamePrefix = colorize("[" + filename + "]", colours[rank[i]]);
        newLogger[rank[i]] = function () {
            arguments[0] = filenamePrefix + arguments[0];
            logger[rank[i]].apply(logger, arguments);
        };
    }
    return newLogger;
};


