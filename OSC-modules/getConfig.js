const process = nativeRequire('child_process');
const fs = nativeRequire('fs');
const { networkInterfaces } = nativeRequire('os');
const { platform } = nativeRequire('node:process');
const modulesDir =  '../OSC-modules/'
const drawWidget = require(modulesDir + 'drawWidget.js');
const configureWidgets = require(modulesDir + 'configureWidgets.js');
const defaultWidgets = require(modulesDir + 'defaultWidgets.js');
const widgetCommands = require(modulesDir + 'widgetCommands.js');
const checkTrackConfig = require(modulesDir + 'checkTrackConfig.js');
const pdDir = "../PureData/"
const scriptPath = pdDir + "script/";
const compoPath = pdDir + "compositions/";
const backup_files = "../backup_files";
let moduleStates = [{}];
const config = loadJSON('../config.json');
const machines = config.computerInfo;
const debugState = 1;
function debug(message) {
	if (debugState) console.log('DEBUG', message);
}
debug('debug enabled')
const alive = 1;
const dead = 0;
let ping = 1;
const lifeTime = 10000;
let d = new Date();
let date = d.getTime();
machines.forEach((p, i) => {
	moduleStates[i] = {
		"ping": date,
		"pong": date,
		"cpu": 0,
		"latency": 0,
		"state": 0,
		"date": date - lifeTime,
		"mute": 0,
		"solo": 0
	};
});
const nets = networkInterfaces();
const netInterfaces = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!netInterfaces[name]) {
                netInterfaces[name] = [];
            }
            netInterfaces[name].push(net.address);
        }
    }
}
debug(`This platform is ${platform}`);
let localIpAddress = ''
if (platform === 'darwin') localIpAddress = netInterfaces['en0']
else if (platform === 'linux') localIpAddress = netInterfaces['wlan0']
debug(netInterfaces)

function getModuleID(ip) {
	const ipArray = ip.split(".");
	return ipArray[3];
}

function ensureDirSync(dirpath) {
	try {
		return fs.mkdirSync(dirpath);
	} catch (err) {
		if (err.code !== 'EEXIST') throw err;
	}
}

function launchScript(command) {
	machines.forEach((p, i) => {
		if (moduleStates[i].state === 1) {
			let moduleNum = getModuleID(machines[i].ipAddress);
			debug('updating ' + moduleNum);
			process.exec(command + ' ' + moduleNum + ' ' + moduleNum,
				function (err, stdout, stderr) {
					if (err) {
						receive('/NOTIFY', 'triangle-exclamation', err);
					}
					receive('/NOTIFY', 'hand', stdout);
				});
		}
	});
}

var compo = {};
var title = "";
var projectPath = "";
let trackConfig = {};
function loadComposition(val, clientId) {
	title = compo[val].title;
	projectPath = compoPath + title;
	let compoConfig = projectPath + "/trackConfig.json";
	debug("composition " + val);
	let widgets = [];
	if (fs.existsSync(compoConfig)) {
		try {
			trackConfig = loadJSON(compoConfig);
			widgets.push(
				{
					"type": "variable",
					"value": trackConfig,
					"id": "trackConfig",
					"address": "/saveTrackConfig",
					"target": localIpAddress + ":5000",
					"preArgs": title,
					"onValue" :'send("' + localIpAddress + ':5000","/saveTrackConfig",value)\n\
								console.log("trackConfig write")'
				});
			trackConfig.interface.forEach((interface, i) => {
				//receive('/NOTIFY', 'hand', interface.widget);
				const widgetModule = drawWidget(machines, trackConfig, interface, projectPath,localIpAddress);
				widgets = widgets.concat(widgetModule);
			});
			configureWidgets(trackConfig);
		}
		catch (e) {
			receive('/NOTIFY', 'triangle-exclamation', title + " interface error:\n" + e.message);
			debug(title + ": " + e.message)
		}
	} else {
		widgets = defaultWidgets(machines,moduleStates,title);
	}
	receive('/EDIT', 'Composition', {
		'widgets': widgets
	}, { clientId: clientId });
	
}

