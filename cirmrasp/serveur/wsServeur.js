/*****************************************************************
wsServeur.js

Controle des Raspberry

© Copyright 2021-2022, B. Petit-Hedelin

V0.3 (3/2/2022)

******************************************************************/
'use strict'

var fs = require("fs");
var osc = require('osc-min');
var dgram = require("dgram");


const openStage = require('./openStageServer');
const openStageServer = new openStage();
//var sock = dgram.createSocket('udp4');

var sock = dgram.createSocket('udp4', function(msg, rinfo){
	sock.setBroadcast(true);
});

const WebSocketServer = require('ws');
var ipConfig = require('./ipConfig');
//var raspConfig = require('./raspConfig');
var moduleConfig = require('./../../config');
const { exec, spawn } = require('child_process');

var debug = false;
var debug1 = true;
var tempoCheck = 4000; // Tempo de check des Raspberry's
var aliveCounter = 2;  // Nombre de tentatives de check avant de considéré le Raspberry déconnecté

var raspList = [];
var WScontroleur;
var serv;

try{
	serv = new WebSocketServer.Server({port: ipConfig.websocketServeurPort});
}catch (err){
	console.log("ERREUR:", err);
}

function makeRaspConfig() {
	var computerInfo = moduleConfig.computerInfo;
	var jsonData = [];
	var keys = Object.keys(computerInfo);
	for (let i = 0; i < keys.length; i++) {
		var jsonObject = {};
		jsonObject['ipAddress'] = computerInfo[keys[i]]["ipAddress"];
		jsonObject['comment'] = computerInfo[keys[i]]["macAddress"];
		jsonData[i] = jsonObject
	}
	return jsonData;
}
var raspConfig = makeRaspConfig();
console.log("---------- Raspberries déclarés --------");
console.log(raspConfig);
console.log("--------------------------------------");

