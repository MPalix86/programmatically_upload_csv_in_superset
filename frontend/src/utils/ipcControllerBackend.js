const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const axios = require('axios');
const { randomUUID } = require('crypto');
const dialog = require('electron').dialog;
const logsWatcher = require('./logsWatcher');
const Tail = require('tail').Tail;
const opn = require('opn');

/**
 * LISTENER
 */
// prettier-ignore
// const renderToMain1Way = function () {

//   ipcMain.on('load-header', (event, data) => {
//     // Specify the file path
//     const headerHtml = path.join(__dirname, '..', 'pages' , 'commons', 'html', 'header.html')

//     // Use readFile method to read the file asynchronously
//     fs.readFile(headerHtml, 'utf8', (err, data) => {
//       if (err) {
//         console.error(`Error reading the file: ${err.message}`);
//         return;
//       }
//       console.log(data)
//     });
//   });
// };

// exports.renderToMain1Way = renderToMain1Way;

/**
 * SENDER
 */

/**
 * BIDIRECTIONAL
 */
// prettier-ignore
exports.loadHeader = async function () {
  const headerHtmlFile = path.join(__dirname, '..', 'pages' , 'commons', 'html', 'header','header.html')
  try {
    const data = await fs.readFile(headerHtmlFile,'utf8');
    return data; // I dati sono restituiti direttamente dalla funzione asincrona
  } catch (err) {
    console.log('errore')
    throw err; 
  }
};

exports.testDbConnection = async function (event, dbSettings) {
  const pool = new Pool({
    user: dbSettings.user,
    host: dbSettings.host,
    database: dbSettings.realDb,
    password: dbSettings.password,
    port: dbSettings.port,
  });
  // prettier-ignore
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    return { status: true, msg: 'Connected to PostgreSQL database' };
  } catch (error) {
    console.error('Error connecting to the database', error.message);
    return { status: false, msg: `Error connecting to the database ${error.message}`};
  } finally {
    await pool.end();
  }
};

exports.uploadCsv = async function (event, settings) {
  const apiUrl = 'http://localhost:5000/upload_csv';
  try {
    const response = await axios.post(apiUrl, settings);
    console.log('response received', response.data);
    return response.data;
  } catch (err) {
    return err;
  }
};

exports.getDirDialog = async function () {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  console.log(res.filePaths);
  if (!res.canceled) return res.filePaths;
};

exports.getFileDialog = async function () {
  const res = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (!res.canceled) return res.filePaths;
};

let tail = undefined;

exports.startWatchingLogs = function (win) {
  // prettier-ignore
  tail = new Tail( path.join(__dirname, '..', '..', '..', 'logs', 'csv_uploader.log'));

  tail.on('line', data => {
    win.webContents.send('log-event', data);
  });
};

exports.stopWatchingLogs = function () {
  tail.unwatch();
  tail = undefined;
};

exports.openExternalLink = function (link) {
  opn(link);
};
