// prettier-ignore
import { frontEndCommons, classes } from '../commons/js/global.js';

const Paths = classes.Paths;
const Session = classes.Session;

// prettier-ignore
const generalSettings = async function () {

  const useJsonModelCheckbox = document.querySelector('#use-json-model');
  const updateTableIfExistsInput = document.querySelector('#update-table-if-exists');
  const replaceTableIfExistsInput = document.querySelector('#replace-table-if-exists');
  const deleteFilesAfterUploadCheckbox = document.querySelector('#delete-files-after-upload');
  const useSameJsonForAllCsvCheckbox = document.querySelector('#use-same-json-for-all-csv');
  // const jsonFolderPathInput = document.querySelector('json-dir-path').chil
  // const csvFolderPathInput = document.querySelector('csv-dir-path')


  const settings = Session.settings;
  const nextPageBtn = document.querySelector('#next-page');


  // settin up checkboxes
  useJsonModelCheckbox.checked = settings.useJsonModel
  updateTableIfExistsInput.checked = settings.updateTableIfExists
  replaceTableIfExistsInput.checked = settings.replaceTableIfExists
  useSameJsonForAllCsvCheckbox.checked = settings.useSameJsonForAllCsv
  deleteFilesAfterUploadCheckbox.checked = settings.deleteFilesAfterUpload

  useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked

  // checkbox verifying
  useJsonModelCheckbox.addEventListener('change', function(){
    if(!useJsonModelCheckbox.checked) useSameJsonForAllCsvCheckbox.checked = false
     useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked
  })

  // saveSettings 
  const saveSettings = function(){
    settings.useJsonModel = useJsonModelCheckbox.checked;
    settings.updateTableIfExists= updateTableIfExistsInput.checked;
    settings.replaceTableIfExists = replaceTableIfExistsInput.checked;
    settings.useSameJsonForAllCsv = useSameJsonForAllCsvCheckbox.checked;
    settings.deleteFilesAfterUpload = deleteFilesAfterUploadCheckbox.checked;
  } 


  // prettier-ignore
  nextPageBtn.addEventListener('click', function(){
    frontEndCommons.handleNextBtn(Paths.dbSettingsHtml, Paths.dbSettingsJs)
    saveSettings()
  });


};

generalSettings();
