/*****************************************************************
cirmrasp.js

Controle des Raspberry

© Copyright 2021, B. Petit-Hedelin

******************************************************************/
"use strict"

var http = require('http');
var url = require('url');
var fs = require('fs');
var express = require('express');
var path    = require("path");
var ipConfig = require("./serveur/ipConfig.json");
var ws = require('./serveur/wsServeur');

var app = express();
app.use(express.static('./'));

app.get('/', function(req, res) {
 res.sendFile(path.join(__dirname+'/clients/controleur/controleur.html'));
});

var port = ipConfig.webserveurPort;
var addressServer = ipConfig.serverIPAddress;
app.listen(port, () => {
  console.log(`INFO: Listening at http://${addressServer}:${port}`);
});
