module.exports = {
	dbInsert: function(stat) {
		const Influx = require('influx');
		
		// Connect to the actual DB, and describe
		// the type of data that we will be dumping
		// into it.
		const influx = new Influx.InfluxDB({
			//host: 'ttt.throneridge.com',
			host: 'localhost',
			database: 'srcds_db',
			schema: [{
				measurement: 'srcds',
				fields: {
					cpu:		Influx.FieldType.FLOAT,
					inKB:		Influx.FieldType.FLOAT,
					outKB:		Influx.FieldType.FLOAT,
					uptime:		Influx.FieldType.INTEGER,
					map_changes:	Influx.FieldType.INTEGER,
					fps: 		Influx.FieldType.FLOAT,
					players:	Influx.FieldType.INTEGER,
					connects:	Influx.FieldType.INTEGER
				},
				tags: [ 'game' ]
			}]
		});
		
		// Ensure that the database that we want to
		// connect to actually exists. 
		influx.getDatabaseNames().then(names => { 
			if(names.indexOf('srcds_db') == -1) {
				// Attempt to create it
				influx.createDatabase('srcds_db');
			}
		});
		
		// Attempt to write to the database using the
		// data found in the status report 'stat'
		influx.writePoints([{
			measurement: 'rcon_response',
			tags: { srcds: 'gmod' },
			fields: {
				cpu: 		stat[0],
				inKB: 		stat[1],
				outKB: 		stat[2],
				uptime: 	stat[3],
				map_change:	stat[4],
				fps: 		stat[5],
				players:	stat[6],
				connects:	stat[7]
			}	
			
		}]).catch(err => { console.error(`Something went wrong saving that record. ${err.stack}`); });
	}
};
