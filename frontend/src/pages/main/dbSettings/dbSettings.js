'use strict';

// prettier-ignore
import { frontEndCommons, classes } from '../commons/js/global.js';

const Session = classes.Session;
const Paths = classes.Paths;

// prettier-ignore
const dbSettings = function () {
  const connLogsDiv = document.querySelector('#test-conn-logs')
  const backBtn = document.querySelector('#prev-page');
  const nextBtn = document.querySelector('#next-page');
  const startTestBtn = document.querySelector('#start-test-btn');
  const postgreSettingsDiv = document.querySelector('#postgre-settings');
  const postgrePortEl = document.querySelector('#postgre-port');
  const postgreHostEl = document.querySelector('#postgre-host');
  const postgreUserEl = document.querySelector('#postgre-user');
  const postgrePasswordEl = document.querySelector('#postgre-password');
  const postgreTargetDbEl = document.querySelector('#postgre-target-db');

  //  recovering settings
  const settings = Session.settings;

  // setting up conection test div
  let height = postgreSettingsDiv.offsetHeight;
  connLogsDiv.style.height = `${height - 50}px`;
  connLogsDiv.style.maxHeight = connLogsDiv.style.height
  connLogsDiv.style.overflowY = 'auto'

  // populating inputs
  postgreTargetDbEl.value = settings.targetDb;
  postgrePasswordEl.value = settings.password;
  postgreUserEl.value = settings.user;
  postgreHostEl.value = settings.host;
  postgrePortEl.value = settings.port;


  // test connection function
  const testConnection = async function () {
    // recovering values 
    settings.port = postgrePortEl.value;
    settings.host = postgreHostEl.value;
    settings.user = postgreUserEl.value;
    settings.password = postgrePasswordEl.value;
    settings.targetDb = postgreTargetDbEl.value;

    // testing db connection
    const testResult = await window.api.testDbConnection(settings);

    // log html element creation
    const createLogElement = function(classList,color ,text){
      const connectionLog = document.createElement('p')
      const icon = document.createElement('i')
      const strong = document.createElement('strong')
      const p = document.createElement('p')

      classList.forEach(c => {
        icon.classList.add(c)
      });
      
      icon.style.color = color
      strong.appendChild(icon)
      p.appendChild(strong)
      p.innerHTML += ` ${testResult.msg} `

     connectionLog.append(p)
     connLogsDiv.prepend(connectionLog)
    }
    
    // print test result
   if(testResult.status){
    nextBtn.classList.remove('disabled')
    createLogElement(['bi', 'bi-database-check', 'bi-3x'], 'green', 'Connection Up')
   }else{
    nextBtn.classList.add('disabled')
    createLogElement(['bi', 'bi-database-x', 'bi-3x'], 'red', 'Connection Failed')
   }
  };

  
  //  LISTENERS 

  startTestBtn.addEventListener('click', testConnection);

  backBtn.addEventListener('click', function () {
    frontEndCommons.handleBackBtn();
  });

  nextBtn.addEventListener('click', function(){
    frontEndCommons.handleNextBtn(Paths.uploadCsvHtml,Paths.uploadCsvJs)
  })


};

dbSettings();
