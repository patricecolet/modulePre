module.exports = function (machines, trackConfig, interface, projectPath,localIpAddress) {
	const fs = nativeRequire('fs');
	const path = nativeRequire('path')
    const debugState = 0;
    function debug(message) {
	    if (debugState) receive('/NOTIFY', 'hand', message);
    }
	const fragmentsDir = 'fragments/'
	let widgetModule = interface.widget;
	let objects = trackConfig[interface.objects];
	let o = [];
	let id = [];
	let ip = [];
	let interfaceSize = 0;
	let fragment= {}
	switch (widgetModule) {
		case "loader":
		o.push({ "type": "hello module!" });
		case "faderMatrix":
		objects.forEach((object, i) => {
			if (object.Group === interface.group) {
				interfaceSize += 1;
				id.push(object.computerID);
				machines.forEach((machine, i) => {
					if (machine.machineId === object.computerID) {
						ip.push("\"" + machine.ipAddress + "\"");
					}
				});
			}
		});
		o.push(
			{
				"type": "text",
				"top": interface.top,
				"left": interface.left,
				"id": interface.name + "Title",
				"width": interfaceSize * 60,
				"height": 20,
				"value": interface.name
			},
			{
				"type": "matrix",
				"top": interface.top + 20,
				"left": interface.left,
				"id": interface.name + "Matrix",
				"width": interfaceSize * 60,
				"height": 280,
				"innerPadding": false,
				"variables": "@{parent.variables}",
				"traversing": false,
				"widgetType": "fragment",
				"quantity": interfaceSize,
				"props": "JS{{\n\
					let p = {};\n\
					p.file=\"" + fragmentsDir + "channelStrip.json\"\n\
					let id=["+ id + "];\n\
					let ip=["+ ip + "];\n\
					let v={};\n\
					let pr={};\n\
					v.module=id[$];\n\
					v.ip=ip[$];\n\
					v.n=$;\n\
					v.name=\""+ interface.name + "\";\n\
					pr.variables = v;\n\
					p.props = pr;\n\
					return p}}"
				});
				break;
		case "master":
			o.push({
				"type": "text",
				"top": interface.top,
				"left": interface.left,
				"id": interface.name + "Title",
				"width": interface.width,
				"height": 30,
				"value": interface.name
			},
			{
				"type": "fader",
				"top": interface.top + 30,
				"left": interface.left,
				"id": interface.name + "Fader",
				"width": interface.width,
				"height": interface.height,
				"design": "default",
				"pips": "true",
				"range": "{\"min\": {\"-inf\": 0},\
				\"25%\": 50,\"50%\": 80,\"75%\": 100,\
				\"max\": {\"+inf\": 127}}",
				"decimals": 0,
				"target": "localhost:4000",
				"address": "/broadcast",
				"preArgs": "/volume",
				"onValue": "setVar('" + interface.name + "Value'\
					,'level', value)",
				"default": 100
			},
			{
				"type": "text",
				"top": interface.height + interface.top + 30,
				"left": interface.left,
				"id": interface.name + "Value",
				"width": interface.width,
				"height": 30,
				"decimals": 0,
				"value": "VAR{level,100}"
			},
			{
				"type": "button",
				"top": interface.height + interface.top + 60,
				"left": interface.left,
				"id": interface.name + "Mute",
				"width": interface.width,
				"height": 30,
				"label": "mute",
				"mode": "toggle",
				"target": "localhost:4000",
				"address": "/broadcast",
				"preArgs": "/mute"
			});
			break;
		case "switch":
			let switchValues = [];
			let defaultValue = objects[0].title
			let index = 0;
			objects.forEach((object, i) => {
				switchValues.push(object.title)
				index += 1;
			});
			o.push(
				{
					"type": "text",
					"top": interface.top,
					"left": interface.left,
					"id": interface.name + "_title",
					"width": interface.width - 30,
					"height": 30,
					"value": interface.name
				},
				{
					"type": "switch",
					"top": interface.top + 30,
					"left": interface.left,
					"id": interface.name + "_switch",
					"width":  interface.width,
					"height": 30 * index,
					"default": 0,
					"values": "#{\n\
						OSC{values} ||"  + JSON.stringify(switchValues) + "\n\
					   }",
					"default": defaultValue,
					"address": "/" + interface.name + "_switch",
					"target": "localhost:5000",
					"onValue": ""
				},
				{
					"type": "modal",
					"top": interface.top,
					"left": interface.left + interface.width - 30,
					"id": interface.name + "_edit",
					"label": "+",
					"mode": "tap",
					"width":  30,
					"height": 30,
					"onValue": "",
					"widgets":
					[
						{
							"type" : "clone",
							"left" : 10,
							"top" : 10,
							"widgetId": interface.name + "_switch"
						},
						{
							"type" : "button",
							"label" : "Add",
							"mode" : "tap",
							"left" : 130,
							"top" : 10,
							"onValue" : "let presetName = get('" + interface.name + "_input')\n\
								let switchValues = getProp('" + interface.name + "_switch','values')\n\
								switchValues.push(presetName)\n\
								console.log(switchValues)\n\
								send('localhost:5000','/" + interface.name + "_switch/values',switchValues)\n\
							"
						},
						{
							"type" : "button",
							"label" : "Remove",
							"mode" : "tap",
							"left" : 230,
							"top" : 10
						},
						{
							"type" : "button",
							"label" : "Rename",
							"mode" : "tap",
							"left" : 330,
							"top" : 10
						},
						{
							"type" : "input",
							"id" : interface.name + "_input",
							"value" : "Preset Name",
							"left" : 210,
							"top" : 110,
							"width" : 100,
							"height" : 50
						}
					]
				});
			break;
		case "hexagone":
			o.push(
			{
				"type": "svg",
				"top": interface.top,
				"left": interface.left,
				"id": interface.name + "SVG",
				"width": 220,
				"height": 200,
				"svg": "<g\n     inkscape:groupmode=\"layer\"\n     id=\"c\"\n\
				inkscape:label=\"c\"\n     style=\"display:inline\">\n    <path\n       sodipodi:type=\"star\"\n\
				style=\"fill:VAR{cFill, \"none\"};\
				fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:5.66929;stroke-linejoin:round;stroke-miterlimit:4;\
				stroke-dasharray:none;stroke-opacity:1\"\n       id=\"path1639\"\n       inkscape:flatsided=\"true\"\n\
				sodipodi:sides=\"6\"\n       sodipodi:cx=\"150.86665\"\n       sodipodi:cy=\"154.45871\"\n \
				sodipodi:r1=\"72.400345\"\n       sodipodi:r2=\"62.700539\"\n       sodipodi:arg1=\"1.0516502\"\n\
				sodipodi:arg2=\"1.575249\"\n       inkscape:rounded=\"0\"\n       inkscape:randomized=\"0\"\n\
				d=\"m 186.78728,217.31981 -72.39962,-0.32237 -35.920634,-62.8611 36.478994,-62.538733 72.39963,0.322373 35.92063,62.8611 z\"\n\
				transform=\"matrix(0.52674048,0,0,0.52674048,20.418143,11.444109)\" />\n  </g>\n  <g\n\
				inkscape:groupmode=\"layer\"\n     id=\"se\"\n     inkscape:label=\"se\"\n     style=\"display:inline\">\n\
				<path\n       id=\"rect2351\"\n       style=\"fill:VAR{seFill, \"none\"};\
				fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:3.07395;stroke-linejoin:round\"\n\
				d=\"m 139.25372,93.606388 59.30576,0.339563 -49.14606,83.853969 -29.939,-50.28437 z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>\n  <g\n     inkscape:groupmode=\"layer\"\n\
				id=\"ne\"\n     inkscape:label=\"ne\"\n     style=\"display:inline\">\n    <path\n\
				id=\"rect2493\"\n       style=\"fill:VAR{neFill, \"none\"};fill-opacity:0.745902;stroke:#6ab1f8;\
				stroke-width:3.07395;stroke-linejoin:round\"\n       d=\"M 119.77718,59.522429 150.16323,9.404475 198.3999,93.818646 139.25372,93.606388 Z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>\n  <g\n     inkscape:groupmode=\"layer\"\n     id=\"n\"\n\
				inkscape:label=\"n\"\n     style=\"display:inline\">\n    <path\n       id=\"rect2638\"\n\
				style=\"fill:VAR{nFill, \"none\"};fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:3.07395;\
				stroke-linejoin:round\"\n       d=\"m 52.94007,8.9715706 97.22316,0.4329044 -30.38605,50.117954 -39.805577,0.09823 z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>\n  <g\n     inkscape:groupmode=\"layer\"\n     id=\"no\"\n\
				inkscape:label=\"no\"\n     style=\"display:inline\">\n    <path\n       id=\"rect2743\"\n\
				style=\"fill:VAR{noFill, \"none\"};fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:3.07395;stroke-linejoin:round\"\n\
				d=\"M 52.940076,8.9715716 79.971603,59.620656 60.742024,93.2568 3.9535932,92.952842 Z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>\n  <g\n     inkscape:groupmode=\"layer\"\n     id=\"so\"\n\
				inkscape:label=\"so\">\n    <path\n       id=\"rect3047\"\n       style=\"fill:VAR{soFill, \"none\"};\
				fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:3.07395;stroke-linejoin:round\"\n\
				d=\"M 3.9535934,92.952844 60.742024,93.2568 80.218572,127.34076 52.190266,177.36702 Z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>\n  <g\n     inkscape:groupmode=\"layer\"\n     id=\"s\"\n\
				inkscape:label=\"s\"\n     style=\"display:inline\">\n    <path\n       id=\"rect2285\"\n\
				style=\"fill:VAR{sFill, \"none\"};fill-opacity:0.745902;stroke:#6ab1f8;stroke-width:3.07395;stroke-linejoin:round\"\n\
				d=\"m 80.218572,127.34076 39.255848,0.17479 29.939,50.28437 -97.223154,-0.4329 z\"\n\
				sodipodi:nodetypes=\"ccccc\" />\n  </g>"
			},
			{
				"type": "button",
				"top": interface.top + 10,
				"left": interface.left + 80,
				"id": interface.name + "N",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "N",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"nFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"nFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 72,
				"left": interface.left + 80,
				"id": interface.name + "C",
				"width": 50,
				"height": 57,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "C",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"cFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"cFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 135,
				"left": interface.left + 80,
				"id": interface.name + "S",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "S",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"sFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"sFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 40,
				"left": interface.left + 25,
				"id": interface.name + "NO",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "NO",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"noFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"noFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 105,
				"left": interface.left + 25,
				"id": interface.name + "SO",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "SO",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"soFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"soFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 105,
				"left": interface.left + 135,
				"id": interface.name + "SE",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "SE",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"seFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"seFill\", \"#ffffff\");\n}\n"
			},
			{
				"type": "button",
				"top": interface.top + 40,
				"left": interface.left + 135,
				"id": interface.name + "NE",
				"width": 50,
				"height": 50,
				"alphaStroke": 0,
				"alphaFillOff": 0,
				"alphaFillOn": 0,
				"label": "NE",
				"value": 1,
				"onValue": "for (let i=2;i<17;i++) {\n\
					let ip=get(\"module_\" + i);\n\
					send(\"192.168.1.\" + ip + \":4000\",\"/padOnOff\",\"n \" + get(this));\n}\n\
					let padValue=get(this);\n if(padValue===0) {\n setVar(\"" + interface.name + "SVG\", \"neFill\", \"none\");\n} else {\n\
						setVar(\"" + interface.name + "SVG\", \"neFill\", \"#ffffff\");\n}\n"
			});
			break;
		case "hexagonePupitre":	
		fragment = {
			"type": "fragment",
			"top": interface.top,
			"left": interface.left,
			"width": 220,
			"height": 330,
			"id": 'hexagonePupitre',
			"props": { 
				"variables" : 
				{ 
					'hexagonePadStates': {
						"S": {'state':1,'sample':''}
					,   "C":{'state':1,'sample':''}
					,   "N":{'state':1,'sample':''}
					,   "NE":{'state':1,'sample':''}
					,   "NO":{'state':1,'sample':''}
					,   "SO":{'state':1,'sample':''}
					,   "SE":{'state':1,'sample':''}
					}
				,	'hexagonPadMode': 0
				,	'serverAddress': localIpAddress
				}
			}
		}

		fragment["file"] = '"' + fragmentsDir + 'hexagonePupitre.json"',
		o.push(fragment);		
			break;
		case "pupitreMatrix":
			let id = [];
			let ip = [];
			let interfaceSize = 0;
			objects.forEach((object, i) => {
				if (object.Group === interface.group) {
					interfaceSize += 1;
					id.push(object.computerID);
					machines.forEach((machine, i) => {
						if (machine.machineId === object.computerID) {
							ip.push("\"" + machine.ipAddress + "\"");
						}
					});
				}
			});
			o.push(
				{
					"type": "button",
					"top": interface.top,
					"left": interface.left,
					"id": interface.name + "Title",
					"width": interfaceSize * 60,
					"height": 30,
					"value": interface.name,
					"onValue": ""
				},
				{
					"type": "matrix",
					"top": interface.top + 30,
					"left": interface.left,
					"id": interface.name + "Matrix",
					"width": interfaceSize * 60,
					"height": 280,
					"innerPadding": false,
					"variables": "@{parent.variables}",
					"traversing": false,
					"widgetType": "fragment",
					"quantity": interfaceSize,
					"props": "JS{{\n\
						let p = {};\n\
						p.file=\"" + fragmentsDir + "channelStripPupitre.json\";\n\
						let id=["+ id + "];\n\
						let ip=["+ ip + "];\n\
						let v={};\n\
						let pr={};\n\
						v.module=id[$];\n\
						v.ip=ip[$];\n\
						v.n=$;\n\
						v.name=\""+ interface.name + "\";\n\
						pr.variables = v;\n\
						p.props = pr;\n\
						return p}}"
					});
					break;
		case "sampleSelect":
			const soundDir = projectPath + "/" + trackConfig.globalSettings.soundPath
			let folders = {}; let samples = {}; let samplesHeight = 30; let samplesNumber = 0;
			const defaultSampleFolder = trackConfig.globalSettings.defaultSampleFolder 
			const defaultSamplePath = soundDir + '/' + defaultSampleFolder
			samples["_NO SAMPLE"] = "_NO SAMPLE";
// need to rewrite this fn, for checking if path exist
			fs.readdirSync(defaultSamplePath).forEach(function(file) {
				//debug('sample: ' + file)
				filePath = defaultSamplePath + '/' + file;;
				let stat = fs.statSync(filePath);
				if (stat && stat.isDirectory()) debug('is directory')
				else {
					if (path.extname(file) === ".wav") {
						samples[file] = file;
						samplesNumber = samplesNumber + 1;
					}
				}
			});
			samplesHeight = Math.ceil(samplesNumber / 3) * 30;
			debug('samples list height: ' + samplesHeight)
			fs.readdirSync(soundDir).forEach(function(file) {
				debug('sample folders: ' + file)
				filePath = soundDir + '/' + file;
				let stat = fs.statSync(filePath);
				if (stat && stat.isDirectory()) folders[file] = file;
			});
			fragment = {
				"type": "fragment",
				"top": interface.top,
				"left": interface.left,
				"width": interface.width,
				"height": interface.height,
				"id": 'samplesListing',
				"visible":'VAR{visible,false}',
				"props": { 
					"variables" : 
					{ 
						"sampleFolders": folders,
						"samples": samples,
						"selectSample": "_NO SAMPLE",
						"samplesHeight" : samplesHeight,
						"currentFolder" : defaultSampleFolder,
						'serverAddress': localIpAddress
					}
				}
			}
			fragment["file"] = '"' + fragmentsDir + 'sampleSelect.json"',
			o.push(fragment);
			break;
		default:
	}
	return o;
}
