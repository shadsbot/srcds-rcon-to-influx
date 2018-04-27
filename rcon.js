"use strict";
var dbc = require('./influx-middle');
let RCON = require('srcds-rcon');
let rcon = RCON({
	address: process.env.RCONSRV,
	password: process.env.RCONPW
});

var logging = process.env.RCONLOGGING || false;
var interval = process.env.RCONINT || 5000;
var debug = process.env.DEBUG || false;
var db = process.env.DB || "srcds_db";

function dbg(msg) {
	if(debug) {
		console.log(msg);
	}
}

function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve,ms);
	});
}

function pingServer() {
	rcon.connect()
		.then( () => {
			dbg('Connected, awaiting response');
			rcon.command('stats').then(response => {
				var stat = response.split(" ");
				// Remove blank spaces
				stat = stat.filter(function(e){ return e === 0 || e }).filter(function(e){ return e === 0 || e != " " });
				// Remove categories (first 8 elements)
				for(var i = 0; i < 8; i++) {
					stat.shift();
				}
				dbg(`Got status: ${stat}`);
				if(logging) {
					dbg("Logging is enabled, attempting write.");
					// Cast to floats/ints otherwise influx will throw a fit
					for(var i = 0; i < 8; i++) { stat[i] = Number(stat[i]); }
					dbc.dbInsert(stat,db);
				}
				rcon.disconnect();
			});
	});
}

console.log("RCON logging script initialized.");

setInterval(function() {
	pingServer();
}, interval);
/*
Got status: CPU,In_(KB/s),Out_(KB/s),Uptime,Map_changes,FPS,Players,Connects
0.00,0.00,0.00,212,3,66.06,0,74,
*/
