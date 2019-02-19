const topics = {
    GLOBAL_PUSH: 'global_push',
    GLOBAL_REQ: 'global_req',
    SINGLE_PUSH_PRE: 'single_push_server2',
    ID:'moiot',
    WILL: {
        resQos: 0,
        msg: 'connection Closed',
        route: '/disconnect'
    }
}

module.exports = topics;