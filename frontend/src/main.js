const electron = require('electron');
const path = require('path');
const ipcController = require('./utils/ipcControllerBackend');
const contextMenu = require('electron-context-menu');
const Session = require(`./utils/session`);

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const session = new Session();

(async function () {
  try {
    await session.loadSettings();
    console.log(session.settings);

    contextMenu({
      showSaveImageAs: true,
    });

    /**
     * running a new process with python server for the backend stuff
     */
    // const pythonScript = path.join(__dirname, '..', '..', 'backend', 'main.py');
    // const pythonProcess = childProcess.spawn('python3', [pythonScript]);
    // pythonProcess.stdout.on('data', data => {
    //   console.log(` PYTHON ${data}`);
    // });

    // pythonProcess.stderr.on('data', data => {
    //   console.error(`PYTHON ${data}`);
    // });

    const createWindow = () => {
      const dir = path.join(__dirname, 'pages', 'preload.js');
      console.log(dir);
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'pages', 'preload', 'preload.js'),
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

      createWindow();
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    });

    ipcController.renderToMain1Way();
  } catch (error) {
    console.error(error.message);
  }
})();
