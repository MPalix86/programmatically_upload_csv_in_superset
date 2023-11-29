const electron = require('electron');
const path = require('path');
const ipcController = require('./utils/ipcControllerBackend');
const contextMenu = require('electron-context-menu');
const Session = require(`./utils/session`);
const childProcess = require('child_process');
const Menu = electron.Menu;
const logger = require('./utils/logger');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const session = new Session();

// prettier-ignore
let win = undefined
const main = async function () {
  try {
    await session.loadSettings();

    contextMenu({
      showSaveImageAs: true,
    });

    try {
      /**
       * running a new process with python server for the backend stuff
       */
      const pythonScript = path.join(__dirname, '..', 'extraResources', 'main');
      logger.info({ pythonScript }, ' provo a caricare il file');
      const pythonProcess = childProcess.spawn(pythonScript);
      pythonProcess.stdout.on('data', data => {
        logger.info(` PYTHON BACKEND START ${data}`);
      });

      pythonProcess.stderr.on('data', data => {
        logger.error(`PYTHON PROCESS ERROR ${data}`);
      });
    } catch (err) {
      logger.error(err);
    }

    const createWindow = () => {
      const dir = path.join(__dirname, 'pages', 'preload.js');
      console.log(dir);
      win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'pages', 'main', 'preload.js'),
          sandbox: false,
        },
      });

      win.loadFile(path.join(__dirname, 'pages', 'main', 'main.html'));
    };

    // prettier-ignore
    app.whenReady().then(() => {
      electron.ipcMain.handle('load-header', ipcController.loadHeader);
      electron.ipcMain.handle('get-dirname', () =>{return  __dirname } );
      electron.ipcMain.handle('get-settings', () => {return session.settings});
      electron.ipcMain.handle('test-db-connection', (event, dbSettings) => ipcController.testDbConnection(event,dbSettings) )
      electron.ipcMain.handle('upload-csv', (event, settings) => {return ipcController.uploadCsv(event,settings)} )
      electron.ipcMain.handle('get-dir-dialog', ipcController.getDirDialog) 
      electron.ipcMain.handle('start-watching-logs', () => ipcController.startWatchingLogs(win)) 
      electron.ipcMain.handle('stop-watching-logs', ()=> ipcController.stopWatchingLogs(win)) 
      electron.ipcMain.handle('open-external-link', (event,link)=> ipcController.openExternalLink(link)) 
      createWindow();
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    });

    const menu = Menu.buildFromTemplate([
      {
        label: 'file',
        submenu: [
          {
            click: () => win.close(),
            label: 'exit',
          },
        ],
      },
    ]);

    Menu.setApplicationMenu(menu);

    app.on('before-quit', () => {
      pythonProcess.kill('SIGINT');
    });
  } catch (error) {
    logger.error(error.message);
  }
};

main();
