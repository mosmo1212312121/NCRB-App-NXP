const fs = require('fs');
const moment = require('moment-timezone');
moment()
  .tz('Asia/Bangkok')
  .format();
const fileName = './package.json';
const file = require(fileName);

/**
 * Checking change from parameters
 * example: node update-version.js lv=minor
 */

// new date
const newDate = moment(new Date()).format('DD MMM YYYY HH:mm');

// update
file.date = newDate;

fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});
