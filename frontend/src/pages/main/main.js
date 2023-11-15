import { frontEndCommons, classes } from './global.js';

const Paths = classes.Paths;

const main = async function () {
  frontEndCommons.handleNextBtn(
    Paths.generalSettingsHtml,
    Paths.generalSettingsJs
  );
};

main();
