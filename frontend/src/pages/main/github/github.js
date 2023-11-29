const githubSupport = document.querySelector('#github-support');
githubSupport.addEventListener('click', e => {
  e.preventDefault();
  window.api.openExternalLink(
    'https://github.com/MPalix86/programmatically_upload_csv_in_superset'
  );
});
