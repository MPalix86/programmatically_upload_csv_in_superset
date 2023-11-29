import Session from './session.js';

class Paths {
  static pagesDir;
  static mainDir;
  static mainHtml;
  static dbSettingsDir;
  static generalSettingsDir;
  static generalSettingsHtml;
  static generalSettingsJs;
  static commonsDir;
  static htmlDir;
  static customDialog;
  static sidebarHtml;
  static sidebarJs;
  static githubHtml;
  static githubJs;

  // prettier-ignore
  static async init() {
    const __dirname = await window.api.getDirname();
    this.pagesDir = `${__dirname}/pages`;

    this.commonsDir = `${this.pagesDir}/commons`
      this.htmlDir = `${this.commonsDir}/html`
        this.customDialog = `${this.htmlDir}/customDialog.html`
        const sidebarDir = `${this.htmlDir}/sidebar`
          this.sidebarHtml = `${sidebarDir}/sidebar.html`
          this.sidebarJs = `${sidebarDir}/sidebar.js`



    this.mainDir = `${this.pagesDir}/main`;
    this.mainHtml = `${this.mainDir}/main.html`;

      this.dbSettingsDir = `${this.mainDir}/dbSettings`;
      this.dbSettingsHtml = `${this.dbSettingsDir}/dbSettings.html`;
      this.dbSettingsJs = `${this.dbSettingsDir}/dbSettings.js`;

      this.generalSettingsDir = `${this.mainDir}/generalSettings`;
      this.generalSettingsHtml = `${this.generalSettingsDir}/generalSettings.html`;
      this.generalSettingsJs = `${this.generalSettingsDir}/generalSettings.js`;
      
      this.uploadCsvDir = `${this.mainDir}/uploadCsv`;
      this.uploadCsvHtml = `${this.uploadCsvDir}/uploadCsv.html`;
      this.uploadCsvJs = `${this.uploadCsvDir}/uploadCsv.js`;

      const githubDir = `${this.mainDir}/github`;
      this.githubHtml = `${githubDir}/github.html`;
      this.githubJs = `${githubDir}/github.js`;
  }

  static async nextPage(pagePath, jsPath) {
    const sessionPages = {
      htmlPagePath: pagePath,
      jsPagePath: jsPath,
    };
    Session.pages.push(sessionPages);
    console.log(Session.pages);
    const loadedPages = await this.loadPage();
    return loadedPages;
  }

  static async prevPage() {
    if (Session.pages.length <= 1) return;
    Session.pages.pop();
    console.log(Session.pages);
    const loadedPages = await this.loadPage();
    return loadedPages;
  }

  static async loadPage() {
    const sessionPages = Session.pages[Session.pages.length - 1];
    const obj = {
      html: '',
      js: '',
    };

    const loadHtml = async function () {
      try {
        const res = await fetch(sessionPages.htmlPagePath);
        if (!res.ok) throw new Error(`Errore HTTP: ${risposta.status}`);
        const html = await res.text();
        obj.html = html;
      } catch (err) {
        console.error('Error loading external HTML:', err);
      }
    };

    const loadJs = async function () {
      try {
        const res = await fetch(sessionPages.jsPagePath);
        const js = await res.text();
        obj.js = js;
      } catch (err) {
        console.log('JS NON TROVATO VERRA CARICATA UNA STRINGA VUOTA');
        obj.js = '';
      }
    };

    await Promise.all([loadHtml(), loadJs()]);

    return obj;
  }
}

export default Paths;
