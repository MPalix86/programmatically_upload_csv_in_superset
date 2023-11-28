import Paths from './paths.js';
import Session from './session.js';
// prettier-ignore
import { startTemplateEngine,registerTemplateElement } from './templateEngine/templateEngine.js';

// const __dirname = await window.api.getDirname();

// const customDialogFile = `${__dirname}/pages/commons/html/customDialog.html`;

// // this register a custom element in this way you can declare a custom html element that will be filled the code in te specified template
// registerTemplateElement('custom-dialog', customDialogFile);

const head = document.querySelector('head');
export const mainContent = document.querySelector('#main-content');

export const frontEndCommons = {
  handleNextBtn: async function (htmlPage, JsPage) {
    const loadedPages = await Paths.nextPage(htmlPage, JsPage);
    const dynamicScript = document.createElement('script');
    mainContent.innerHTML = loadedPages.html;
    dynamicScript.textContent = loadedPages.js;
    dynamicScript.type = 'module';
    mainContent.appendChild(dynamicScript);
  },

  handleBackBtn: async function () {
    if (Session.pages.length <= 1) return;
    const loadedPages = await Paths.prevPage();
    const dynamicScript = document.createElement('script');
    mainContent.innerHTML = loadedPages.html;
    dynamicScript.textContent = loadedPages.js;
    dynamicScript.type = 'module';
    mainContent.appendChild(dynamicScript);
  },
};

export const classes = {
  Paths: Paths,
  Session: Session,
};

window.api.loadHeader().then(res => {
  head.innerHTML += res;
});

/**
 * You can use the following approach:
 *
 * await Paths.init();
 * await Session.init();
 *
 * However, note that 'Session.init' and 'Paths.init' are not executed concurrently in this way.
 *
 * Using Promise.all(), they are executed concurrently, and the code waits until both promises are resolved before proceeding.
 */
await Promise.all([Paths.init(), Session.init()]);

// loading firts page
await frontEndCommons.handleNextBtn(
  Paths.generalSettingsHtml,
  Paths.generalSettingsJs
);

/**
 * starts the template engine that
 */
startTemplateEngine();
