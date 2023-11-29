module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
  ],
  electronPackagerConfig: {
    icon: './extraResources/icon.png',
    // Other electron-packager configurations
  },
};
