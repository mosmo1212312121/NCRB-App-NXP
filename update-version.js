const fs = require('fs');
const moment = require('moment-timezone');
moment()
  .tz('Asia/Bangkok')
  .format();
const fileName = './package.json';
const file = require(fileName);

// old version
const versions = file.version.split('.');
const subVersions = versions[2].split('-');

/**
 * Checking change from parameters
 * example: node update-version.js lv=minor
 */
let major = 0;
let minor = 0;
let patch = 0;
let typeChange = null;
let versionName = null;
for (let i = 0; i < process.argv.length; i++) {
  const val = process.argv[i].split('=');
  if (val.length > 1 && val[0] === 'lv' && val[1]) {
    typeChange = val[1];
  }
  if (val.length > 1 && val[0] === 'name' && val[1]) {
    versionName = val[1];
  }
}
switch (typeChange) {
  case 'major':
    major++;
    break;
  case 'minor':
    minor++;
    break;
  case 'patch':
    patch++;
    break;
  default:
    patch++;
    break;
}

// new version
const newVersion = `${parseInt(versions[0], 10) + major}.${parseInt(versions[1], 10) + minor}.${parseInt(
  subVersions[0],
  10
) + patch}${versionName ? versionName : subVersions.length > 1 ? '-' + subVersions[1] : ''}`;

// new date
const newDate = moment(new Date()).format('DD MMM YYYY HH:mm');

// update
file.version = newVersion;
file.date = newDate;

fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});
