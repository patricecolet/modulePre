"use strict"

//var os = require("os");
//var exec = require('child_process').exec;

//console.log(os.cpus());
//console.log(os.totalmem());
//console.log(os.freemem());

//function reboot(callback){
  //exec('sudo reboot', function(error, stdout, stderr){callback(stdout);});
//}

/*
reboot(function(output){
  console.log(output);
});
*/
// Pour connaitre son adress IP, qui sera mon identifiant
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

console.log(results.wlan0[0]);
