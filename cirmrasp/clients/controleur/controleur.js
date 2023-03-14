/*****************************************************************
controleur.js

Controle des Raspberry

© Copyright 2021, B. Petit-Hedelin

V0.1

******************************************************************/
'use strict'

var ipConfig = require('../../serveur/ipConfig');

var $=require('jquery');
$('#test').text('browserify working');

var port;
var par;
var ws;
var ipSelected;

var debug = false;
var debug1 = true;
var listOfRaspberries;

function setListRasp(listRasp){
	var place = document.getElementById("raspList");
	listOfRaspberries = listRasp;

	while (place.firstChild) {
		place.removeChild(place.firstChild);
	}

	for(var i=0; i < listRasp.length; i++){

		var divloc = document.createElement("div");

		var bouton = document.createElement("button");
		// On ne peut pas utiliser l'adresseIP directement comme id à cause des points.
		bouton.id = listRasp[i].ipAddress.replace(/\./g, "");
		bouton.innerHTML = listRasp[i].ipAddress;
		bouton.value = listRasp[i].ipAddress;
		bouton.setAttribute("class", "raspButton");

		bouton.addEventListener("click", function(event) {
			if(debug1) console.log("click button:id:", this.id);

			var res = confirm("Rebooter le Raspberry ?" + this.value);
			if (res == true) {
				var msg = {
					type : "rebootRaspberry",
					raspIP : this.value
				}
				ws.send(JSON.stringify(msg));
			} else {

			}
		});

		var infoRasp = document.createElement("span");
		infoRasp.id = "infoRasp-" + listRasp[i].ipAddress.replace(/\./g, "");;
		infoRasp.setAttribute("class", "infoRasp");
		infoRasp.innerHTML = " " + listRasp[i].macAddress;

		divloc.appendChild(bouton);
		divloc.appendChild(infoRasp);

		place.appendChild(divloc);
	}
}

function refreshListRasp(listRasp){

	if(debug1) console.log("refreshListRasp", listRasp, listOfRaspberries);

	for(var i=0; i < listOfRaspberries.length; i++){

		var id = '#' + listOfRaspberries[i].ipAddress.replace(/\./g, "");
		$(id).attr('class' , "raspButtonBAD");

		for(var j=0; j < listRasp.length; j++){
			if ( listRasp[j].raspIP === listOfRaspberries[i].ipAddress){

				var id = '#' + listRasp[j].raspIP.replace(/\./g, "");
				$(id).attr('class' , "raspButtonOK");

				var infoRasp = "#infoRasp-" + listOfRaspberries[i].ipAddress.replace(/\./g, "");

				if(debug1) console.log("refreshListRasp: infoRasp", infoRasp, listRasp[j].info);
				$(infoRasp).text(listRasp[j].info);
				break;
			}
		}
	}
}

function sendSoundFile(){
	if(document.getElementById('chooseFile').value === ''){
		alert("Pas de fichier sélectionné !");
		return;
	}

	if(ipSelected === undefined){
		alert("Pas de Raspberry sélectionné !");
		return;
	}

	let fichierSelectionne = document.getElementById('chooseFile').value;
	var res = confirm("Envoyer le fichier " + fichierSelectionne + " vers " + ipSelected + " ?");
	if (res == true) {
		if(debug1) console.log("*** sendSoundFile", fichierSelectionne, ipSelected);
	} else {
		return;
	}
	var msg = {
		type : "sendSoundFile",
		raspIP: ipSelected,
		file: fichierSelectionne
	}
	ws.send(JSON.stringify(msg));
}
window.sendSoundFile = sendSoundFile;

function broadcastOSCMessage(){
	var message = document.getElementById('OSCMessage').value;
	var value = document.getElementById('OSCValue').value;
	console.log("sendOSCMessage:", message, value);

	var msg = {
		type : "broadcastOSCmessage",
		OSCMessage: message,
		OSCValue: value
	}
	ws.send(JSON.stringify(msg));

}
window.broadcastOSCMessage = broadcastOSCMessage;

