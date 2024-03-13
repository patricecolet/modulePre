module.exports = function (trackConfig) {
	const debugState = 0;
	function debug(message) {
		if (debugState) receive('/NOTIFY', 'hand', message);
	}
	setTimeout(function () {
		
		try { 
			let widget = trackConfig.interface[0].widget
			if (widget === "pupitreMatrix") {
				receive('/EDIT', 'Presets.switch',{
					'onValue':
						'let padStates=get("hexagonePadState")\n\
						let triggers = get("trackConfig").modules[0].cueList[value].triggers\n\
						triggers.forEach((t,i) => {\n\
							padStates.values[t.name].sample = t.sampleName\n\
							padStates.values[t.name].sampleDir = t.sampleDir\n\
						})\n\
						set("hexagonePadState",padStates,{"send":false})'
					}
				)
			}
		}
		catch (e) {}
		//debug("default samples folder: " + defaultSampleFolder);
		/*
		let i = 0;
		trackConfig.modules.forEach((m, j) => {
			let trackConfigWidgets = [];
			let moduleKeys = Object.keys(m);
			receive('/EDIT', 'musicianName_' + m.computerID, {
				'value': m.Musician
			}, { clientId: clientId });1
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
		*/
	}, 500);
    debug("configure widgets ok");
}