app.on('sessionOpened', (data, client) => {
	let err = "";
	var info = "";
	try {
		compo = config.compositions;
		err = ": config.json is okay";
	}
	catch (e) {
		err = ": config.json is malformed: " + e.message;
	}
	let moduleSwitch = {};
	machines.forEach((p, i) => {
		moduleSwitch[p.machineId] = i;
		receive('/EDIT', "modal_clone_" + i, { "visible": true }, { clientId: client.id });
	});
	let compoSwitch = {};
	var compoTabs = [];
	compo.forEach((p, i) => {
		let title = p.title;
		compoSwitch[title] = i;
		info += " " + title + "\n";
	})
	receive('/NOTIFY', 'triangle-exclamation', err);
	receive('/NOTIFY', 'hand', info);
	receive('/EDIT', "module_switch", { "values": moduleSwitch }, { clientId: client.id });
	receive('/EDIT', "compoSwitch", { "values": compoSwitch }, { clientId: client.id });
	receive('/EDIT', "compoSwitch", { "value": 0 }, { clientId: client.id });
	receive('/EDIT', 'config', { 'value': config,}, { clientId: client.id });
	function updateState() {
		let moduleSwitch = {};

		moduleSwitch["Broadcast"] = "Broadcast";
		let d = new Date();
		//		receive('/NOTIFY', 'hand',d);
		let date = d.getTime();
		let aliveModules = 0;
		moduleStates.forEach((p, i) => {
			if ((date - p.date) > lifeTime) {
				p.state = dead;
				receive("/EDIT", "modules/" + i, { "colorWidget": "#aaaaaa" }, { clientId: client.id });
			} else {
				p.state = alive;
				aliveModules = aliveModules + 1;
				receive("/EDIT", "modules/" + i, { "colorWidget": "#aaffaa" }, { clientId: client.id });
				moduleSwitch[machines[i].machineId] = machines[i].machineId;

				send("localhost", "5000", "/cpu_" + i, p.cpu);
				send("localhost", "5000", "/latency_" + i, p.date - p.ping);
				//				receive('/NOTIFY', 'hand',date);
			}
			receive("/EDIT", "modal_clone_" + i, { "value": 0 }, { clientId: client.id });
			send(machines[i].ipAddress, "4000", "/ping", 1);
			p.ping = date;
		})
		receive("/EDIT", "moduleState", { "value": moduleStates }, { clientId: client.id });
		receive('/EDIT', "module_switch", { "values": moduleSwitch }, { clientId: client.id });
	} // end of updateState
	receive('/EDIT', "modules", { "quantity": machines.length }, { clientId: client.id });
	setInterval(
		//updateState
		function () {
			if (ping === 1) updateState();
		}
		, 3000);
	setTimeout(function () {
		checkTrackConfig(config,moduleStates,compoPath);
		loadComposition(0, client.id);
	}, 10000);
});

module.exports = {
	oscInFilter: function (data) {

		var { address, args, host, port } = data

		if (address === '/ping') {
			let d = new Date();
			let date = d.getTime();
			machines.forEach((p, i) => {
				if (args[0].value == p.machineId) {
					moduleStates[i].date = date;
					moduleStates[i].cpu = args[1].value;
					//						receive('/NOTIFY', 'hand',args[2].value);
					//					receive("/EDIT","modules/"+i,{ "variables.cpu" :  args[1].value }, {clientId: client.id});
					//					receive('/NOTIFY', 'hand',"cpu:" + args[1].value + "%");
				}

			})
		}
		return { address, args, host, port }
	},

	oscOutFilter: function (data) {
		
		var { address, args, host, port, clientId } = data
		const val = args[0].value;
		debug(" address: " + address);
		debug(" val: " + val);

		widgetCommands(machines,data,moduleStates,projectPath);
		if (address === '/ping') {
			debug("Ping:" + val);
			ping = val;
		}
		if (address === '/saveconfig') {
			ensureDirSync(backup_files);
			let prefix = "." + Date.now().toString();
			let backup = backup_files + "/config.json" + prefix;
			fs.copyFile('../config.json', backup, (err) => {
				if (err) {
					receive('/NOTIFY', 'hand', err);
				}
			});
			try {
				fs.writeFileSync('../config.json', JSON.stringify(JSON.parse(val), null, 4));
			}
			catch (e) {
				debug("config write error" + e);
			}
			debug("Config written!");
		}
		if (address === '/broadcast') {
			//receive('/NOTIFY', 'hand',"broadcast " + val + " " + args[1].value);
			machines.forEach((machine, i) => {
				let newHost = machine.ipAddress;
				if (moduleStates[i].state === 1) {
					send(newHost, "4000", val, args[1]);
				}
			});
			return;
		}
		if (address === '/composition') {
			loadComposition(val, clientId);
		}
		if (address === '/updateComposition') {
			debug("updateComposition");
			launchScript(scriptPath + '_update_composition.sh ' + val);
		}
		if (address === '/updateConfig') {
			if (val == 0) {
				debug("updateConfig");
				launchScript('../PureData/script/_update_config.sh');
			}
		}
		if (address === '/updateMainPatch') {
			if (val == 0) {
				debug("updateMainPatch");
				launchScript('../PureData/script/_update_main_patch.sh');
			}
		}
		if (address === '/updateAbs') {
			if (val == 0) {
				debug("updateAbs");
				launchScript('../PureData/script/_update_abs.sh');
			}
		}
		if (address === '/updateExternals') {
			if (val == 0) {
				debug("updateExternals");
				launchScript('../PureData/script/_update_externals.sh');
			}
		}
		if (address === '/mute') {
			machines.forEach((p, i) => {
				let m = moduleStates[i];
				if (m.solo === 0) {
					moduleStates[i].mute = val;
				}
			});
		}
		return { address, args, host, port }
	}
}
