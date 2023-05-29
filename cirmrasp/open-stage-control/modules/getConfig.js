app.on('sessionOpened',  (data, client) => {
  const
    palettes = loadJSON('../config.json')
  ;

  // Palettes tab.
  let switchObject = {};
  compositions.forEach((p, i) => {
    switchObject[p.name] = i
  })
  receive('/EDIT', 'compoSwitch', {
    'values': switchObject,
    'gridTemplate': 6,
    'address': '/compoSwitch',
    'preArgs': `[@{this.value}]`
  }, {clientId: client.id});
});
module.exports = {

    oscInFilter:function(data){

        var {address, args, host, port} = data

        if (address === '/some_address') {

            args[0].value = args[0].value * 10

        }

        return {address, args, host, port}

    },

    oscOutFilter:function(data){

        var {address, args, host, port, clientId} = data

        if (address === '/some_address') {

            args[0].value = args[0].value / 10

        }

        return {address, args, host, port}
    }

}
