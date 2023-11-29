const { watch } = require('node:fs/promises');
const path = require('path');
const Tail = require('tail').Tail;

let watcher = undefined;

exports.watchFile = async function (win) {
  var tail = new Tail(
    path.join(__dirname, '..', '..', '..', 'logs', 'csv_uploader.log')
  );

  console.log(win);
  tail.on('line', data => {
    win.webContents.send('log-event', data);
    console.log(data);
  });
};

exports.stopWatching = function () {
  watcher.close();
};
