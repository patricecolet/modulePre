
var osc = require('osc-min');
var dgram = require("dgram");
var remotes = [];
var sock = dgram.createSocket('udp4', function(msg, rinfo){
	sock.setBroadcast(true);
//	console.log("socketAddress :" + socket.address().address);
});
var ipConfig = require('./ipConfig');
var debug = true;
const absolutePath = process.cwd();
const { exec, spawn } = require('child_process');

const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

async function main() {
  const { stdout, stderr } = await exec(
		'node open-stage-control --port 5000  --custom-module getConfig.js  --load open-stage-control/sessions/modulePre.json');

	console.log("openStage started at localhost:" + ipConfig.openStagePort);
  }

class OpenStageServer {
 sendCommand(command, val,ip) { // Value = table des données
    var buf;
    if (debug) console.log("sendOSCmessage :" + command + " " + val);
    buf = osc.toBuffer({ address: command , args: val });
    return sock.send(buf, 0, buf.length, ipConfig.openStagePort, ip);
	}
};
module.exports = OpenStageServer;

main();