function sendOSCMessage(){
	if(ipSelected === undefined){
		alert("Pas de Raspberry sélectionné !");
		return;
	}

	var message = document.getElementById('sendOSCMessage').value;
	var value = document.getElementById('sendOSCValue').value;
	console.log("sendOSCMessage:", message, value);

	var msg = {
		type : "sendOSCmessage",
		raspIP: ipSelected,
		OSCMessage: message,
		OSCValue: value
	}
	ws.send(JSON.stringify(msg));
}
window.sendOSCMessage = sendOSCMessage;

function restartNode(){
	if(ipSelected === undefined){
		alert("Pas de Raspberry sélectionné !");
		return;
	}

	var msg = {
		type : "restartNode",
		raspIP: ipSelected,
	}
	ws.send(JSON.stringify(msg));
}
window.restartNode = restartNode;

function broadcastShutdown(){
	var res = confirm("Voulez-vous vraiment éteindre tous les raspberries ?");
	if (res == true) {
		if(debug1) console.log("*** Arret général des Raspberries");
		var msg = {
			type : "shutdownRaspberries"
		}
		ws.send(JSON.stringify(msg));
	} else {
		return;
	}
}
window.broadcastShutdown = broadcastShutdown;

const selectElement = document.getElementById("raspConfig");

function selectIP(){
	var x = document.getElementById("raspConfig").value;
	if(debug1) console.log("selectIP:", x);
	ipSelected = x;
}
window.selectIP = selectIP;

var aliveFlagStatus = false;

function initWSocket(host) {
	if( host !== undefined){
		ws = new WebSocket("ws://" + host + ":" + ipConfig.websocketServeurPort);
		console.log("controleur.js WS://" + host + ":" + ipConfig.websocketServeurPort);
	}else{
		console.log("controleur.js: initWSSocket host undefined");
	}

	ws.onopen = function( event ) {
		var msg = {
			type : "startControleur"
		}
		ws.send(JSON.stringify(msg));
	}

	ws.onmessage = function( event ) {
		var msgRecu = JSON.parse(event.data);
		//console.log( "Client: received [%s]", event.data );
		//console.log( "Client: received:", msgRecu.type );
		var el = document.getElementById("aliveFlag");
		if(aliveFlagStatus){
			el.setAttribute("style", "display:none");
		}else{
			el.setAttribute("style", "display:inline");
		}

		switch(msgRecu.type) {

			case "isRaspAlive":
				// Pas utile pour le controleur
				if(debug) console.log("reçu : isRaspAlive");
				break;

			// Récéption de la liste des Raspberries à la oonnexion du controleur
			case "raspConfig":
				if(debug1) console.log("reçu : raspConfig : ", msgRecu.raspConfig);
				var el = document.getElementById("raspConfig");
				var raspConfig = msgRecu.raspConfig;

				var unRasp = document.createElement("option");
				unRasp.setAttribute("value", "");
				unRasp.innerHTML = "IP raspberry";
				el.appendChild(unRasp);

				for(var i=0 ; i < raspConfig.length ; i++){
					var unRasp = document.createElement("option");
					unRasp.setAttribute("value", raspConfig[i].ipAddress);
					unRasp.innerHTML =  raspConfig[i].ipAddress;
					el.appendChild(unRasp);
				}

				// Définit la liste des raspberries
				setListRasp(msgRecu.raspConfig);

				break;

			case "raspList":
				if(debug1) console.log("reçu : raspList :", msgRecu);

				//setListRasp(msgRecu.list);

				refreshListRasp(msgRecu.list);

				aliveFlagStatus = !aliveFlagStatus;
				break;

			default: console.log("Le Client reçoit un message inconnu :", msgRecu );
		}
	}

	ws.onerror = function (event) {
		console.log( "controleur.js : received error on WS", ws.socket, " ", event );
	}

 	ws.onclose = function( event ) {
		console.log( "controleur.js :onclose");
	}
}
window.initWSocket = initWSocket;