// Broadcast to all.
serv.broadcast = function broadcast(data) {
	//if(debug) console.log("Web Socket Server: broadcast: ", data);
	serv.clients.forEach(function each(client) {
		if (client.readyState === WebSocketServer.OPEN) {
			try{
				client.send(data);
			}catch(err){
				console.log("ERR: websocketserver.js: broadcast", err);
				throw err;
				return;
			}
		}
	});
}
// Pour ajouter un Raspbeery dans la liste au moment de la connexion.
// Si l'adresse du Raspberry est déjà dans la liste, c'est qu'il s'agit d'une
// reconnexion. On met alors à jour la WS seulement.
function addRaspInList(raspIP, raspWS){
	var rasp = {
		ws: raspWS,
		raspIP: raspIP,
		aliveCounter: aliveCounter,
		info: " "
	}

	// Liste vide
	if(raspList.length === 0){
		raspList.push(rasp);
		if(debug) console.log("raspList vide");
		return;
	}else{ // IP déjà dans la liste, on met à jour la WS
		for(var i=0; i < raspList.length; i++){
			if(raspList[i].raspIP === raspIP){
				raspList[i].ws = raspWS;
				raspList[i].aliveCounter = aliveCounter;
				if(debug) console.log("addRaspInList: RaspList déjà dans la liste, mise à jour");
				return;
			}
		}
	}
	// Pas encore dans la liste
	if(debug1) console.log("addRaspInList: RaspList ajouté dans la liste:", raspIP);
	raspList.push(rasp);
}
function updateRaspList(msg, raspWS){

	if(debug) console.log("updateRaspList: msg: ", msg);

	if(raspList.length === 0){
		if(debug) console.log("updateRaspList: raspList vide");
	}else{ // Liste non vide et le Raspberry est déjà dans la liste
		for(var i=0; i < raspList.length; i++){
			if(raspList[i].raspIP === msg.raspIP){
				raspList[i].ws = raspWS; // Au cas où il y ait deconnexion/reconnexion
				raspList[i].info = msg.info;
				raspList[i].aliveCounter = aliveCounter;
				if(debug) console.log("updateRaspList: raspList", raspList[i].raspIP,  raspList[i].info);
				if(debug) console.log("updateRaspList: RaspList déjà dans la liste du compteur alive");
				return;
			}
		}
	}
	// La liste est vide, ou elle n'est pas vide mais le Raspberry avait disparu
	var rasp = {
		ws: raspWS,
		raspIP: msg.raspIP,
		aliveCounter: aliveCounter,
		info: msg.info
	}
	raspList.push(rasp);
	if(debug1) console.log("WARN: refreshRaspInList: RaspList pas dans la liste, mise à jour");
	return;
}
var date = new Date();
var time = date.getTime();
var previousTime = time;
function decreaseAliveCounters(){
	if(debug) {
		var date = new Date();
		time = date.getTime();
		console.log("decreaseAliveCounters: delta time:", time - previousTime );
		previousTime = time;
	}

	if(raspList.length === 0){
		if(debug) console.log("decreaseAliveCounters: raspList vide");
		return;
	}else{
		if(debug) console.log("decreaseAliveCounters: raspList:", raspList);
		for(var i=0; i < raspList.length; i++){
			raspList[i].aliveCounter--;
			if(debug) console.log("decreaseAliveCounters: RaspList:", raspList[i].raspIP, raspList[i].aliveCounter);
			if(raspList[i].aliveCounter <= 0){
				if(debug1) console.log("WARN: decreaseAliveCounters: alive dépassé :",raspList[i].raspIP);
				raspList.splice(i, 1);
			}
		}
	}
}
// Emission d'un message selon l'adresse IP du Raspberry
function sendToRasp(raspIP, message){
	if(debug1) console.log("sendToRasp:", raspIP, message);

	if(raspList.length === 0){
		if(debug) console.log("--> sendToRasp: raspList vide");
		return;
	}else{
		for(var i=0; i < raspList.length; i++){
			if(raspList[i].raspIP === raspIP){
				raspList[i].ws.send(JSON.stringify(message));
				return;
			}
		}
		console.log("ERR: sendToRasp: no such IP address:", raspIP);
	}
}
function sendSoundFile(raspIP, file){
	var filelocal = file.slice(0,5);

	console.log(`sshpass -praspberry scp ./sounds/${file}.wav pi@${raspIP}:/home/pi/PureData/${filelocal}.wav`);
	exec(`sshpass -p 'raspberry' scp ./sounds/${file}.wav pi@${raspIP}:/home/pi/PureData/${filelocal}.wav`,
	function(error, stdout, stderr){
		console.log(error);
		console.log(stdout);
	});
}
function restartNodeClient(raspIP){
	console.log(`sshpass -praspberry ssh pi@${raspIP} 'killall -9 node; ' `);
	exec(`sshpass -p 'raspberry' ssh pi@${raspIP} 'killall -9 node; node /home/pi/cirmrasp/clients/raspberry/rasp.js&'`,
	function(error, stdout, stderr){
		console.log(error);
		console.log(stdout);
	});
}
function sendToControleur(message){
	if(debug) console.log("--> sendToControleur:", message);
	if(WScontroleur !== undefined){
		if (WScontroleur.readyState !== WScontroleur.OPEN){
			console.log("WARN: No Controler connected")
			return;
		}
		WScontroleur.send(message);
	}
}
function sendOSCmessage(ipRasp, portRasp, message, val) { // Value = table des données
	var buf;
	var commandeOSC = "/" + message;

	if (debug1) console.log("sendOSCmessage :" + commandeOSC + " : " + val + " port: " + portRasp + " ipRasp: " + ipRasp);
	buf = osc.toBuffer({ address: commandeOSC , args: val });
	return sock.send(buf, 0, buf.length, portRasp, ipRasp);
}
function btoa(str) {
	var buffer;
	if (str instanceof Buffer) {
		buffer = str;
	} else {
		// Convertir str en sting et charge le buffer avec en mode binary
		// qui serait un mode obsolète.
		buffer = Buffer.from(str.toString(), 'binary');
	}
	return buffer.toString('base64'); // (re)transforme le buffer en String au format base64
}
function makeJSON(obj,key,v) {
	var JSON_RES = "{";
	var keys = Object.keys(obj);
	var value;
	for (let i = 0; i < keys.length; i++) {
		var address = obj[keys[i]][key];
		if (v === 'idx') {
			value = i;
		}
		else {
			if (i === 0) {
				JSON_RES = JSON_RES + "\"localhost\":\"localhost\",";
				JSON_RES = JSON_RES + "\"Broadcast\":\"192.168.1.255\",";
			}
			value = address;
		}
		JSON_RES = JSON_RES + `"${address}":"${value}",`;
	}
	JSON_RES = JSON_RES + "}";
	//console.log(JSON_RES);
	return JSON_RES;
}

