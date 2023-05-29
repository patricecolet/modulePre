var path = nativeRequire('path')
const moduleStates = [{}];
const  config = loadJSON('../config.json');


let l = config.computerInfo.length;
let d = new Date();
let date = d.getTime();
for (let i = 0; i < l; i ++) {
	moduleStates[i] = {"state":0,"date":date-10000};
}
app.on('sessionOpened',  (data, client) => {
//	const  config = loadJSON('../config.json');
	let err = "";
	var info = "empty";
	try {
		compo = config.compositions;
		err = ": config.json is okay";
 	}
	catch (e) {
		err = ": config.json is malformed: " + e.message;
	}
//	var switchHeight = Object.keys(compo).length * 40;
	var compoTabs = [];
	compo.forEach((p, i) => {
		let trackConfig = "empty";
		let settings = "empty";
		let compoPath = "/home/pi/modulePre/PureData/compositions/" + p.title + "/trackConfig.json";
		//var test = path.dirname(compoPath);
        try {
//                info += "trackConfig: " + trackConfig.globalSettings + "\n";
		trackConfig = loadJSON(compoPath);
                err += p.title+ ": JSON is okay\n";

        }
        catch (e) {
                err += p.title+ ": " + e.message + "\n";
        }
		compoTabs[i] = {
        "type": "tab",
        "lock": false,
        "id": p.title,
        "visible": true,
        "interaction": true,
        "comments": "",
        "colorText": "auto",
        "colorWidget": "auto",
        "colorFill": "auto",
        "borderRadius": "auto",
        "padding": "auto",
        "html": "",
        "css": "",
        "colorBg": "auto",
        "layout": "default",
        "justify": "start",
        "gridTemplate": "",
        "contain": true,
        "scroll": true,
        "innerPadding": true,
        "tabsPosition": "top",
        "label": p.title,
        "variables": "@{parent.variables}",
        "traversing": false,
        "value": "",
        "default": "",
        "linkId": "",
        "address": "auto",
        "preArgs": "",
        "typeTags": "",
        "decimals": 2,
        "target": "",
        "ignoreDefaults": false,
        "bypass": false,
        "onCreate": "",
        "onValue": "",
        "widgets": [
      {
        "type": "fragment",
        "top": 0,
        "left": 0,
        "lock": false,
        "id": "fragment_1",
        "visible": true,
        "interaction": true,
        "comments": "",
        "width": "1200",
        "height": "800",
        "expand": "false",
        "css": "",
        "file": "../../../PureData/compositions/" + p.title + "/interface.json",
        "fallback": "",
        "props": {},
        "address": "auto",
        "variables": "@{parent.variables}"
      },      {
        "type": "variable",
        "lock": false,
        "id": p.title + "-config",
        "comments": "",
        "value": trackConfig,
        "default": "",
        "linkId": "",
        "address": "auto",
        "preArgs": "",
        "typeTags": "",
        "decimals": 2,
        "target": "",
        "ignoreDefaults": false,
        "bypass": false,
        "onCreate": "",
        "onValue": ""
      }
     ],
        "tabs": []
      }
    })
	receive('/NOTIFY', 'hand',err); 
	receive('/NOTIFY', 'hand',info); 
	receive('/EDIT','Compositions', {
		'tabs' : compoTabs,
	//	'height' : switchHeight
	}, {clientId: client.id});
        receive('/EDIT','config', {
                'value' : config,
        }, {clientId: client.id});

	function updateState() {


		let d = new Date();
		let date = d.getTime();
		moduleStates.forEach((p, i) => {
			if ((date - p.date) > 10000) {
				p.state = 0;
				receive("/EDIT","modules/"+i,{ "colorWidget" : "#aaaaaa" }, {clientId: client.id});
	    		} else {
				p.state = 1;
	                        receive("/EDIT","modules/"+i,{ "colorWidget" : "#aaffaa" }, {clientId: client.id});
			}
		})
	}

        receive('/EDIT',"modules",{ "quantity" : config.computerInfo.length }, {clientId: client.id});
	config.computerInfo.forEach((p, i) => {
		receive('/EDIT',"modules/"+i,{ "label" : p.machineId }, {clientId: client.id});
	})
	setInterval(updateState,5000);
})

module.exports = {

    oscInFilter:function(data){


        var {address, args, host, port} = data

        if (address === '/ping') {
      		let d = new Date();
		let date = d.getTime();
		config.computerInfo.forEach((p, i) => {
    			if (args[0].value == p.machineId) {
      				moduleStates[i].date = date;
    			}
  		})
        }
//receive('/NOTIFY', 'hand',"ping:"+args[0].value);
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
