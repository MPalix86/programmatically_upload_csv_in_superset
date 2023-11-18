import { classes } from '../commons/js/global.js';

const uploadCsv = async function () {
  const settings = classes.Session.settings;
  window.api.uploadCsv(settings);
};

uploadCsv();
