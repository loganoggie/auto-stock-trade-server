// Just making sure this module ran
// Global Module Handling -------------------------------------------------------------
var pg = require('pg');
const {Client} = require('pg');
//-------------------------------------------------------------------------------------

//db connection string
var dbString = 'postgres://whiidzewjaaqzm:0001b1a8a6fa014941cfa07feb3bb8f8049f2210a11f1d5f14895ea6fac6f955@ec2-184-73-196-65.compute-1.amazonaws.com:5432/deacrvvlj7rj32';

const client = new Client({
  connectionString: dbString,
  ssl: true,
});

const pool = new pg.Pool(client);
pool.on('error', function (err) {
  console.log('Connection error', err);
});

client.connect();

module.exports.client = client;
module.exports.pool = pool;
module.exports.dbString = dbString;
