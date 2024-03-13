module.exports = {
	drawWidget: function (machines, trackConfig, interface) {
	//   var this = {};
	//   var that = {};
	let widgetModule = interface.widget;
	let objects = trackConfig[interface.objects];
	let o = [];
	let id = [];
	let ip = [];
	let interfaceSize = 0;
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
					p.file=\"open-stage-control/sessions/channelStrip.json\";\n\
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
			let switchValues = {};
			let index = 0;
			objects.forEach((object, i) => {
				switchValues[object.title] = index;
				index += 1;
			});
			o.push(
				{
					"type": "text",
					"top": interface.top,
					"left": interface.left,
					"id": interface.name + "Title",
					"width": interface.width,
					"height": 30,
					"value": interface.name
				},
				{
					"type": "switch",
					"top": interface.top + 30,
					"left": interface.left,
					"id": interface.name + "Switch",
					"width": 100,
					"height": 30 * index,
					"default": 0,
					"values": switchValues,
					"onValue": "for (let i=2;i<17;i++) {\n\
						let ip=get(\"module_\" + i);\n\
						send(\"192.168.1.\" + ip + \":4000\",\"/cue\",get(this));\n}"
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
						p.file=\"open-stage-control/sessions/channelStripPupitre.json\";\n\
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
			o.push(
				{
					"type": "fragment",
					"top": interface.top,
					"left": interface.left,
					"width": interface.width,
					"height": interface.height,
					"id": interface.name + interface.Instrument,
					"file": "open-stage-control/sessions/sampleSelect.json"
				});

		break;
		default:
	}
	return o;
	},
	configureWidgets: 	setTimeout(function () {
		let i = 0;
		trackConfig.modules.forEach((m, j) => {
			let trackConfigWidgets = [];
			let moduleKeys = Object.keys(m);
			receive('/EDIT', 'musicianName_' + m.computerID, {
				'value': m.Musician
			}, { clientId: clientId });
			let cueList = [];
			m.cueList.forEach((cue, cueIndex) => {
				cueList.push(cue.name);
			});
			receive('/EDIT', 'cueList_' + m.computerID, {
				'values': cueList,
				'value': cueList[0]
			}, { clientId: clientId });
			let sampleList = {};
			let sampleNumber = 0
			m.samples.forEach((sample, sampleIndex) => {
				sampleList[sample.name] = sample.id;
				sampleNumber = sampleNumber + 1;
			});
			receive('/EDIT', 'sampleList_' + m.computerID, {
				'address': 'sampleList_' + m.computerID,
				'values': sampleList,
				'height': 30 * sampleNumber
			}, { clientId: clientId });
			if (m.Instrument === "hexapad") {
				receive('/NOTIFY', 'hand', " loading hexapad for module " + m.computerID);
				let getModule = 'let mod = getProp("parent","variables").module;\n'
				let getCue = 'let slot = get("slot_" + mod);\n'
				let getSlot = 'let cue = get("cueList_" + mod);\n'
				let getVariables = getModule + getCue + getSlot;
				let header = getVariables + 'set("compositionScript",\'{"target":"module","id":\' + mod + \',"command":"set","param":"'
				let footer = '","value":"\' + value + \'","cue":"\' + cue + \'","slot":\' + slot + \'}\');'
				let instrumentWidgets = [
					{
						"type": "menu",
						"top": 10,
						"left": 200,
						"id": "slot_" + m.computerID,
						"label": "slot",
						"values": [0, 1, 2, 3, 4, 5, 6],
						"value": 0,
						"onValue": getModule + 'set("compositionScript",\'{"target":"module","id":\' + mod + \',"command":"cue",\
						"cue":"\' + get("cueList_" + mod) + \'","slot":\' + value + \'}\')'
					},
					{
						"type": "text",
						"top": 50,
						"left": 10,
						"id": "trigTitle_@{parent.variables.module}",
						"value": "Trigger",
						"width": 100,
						"height": 30
					},
					{
						"type": "dropdown",
						"top": 50,
						"left": 110,
						"width": 120,
						"id": "trig_" + m.computerID,
						"values": ["n", "s", "ne", "no", "se", "so", "c", "nsc", "nseoc", "nso", "nes", "sse", "sso", "nno", "nne"],
						"onValue": header + 'Trigger' + footer
					},
					{
						"type": "text",
						"top": 80,
						"left": 10,
						"id": "sampleIDTitle_@{parent.variables.module}",
						"value": "Sample",
						"width": 100,
						"height": 30
					},
					{
						"type": "text",
						"top": 80,
						"left": 110,
						"id": "sampleID_@{parent.variables.module}",
						"value": "no sample",
						"width": 120,
						"height": 30,
						"onValue": header + 'sampleID' + footer
					},
					{
						"type": "text",
						"top": 110,
						"left": 10,
						"id": "playModeTitle_@{parent.variables.module}",
						"value": "Play Mode",
						"width": 100,
						"height": 30
					},
					{
						"type": "dropdown",
						"top": 110,
						"left": 110,
						"id": "playMode_@{parent.variables.module}",
						"values": ["latch", "one shot", "button"],
						"width": 120,
						"height": 30,
						"onValue": header + 'playMode' + footer
					},
					{
						"type": "text",
						"top": 140,
						"left": 10,
						"id": "fadeInTitle_@{parent.variables.module}",
						"value": "Fade In (ms)",
						"width": 100,
						"height": 30
					},
					{
						"type": "input",
						"top": 140,
						"left": 110,
						"id": "fadeIn_@{parent.variables.module}",
						"numeric": "true",
						"width": 120,
						"height": 30,
						"onValue": header + 'fadeIn' + footer
					},
					{
						"type": "text",
						"top": 170,
						"left": 10,
						"id": "fadeOutTitle_@{parent.variables.module}",
						"value": "Fade Out (ms)",
						"width": 100,
						"height": 30
					},
					{
						"type": "input",
						"top": 170,
						"left": 110,
						"id": "fadeOut_@{parent.variables.module}",
						"numeric": "true",
						"width": 120,
						"height": 30,
						"onValue": header + 'Trigger' + footer
					},
					{
						"type": "text",
						"top": 200,
						"left": 10,
						"id": "gainTitle_@{parent.variables.module}",
						"value": "Gain (db)",
						"width": 100,
						"height": 30
					},
					{
						"type": "input",
						"top": 200,
						"left": 110,
						"id": "gain_@{parent.variables.module}",
						"numeric": "true",
						"width": 120,
						"height": 30,
						"onValue": header + 'gain' + footer
					},
					{
						"type": "text",
						"top": 230,
						"left": 10,
						"id": "onsetTitle_@{parent.variables.module}",
						"value": "Onset (ms)",
						"width": 100,
						"height": 30
					},
					{
						"type": "input",
						"top": 230,
						"left": 110,
						"id": "onset_@{parent.variables.module}",
						"numeric": "true",
						"width": 120,
						"height": 30,
						"onValue": header + 'onset' + footer
					},
					{
						"type": "button",
						"top": 130,
						"left": 250,
						"id": "loop_@{parent.variables.module}",
						"label": "Loop",
						"width": 120,
						"height": 120,
						"onValue": header + 'loop' + footer
					}
				];
				receive('/EDIT', 'cuePanel_' + m.computerID, {
					'widgets': instrumentWidgets
				}, { clientId: clientId });
			}
		});
	}, 1000);
}
