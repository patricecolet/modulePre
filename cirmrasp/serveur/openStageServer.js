
var osc = require('osc-min');
var dgram = require("dgram");
var sock = dgram.createSocket('udp4', function(msg, rinfo){
	sock.setBroadcast(true);
});
var ipConfig = require('./ipConfig');
var raspConfig = require('./raspConfig');
var debug = true;
const absolutePath = process.cwd();
const { exec, spawn } = require('child_process');

const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

async function main() {
  const { stdout, stderr } = await exec('node open-stage-control --port 5000');

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

// setTimeout(() => {
// //  sendCommand("/SESSION/OPEN", absolutePath + "/open-stage-control/sessions/main.json");
//   const ipAdresses = {};
//   raspConfig.forEach((elem, i) => {
//     ipAdresses[elem.ipAddress] = elem.ipAddress;
//   });
// //  console.log("openStage session main.json loaded");
//
//   setTimeout(() => {
//     sendCommand("/ipAddresses", JSON.stringify(ipAdresses));
//     console.log("ipAddresses sent to openStage widget");
//   }, "5000")
//
// }, "2000")
