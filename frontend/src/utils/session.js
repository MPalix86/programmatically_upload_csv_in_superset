const fs = require('fs/promises');

let Session = class {
  settings = {};
  settingsPath = `${__dirname}/../settings/settings.json`;
  constructor() {}

  async loadSettings() {
    try {
      const result = await fs.readFile(this.settingsPath, 'utf8');
      this.settings = JSON.parse(result);
      return this.settings;
    } catch (error) {
      throw new Error('Cannot read session file ' + error);
    }
  }

  get settings() {
    return this.settings;
  }

  set settings(settings) {
    this.settings = settings;
  }
};

module.exports = Session;
