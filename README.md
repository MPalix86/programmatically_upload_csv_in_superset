# programmatically_upload_csv_in_superset

A Python script that manages all CSV files in a specified folder and creates a dataset for each CSV in Superset. This script has been tested on Superset version 1.3.2.
The script is also capable of inferring data types, including date-time.


### LOCAL CONFIGURATION 
Please refer to the configuration file `configs.py` to adjust all settings according to your requirements.

Installation instructions: 
   
- Clone this repository.
- If you haven't installed dependencies yet, run pip install psycopg2 in your terminal.
 
Note: For the script to function properly, Superset must be running, and PostgreSQL must be accessible
see the exemple inside `usage_example.py`

### EXPOSING API 
The file `main.py` contains a simple API through which you can call this service externally. If you want to use it as an API, the POST call must look like:



```json
 {
  "updateTableIfExists": true,
  "replaceTableIfExists": false,
  "useJsonModel": false,
  "useSameModelForAllCsv": false,
  "deleteFilesAfterUpload": false,
  "jsonModelDirPath": "",
  "csvDirPath": "",
  "user": "superset",
  "host": "127.0.0.1",
  "port": 5432,
  "password": "superset",
  "targetDb": "examples",
  "supersetDb": "superset"
}
```
Please note that in this way, the configurations specified in `configurations.js` will be overwritten by these parameters.

