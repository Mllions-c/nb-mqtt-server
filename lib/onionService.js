const mqttExpress = function () {

    let funcs = []; // 待执行的函数数组

    let app = function (packet, client) {
        let i = 0;

        function next(msg) {
            let task = funcs[i++]; // 取出函数数组里的下一个函数
            if (!task) { // 如果函数不存在,return
                return;
            }
            task(packet, client, next, msg); // 否则,执行下一个函数
        }
        next();
    }

    /**
     * use方法就是把函数添加到函数数组中
     * @param task
     */
    app.use = function (task) {
        funcs.push(task);
    }
    /**
     * 执行
     * @param task
     */
    app.do = function (packet, client) {
        app(packet, client)
    }
    return app; // 返回实例
}
module.exports = mqttExpress