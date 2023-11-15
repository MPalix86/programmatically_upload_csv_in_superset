// prettier-ignore
import { frontEndCommons, classes } from './global.js';

const Paths = classes.Paths;
const Session = classes.Session;

// prettier-ignore
const generalSettings = async function () {

  const useJsonModelCheckbox = document.querySelector('#use-json-model');
  const updateTableIfExistsInput = document.querySelector('#update-table-if-exists');
  const recreateTableIfExistsInput = document.querySelector('#recreate-table-if-exists');
  const deleteFilesAfterUploadCheckbox = document.querySelector('#delete-files-after-upload');
  const useSameJsonForAllCsvCheckbox = document.querySelector('#use-same-json-for-all-csv');

  const generalSettings = Session.settings.generalSettings;
  const nextPageBtn = document.querySelector('#next-page');



    // settin up checkboxes
  useJsonModelCheckbox.checked = generalSettings.useJsonModel
  updateTableIfExistsInput.checked = generalSettings.updateTableIfExists
  recreateTableIfExistsInput.checked = generalSettings.recreateTableIfExists
  useSameJsonForAllCsvCheckbox.checked = generalSettings.useSameJsonForAllCsv
  deleteFilesAfterUploadCheckbox.checked = generalSettings.deleteFilesAfterUpload

  useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked

  // checkbox verifying
  useJsonModelCheckbox.addEventListener('change', function(){
    if(!useJsonModelCheckbox.checked) useSameJsonForAllCsvCheckbox.checked = false
     useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked
  })

  // saveSettings 
  const saveSettings = function(){
    generalSettings.useJsonModel = useJsonModelCheckbox.checked;
    generalSettings.updateTableIfExists= updateTableIfExistsInput.checked;
    generalSettings.recreateTableIfExists = recreateTableIfExistsInput.checked;
    generalSettings.useSameJsonForAllCsv = useSameJsonForAllCsvCheckbox.checked;
    generalSettings.deleteFilesAfterUpload = deleteFilesAfterUploadCheckbox.checked;

    console.log(generalSettings)
  } 


  // prettier-ignore
  nextPageBtn.addEventListener('click', function(){
    frontEndCommons.handleNextBtn(Paths.dbSettingsHtml, Paths.dbSettingsJs)
    saveSettings()
  });
};

generalSettings();
