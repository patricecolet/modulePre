module.exports = {

    oscInFilter:function(data){

        var {address, args, host, port} = data

        if (address === '/some_address') {
            address = '/fader_1'
        }

        return {address, args, host, port}

    },

    oscOutFilter:function(data){

        var {address, args, host, port, clientId} = data

        if (address === '/fader_1') {
            address = '/some_address'
        }

        return {address, args, host, port}
    }

}
