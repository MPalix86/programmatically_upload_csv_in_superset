const pino = require('pino');
const path = require('path');
const os = require('os');
const fs = require('fs');

let logPathFe = undefined;
let LogFileBe = undefined;
let logDirPath = undefined;

// Specify the directory name
const logDirName = '.programmatically_upload_csv';
const LogFileNameFe = 'fe.log';
const logFileNameBe = 'be.log';

// prettier-ignore
if (os.type() === 'Linux' || os.type() === 'Darwin') {
  logPathFe = path.join(os.homedir() , logDirName , LogFileNameFe);
  LogFileBe = path.join(os.homedir() ,logDirName , logFileNameBe);
  logDirPath = path.join(os.homedir(), logDirName)
  
} else if (os.type() == 'Windows_NT') {
  logPathFe = path.join(os.homedir() , 'Documents' , logDirName , LogFileNameFe);
  LogFileBe = path.join(os.homedir() , 'Documents', logDirName , logFileNameBe);
  logDirPath = path.join(os.homedir(), 'Documents',logDirName)
}

fs.mkdir(logDirPath, err => {});

process.env.beLogFilePath = LogFileBe;

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: logPathFe },
    },
    {
      target: 'pino/file', // logs to the standard output by default
    },
  ],
});

module.exports = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
