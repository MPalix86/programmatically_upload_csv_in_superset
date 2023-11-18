const axios = require('axios');

const uploadCsv = async function (event, settings) {
  const apiUrl = 'http://localhost:5000/upload_csv';
  const postData = {
    key1: 'value1',
    key2: 'value2',
  };
  axios
    .post(apiUrl, postData)
    .then(response => {
      // Handle the API response data
      console.log(response.data);
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error.message);
    });
};

// uploadCsv();
const { dialog } = require('electron');

getFile();
