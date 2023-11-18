class Session {
  static settings;
  static pages = [];

  static async init() {
    const settings = await window.api.getSettings();
    this.settings = settings;
  }

  static async setSettings(settings) {
    window.api.setSettings(settings);
  }
}

export default Session;
