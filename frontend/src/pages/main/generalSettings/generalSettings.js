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
  const jsonDirPath = document.querySelector('#json-dir-path')
  const csvDirPath = document.querySelector('#csv-dir-path')
  const jsonDirPathInput = jsonDirPath.querySelector('input')
  const csvDirPathInput = csvDirPath.querySelector('input')



  const settings = Session.settings;
  const nextPageBtn = document.querySelector('#next-page');


  // settin up checkboxes
  useJsonModelCheckbox.checked = settings.useJsonModel
  updateTableIfExistsInput.checked = settings.updateTableIfExists
  replaceTableIfExistsInput.checked = settings.replaceTableIfExists
  useSameJsonForAllCsvCheckbox.checked = settings.useSameJsonForAllCsv
  deleteFilesAfterUploadCheckbox.checked = settings.deleteFilesAfterUpload
  csvDirPathInput.setAttribute('value', settings.csvDirPath)
  jsonDirPathInput.setAttribute('value', settings.jsonModelDirPath)


  useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked


  const jsonModelCheckboxHandler = function () {
    if(!useJsonModelCheckbox.checked) {
      useSameJsonForAllCsvCheckbox.checked = false
      jsonDirPath.classList.add('d-none')
    }
    else {
      jsonDirPath.classList.remove('d-none')

    }
    useSameJsonForAllCsvCheckbox.disabled = !useJsonModelCheckbox.checked
  }
  // checkbox verifying
  useJsonModelCheckbox.addEventListener('change',jsonModelCheckboxHandler)

  // saveSettings 
  const saveSettings = function(){
    settings.useJsonModel = useJsonModelCheckbox.checked;
    settings.updateTableIfExists= updateTableIfExistsInput.checked;
    settings.replaceTableIfExists = replaceTableIfExistsInput.checked;
    settings.useSameJsonForAllCsv = useSameJsonForAllCsvCheckbox.checked;
    settings.deleteFilesAfterUpload = deleteFilesAfterUploadCheckbox.checked;
    settings.csvDirPath = csvDirPathInput.getAttribute('value')
    settings.jsonModelDirPath = jsonDirPathInput.getAttribute('value')
  } 

  const verifySettings = function(){
    const jsonPathVal  = jsonDirPathInput.attributes['value'].value
    const csvPathVal = csvDirPathInput.attributes['value'].value
    let jsonPathVerified = false;
    let csvPathValVerified = false;

    if(useJsonModelCheckbox.checked){
      if(!jsonPathVal){
        jsonDirPathInput.classList.add('is-invalid')
      }else {
        jsonDirPathInput.classList.remove('is-invalid')
        jsonPathVerified = true;
      }
    }else jsonPathVerified = true

    if(csvPathVal){
      csvPathValVerified = true;
      csvDirPathInput.classList.remove('is-invalid')
    }else csvDirPathInput.classList.add('is-invalid')

    if(csvPathValVerified && jsonPathVerified) return true
    return false;
  }


  // prettier-ignore
  nextPageBtn.addEventListener('click', function(){
    saveSettings()
    if(verifySettings()) frontEndCommons.handleNextBtn(Paths.dbSettingsHtml, Paths.dbSettingsJs)
    
  });



  const customDialogs = document.querySelectorAll('.custom-dialog')
  customDialogs.forEach(d => {
    d.addEventListener('click', async function(event) {
      const button = event.target.closest('.select-directory');
      if (button) {
        const valueEL = button.parentNode.querySelector('.directory-value');
        const path = await window.api.getDirDialog();
        if (path) valueEL.setAttribute('value', path)
      }
    });
  })

  

  jsonModelCheckboxHandler()



};

generalSettings();
