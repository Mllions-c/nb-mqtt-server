/**
 *author:huanyindeng
 *date:2/12/2019
 *description:log4js console datefile
 */
module.exports=(fileName)=>{
    const logs=require("../model/log");
    //init(serverId),其中serverId需要根据项目动态添加，下处使用时还需添加变量serverId
    logs.init("test_server");
    return {
        commonLogger: logs.getLogger("common", fileName),
        specialLogger  : logs.getLogger("special", fileName)
    };
};