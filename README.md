# programmatically_upload_csv_in_superset

A simple script in python that keeps all csv files in a specified folder and creates a dataset foreach csv in superset.
This script is tested on superset **1.3.2**

how to install:

- Clone this repository.
- Open configurations.py and edit it according to your needs.
- Install dependencies if you don't have them already by running `pip install psycopg2`
- Open a terminal and navigate to the folder where you downloaded the script.
- Run the command `python3 superset_csv_upload.py` in the terminal.

note : in order to work, superset must run and postgres must be accessible !
