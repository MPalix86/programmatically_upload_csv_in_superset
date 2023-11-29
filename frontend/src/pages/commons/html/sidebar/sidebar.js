import { frontEndCommons, classes } from '../commons/js/global.js';

const home = document.querySelector('#sidebar-home');
const github = document.querySelector('#sidebar-github');
const Session = classes.Session;
const Paths = classes.Paths;

github.addEventListener('click', function () {
  frontEndCommons.handleNextBtn(Paths.githubHtml, Paths.githubJs);
});

home.addEventListener('click', () => {
  frontEndCommons.handleNextBtn(
    Paths.generalSettingsHtml,
    Paths.generalSettingsJs
  );
});
