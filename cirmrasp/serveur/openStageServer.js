
var osc = require('osc-min');
var dgram = require("dgram");
var sock = dgram.createSocket('udp4', function(msg, rinfo){
	sock.setBroadcast(true);
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
		'node open-stage-control --port 5000');

	console.log("openStage started at localhost:" + ipConfig.openStagePort);
  }

class OpenStageServer {
 sendCommand(command, val) { // Value = table des données
    var buf;
    if (debug) console.log("sendOSCmessage :" + command + " " + val);
    buf = osc.toBuffer({ address: command , args: val });
    return sock.send(buf, 0, buf.length, ipConfig.openStagePort, "localhost");
	}
};
module.exports = OpenStageServer;

main();