function sendRaspConfig(ip) {
	var computerInfo = moduleConfig.computerInfo;
	var compositions = moduleConfig.compositions;
	openStageServer.sendCommand("/ipAddresses", makeJSON(computerInfo,'ipAddress',''));
	openStageServer.sendCommand("/compositions", makeJSON(compositions,'title','idx'));
	//  console.log(JSON.stringify(compositions));
}
serv.on('connection', function (ws) {

	if(debug1) console.log('received connexion');
	ws.on('message', function (message) {
		if(debug1) console.log('received: %s', message);

		var msgRecu = JSON.parse(message);
		switch(msgRecu.type) {

			case "broadcastOSCmessage":
			if(debug1) console.log("--> broadcastOSCmessage: ", msgRecu.OSCMessage, msgRecu.OSCValue);

			// L'utilisation de l'adresse de broadcast ne fonctionne pas ici avec OSC.
			// On envoie donc sur chacun des Raspberry connectés.
			for (var i = 0; i < raspList.length; i++) {
				sendOSCmessage(
					raspList[i].raspIP,
					ipConfig.OSCPort,
					msgRecu.OSCMessage,
					[{ type: 'integer', value: parseInt(msgRecu.OSCValue) },
					{ type: 'integer', value: 100 },
					{ type: 'integer', value: 120 }]
				  );
			}
			break;

			case "raspberryOpen":
			if(debug) console.log("<-- raspberryOpen: ", msgRecu.raspIP);
			addRaspInList(msgRecu.raspIP, ws);
			if(debug) console.log(raspList);
			break;

			case "raspberryAlive":
			if(debug) console.log("<-- raspberryAlive: ", msgRecu.raspIP, " : info:", msgRecu.info);
			updateRaspList(msgRecu, ws);
			break;

			case "rebootRaspberry":
			var msg = {
				type: "rebootRaspberry"
			}
			sendToRasp(msgRecu.raspIP, msg);
			break;

			case "sendSoundFile":
			if(debug1) console.log("sendSoundFile: ", msgRecu.raspIP);
			sendSoundFile(msgRecu.raspIP, msgRecu.file);
			break;

			case "shutdownRaspberries":
			if(debug1) console.log("shutdownRaspberries");
			var msg = {
				type: "shutdownRaspberry"
			}
			serv.broadcast(JSON.stringify(msg));
			break;

			case "sendOSCmessage":
			if(debug1) console.log("--> sendOSCmessage: ", msgRecu.raspIP, msgRecu.OSCMessage, msgRecu.OSCValue);

			sendOSCmessage( 
				msgRecu.raspIP,
				ipConfig.OSCPort,
				 msgRecu.OSCMessage,
			  [{type: 'integer', value: parseInt(msgRecu.OSCValue) }]
			 );
			break;

			case "restartNode":
			if(debug1) console.log("**** restartNode: ", msgRecu.raspIP);
			restartNodeClient(msgRecu.raspIP);
			break;

			case "startControleur":
			if(debug1) console.log("<-- startControleur");
			WScontroleur = ws;

			var msg = {
				"type": "raspConfig",
				"raspConfig": raspConfig
			}
			sendToControleur(JSON.stringify(msg));
			break;


			case "requestConfig":
			if(debug1) console.log("**** requestConfig: ");
			sendRaspConfig(msgRecu.oscIP);
			break;

			default:  console.log( "Web Socket Serveur: Type de message inconnu : " , msgRecu);
		}
	});

	ws.on('close', function() {
		if (debug) console.log( "Web Socket Server: Socket closed by client." );
	});

	ws.on('error', function( event ){
		console.log( "Web Socket Server: Erreur sur socket:", ws.socket, " ", event );
	});
});

// Check des Raspberry et mise à jour de la liste des Raspberry selon la période tempoCheck
var raspListShort = [];

setInterval(function(){

	if(debug) console.log("--> isRaspAlive: ");
	var msg = {
		type: "isRaspAlive",
	}
	serv.broadcast(JSON.stringify(msg));

	decreaseAliveCounters();

	// Envoi les Raspberry connectés au controleur
	raspListShort = [];

	// Remplir le liste des Rasp sans les WS et les compteurs
	for(var i = 0; i < raspList.length ; i++){
		var unRaspShort = {
			raspIP: raspList[i].raspIP,
			info: raspList[i].info
		}
		raspListShort.push(unRaspShort);
	}

	var msg = {
		type: "raspList",
		list: raspListShort
	}
	sendToControleur(JSON.stringify(msg));

	if(debug) console.log("--> controleur: raspList: ", raspListShort);

}, tempoCheck);

// Test d'envoi d'un fichier son
/*	setTimeout( ()=> {
fs.readFile('./sounds/titi.wav', 'binary',  (err, data) => {
if (err) {
console.error(err);
return;
}
var content = btoa(data);

// Test d'envoi de fichier son
var msg = {
type: "sendSoundFile",
path: "../sounds/tata.wav",
soundFile: content
}
sendToRasp("192.168.0.7", msg);
});

}, tempoCheck, 'send sound');
*/

// Test émission OSC
var count = 1.0;

function sendHeartbeat() {
	var buf;
	count++;
	console.log("OSCcirmRasp:", count);

	sendOSCmessage(
		ipConfig.broadcastOSCAddress,
		ipConfig.OSCPort,
		"OSCNOTEON",
		[{type: 'integer', value: count}, {type: 'integer', value: 70},{type: 'integer', value: 120}]
	);

	//return sock.send(buf, 0, buf.length, 3000, "192.168.1.75");
}

//setInterval(sendHeartbeat, 3000);
