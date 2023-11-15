const { ipcMain, dialog, app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const { Pool } = require('pg');

/**
 * LISTENER
 */
// prettier-ignore
const renderToMain1Way = function () {

  ipcMain.on('load-header', (event, data) => {
    // Specify the file path
    const headerHtml = path.join(__dirname, '..', 'pages' , 'commons', 'html', 'header.html')

    // Use readFile method to read the file asynchronously
    fs.readFile(headerHtml, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading the file: ${err.message}`);
        return;
      }
      console.log(data)
    });
  });




};

exports.renderToMain1Way = renderToMain1Way;

/**
 * SENDER
 */

/**
 * BIDIRECTIONAL
 */
// prettier-ignore
const loadHeader = async function () {
  const headerHtmlFile = path.join(__dirname, '..', 'pages' , 'commons', 'html', 'header','header.html')
  try {
    const data = await fs.readFile(headerHtmlFile,'utf8');
    return data; // I dati sono restituiti direttamente dalla funzione asincrona
  } catch (err) {
    console.log('errore')
    throw err; 
  }
};

exports.loadHeader = loadHeader;

const testDbConnection = async function (event, dbSettings) {
  console.log(dbSettings);
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

exports.testDbConnection = testDbConnection;
