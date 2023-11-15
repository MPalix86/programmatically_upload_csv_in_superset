from flask import Flask, jsonify
import superset_csv_uploader as su


app = Flask('programmaticaly_upload_csv_in_superset')

@app.route('/')
def hello_world():
    data = {
        'message': 'Hello, World!',
        'number': 42
    }
    return  jsonify(data)



@app.route('/upload_csv')
def upload_csv():
    pass
    # su.upload_csv_in_superset('./csv_test',use_model=False)
    
app.run()