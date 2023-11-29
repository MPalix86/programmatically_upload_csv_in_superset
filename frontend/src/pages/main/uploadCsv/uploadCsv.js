import { frontEndCommons, classes } from '../commons/js/global.js';

const logDiv = document.querySelector('#log-div');
const newUploadBtn = document.querySelector('#new-upload-page');

const Paths = classes.Paths;
const Session = classes.Session;

const uploadCsvPage = async function () {
  const settings = Session.settings;

  const createLogEvenet = function (data) {
    const logEl = document.createElement('p');
    logEl.innerHTML = data;
    logDiv.appendChild(logEl);
  };

  // setting up callback for log event received
  window.api.onLogEvent((event, data) => {
    createLogEvenet(data);
  });

  /**
   * starting monitoring on log file every time  alog wa insert in the file an event was emitted and
   * the above onLogEvent handler wa called
   */
  window.api.startWatchingLogs();

  newUploadBtn.addEventListener('click', () => {
    frontEndCommons.handleNextBtn(
      Paths.generalSettingsHtml,
      Paths.generalSettingsJs
    );
  });

  //  uploading the csv files and waiting
  const response = await window.api.uploadCsv(settings);
  if (response.status == 'ok') window.api.stopWatchingLogs();
  else createLogEvenet(response);

  newUploadBtn.classList.remove('disabled');
};

uploadCsvPage();
