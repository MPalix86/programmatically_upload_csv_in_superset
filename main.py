import json
from flask import Flask, request, jsonify
import superset_csv_uploader as su
import configurations as conf
import logging
import time



logging.basicConfig(filename=conf.get_log_file(), level=logging.INFO, format='%(asctime)s - %(levelname)s: %(message)s')

app = Flask('programmaticaly_upload_csv_in_superset')



@app.route('/upload_csv', methods=['POST'])
def upload_csv():

    # remove all the stuff inside log file
    with open(conf.get_log_file(), 'w') as file:
        pass
    data = request.get_json()
   
    res = su.upload_csv_in_superset(csv_dir_path=data['csvDirPath'], use_model=data['useJsonModel'], external_conf=data, model_dir_path=data['jsonModelDirPath'] )
    if(res): 
        res = {"status" : 'ok'} 
    return json.dumps(res)

app.run()
