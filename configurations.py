# global var
csv_ext = '.csv'
output_dir = '/home/mirco/engineering/energidrica/elaboration/output'  

# if a table is already in db  will delete the table and replace it
drop_table_if_exists = True

# superset db configurations
host="127.0.0.1"        # host 
port=5432               # postgre port ( usually 5432 )
user="superset"         # username
password="superset"     # password
default_db="examples"   # db on wich upload dataset
default_db_id=2         # id db 
superset_db="superset"  # the defalut superset db
seuperset_db_id=1       # the id of superset db


# TABLES
# this conf are for the table 'tables' in superset that describe the new created table for a specific dataset
def get_superset_tables_conf(table_name:str, database_id, database_name:str, uuid:str):
    
    # defalut values 
    row_values = {
        "created_on": 'now()',
        "changed_on": 'now()',
        "table_name": "'" + table_name +"'",
        "main_dttm_col": None,
        "default_endpoint": None,
        "database_id": str(database_id),
        "created_by_fk": 1,
        "changed_by_fk": 1,
        '"offset"': 0,
        "description": None,
        "is_featured": 'false',
        "cache_timeout": None,
        "schema": None,
        "sql": None,
        "params": None,
        "perm": "'[PostgreSQL].[" + table_name +"](id:" + str(database_id) +")'", # TODO : mettere il table id al posto del database id,
        "filter_select_enabled": 'false',
        "fetch_values_predicate": None,
        "is_sqllab_view": 'false',
        "template_params": None,
        "schema_perm": None,
        "extra": None,
        "uuid": "'" + uuid  + "'"
    }


    return row_values;


# TBALE_COLUMNS
# this conf are for the table 'table_columns' in superset, that describe the columns of created table table
superset_table_columns_cols = [
    'created_on',
    'changed_on',
    'table_id',
    'column_name',
    'is_dttm',
    'is_active',
    'type',
    'groupby',
    'filterable',
    'description',
    'created_by_fk',
    'changed_by_fk',
    'expression',
    'verbose_name',
    'python_date_format',
    'uuid'
]


# TBALE_COLUMNS
# this conf are for the table table_columns in superset that describe each column for a specific dataset
def get_superset_table_columns_conf(table_id:int, column_name:str, data_type:str,uuid:str):

    # default values foreach row
    # you need to generate one row per each column of your dataset
    default_values = {
        superset_table_columns_cols[0]:'now()',
        superset_table_columns_cols[1]:'now()',
        superset_table_columns_cols[2]: table_id,
        superset_table_columns_cols[3]: "'" + column_name + "'",
        superset_table_columns_cols[4]: 'false',
        superset_table_columns_cols[5]: 'true',
        superset_table_columns_cols[6]: "'" + data_type + "'",
        superset_table_columns_cols[7]: 'true',
        superset_table_columns_cols[8]: 'true',
        superset_table_columns_cols[9]:  None ,
        superset_table_columns_cols[10]: 1,
        superset_table_columns_cols[11]: 1,
        superset_table_columns_cols[12]: None,
        superset_table_columns_cols[13]: None,
        superset_table_columns_cols[14]: None,
        superset_table_columns_cols[15]: "'" +  uuid  + "'"
    }

    return default_values


