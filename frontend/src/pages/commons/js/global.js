import Paths from './paths.js';
import Session from './session.js';

const head = document.querySelector('head');
const sideBar = document.querySelector('#sidebar');
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

// loading sidebar
const loadedPages = await Paths.nextPage(Paths.sidebarHtml, Paths.sidebarJs);
const dynamicScript = document.createElement('script');
sideBar.innerHTML = loadedPages.html;
dynamicScript.textContent = loadedPages.js;
dynamicScript.type = 'module';
sideBar.append(dynamicScript);

// loading firts page
await frontEndCommons.handleNextBtn(
  Paths.generalSettingsHtml,
  Paths.generalSettingsJs
);
