# programmatically_upload_csv_in_superset

A Python script that manages all CSV files in a specified folder and creates a dataset for each CSV in Superset. This script has been tested on Superset version 1.3.2.

The script is capable of inferring data types, including date-time.

Please refer to the configuration file configs.py to adjust all settings according to your requirements.

Installation instructions:

    Clone this repository.
    If you haven't installed dependencies yet, run pip install psycopg2 in your terminal.
    Navigate to the folder where you downloaded the script in the terminal.
    Execute the command python3 superset_csv_upload.py

Note: For the script to function properly, Superset must be running, and PostgreSQL must be accessible
