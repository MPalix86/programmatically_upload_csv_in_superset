from flask import Flask, request, jsonify
import superset_csv_uploader as su
import configurations as conf



app = Flask('programmaticaly_upload_csv_in_superset')

@app.route('/')
def hello_world():
    data = {
        'message': 'Hello, World!',
        'number': 42
    }
    return  jsonify(data)



@app.route('/upload_csv', methods=['POST'])
def upload_csv():
    data = request.get_json()
    

    return su.test(data)

app.run()