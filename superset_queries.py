import csv
import uuid
import configurations as conf
import json
from dateutil import parser
import logging

logging.basicConfig(filename=conf.get_log_file(), level=logging.INFO, format='%(asctime)s - %(levelname)s: %(message)s')


class SupersetQueries:

    ################################ JSON MODEL FIELDS
    # postgres data type 
    model_postgres_type = 'postgres_type'

    # the name that the field will have in superset
    model_name = 'name'

    # the superset data type 
    model_superset_type = 'superset_type'

    # true if you need to use a json model that describe your csv
    use_model = False;

    # Folder from which to pick the model file (it is assumed that the model file and CSV file have the same names)    
    model_dir_path = ''

    # A dictionary containing the loaded csv model
    model = {}
    ##################################################

    # tables thasuperset_typet superset uses to do stuff
    superset_tables_name = conf.superset_tables_name
    superset_table_columns_name = conf.superset_table_columns_name
    
    # The name of the csv file
    csv_file_name = '';

    def __init__(self,use_model,model_dir_path,csv_file_name):
        self.use_model = use_model
        self.model_dir_path = model_dir_path
        self.csv_file_name = csv_file_name
        if(self.use_model):
            try:
                logging.info(f"loading model from: {self.model_dir_path}/{self.csv_file_name}.json ")
                with open(f"{self.model_dir_path}/{self.csv_file_name}.json", "r") as json_file:
                    self.model = json.load(json_file)
                    logging.info('model loaded correctly')
            except FileNotFoundError:
                logging.info(FileNotFoundError.errno)
                logging.info("error occurred loading model, the upload will continue trying to infer data types and using column names as field name for superset")
                self.use_model = False;
                self.model = {}
    
    def print_query(self,query):
        if(conf.print_queries):
            logging.info(query)
      

    # Your other methods can be defined here as instance methods.
    def table_exists_query(self, schema):
        query = f"SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = '{schema}' AND tablename = '{self.csv_file_name}');"
        self.print_query(query)
        return query

    def drop_table_if_exists(self,):
        query = f'DROP TABLE IF EXISTS {self.csv_file_name};'
        self.print_query(query)
        return query

    def get_id_from_tables(self):
        query = f"SELECT id FROM {self.superset_tables_name} WHERE table_name = '{self.csv_file_name}'" 
        self.print_query(query)
        return query

    def delete_column_from_superset_tables(self, table_id):
        query = f"DELETE FROM {self.superset_tables_name} WHERE id = {table_id}"
        self.print_query(query)
        return query

    def delete_columns_from_superset_table_columns(self, table_id):
        query = f"DELETE FROM {self.superset_table_columns_name} WHERE table_id = {table_id}"
        self.print_query
        return query

    def get_database_info(self, database_name):
        query = f"SELECT * FROM dbs WHERE database_name = '{database_name}'"
        self.print_query(query)
        return query

    def csv_create_table_query(self, dir):
        query = f'CREATE TABLE {self.csv_file_name} (\n'
        self.print_query(query)
        return query

    def delete_all_table_rows(self):
        query = f'DELETE FROM "{self.csv_file_name}"';
        self.print_query(query)
        return query

    def count_table_rows(self):
        query = f"SELECT COUNT(*) FROM {self.csv_file_name}"
        self.print_query(query)
        return query
   

    def csv_create_table_query(self,dir:str, ):
        create_table_query = f' CREATE TABLE "{self.csv_file_name}" ( \n';
        csv_file=f'{dir}/{self.csv_file_name}{conf.csv_ext}'

        with open(csv_file, 'r') as file:
            reader = csv.reader(file)

            column_names = next(reader)
            data = next(reader)  # first data column is used to infer types

            for j, col in enumerate(column_names, start=0):
                db_col_name = ''
                col = col.replace("'","") 
                if self.use_model:
                    db_col_name =  self.model.model[col][self.model_name]
                    data_type = self.model.model[col]["model_postgres_type"]
                else:
                    db_col_name = f'{col}'
                    data_type = self.infer_data_types(data[j])['postgres']

                create_table_query += f'"{db_col_name}" {data_type},\n'

        create_table_query = create_table_query[:-2]
        create_table_query += ');'

        self.print_query(create_table_query)
        return create_table_query

    def csv_insert_data_query(self,dir: str):
        csv_file=f'{dir}/{self.csv_file_name}{conf.csv_ext}'
        
        with open(csv_file, 'r') as f:
            reader = csv.reader(f)
            colum_names = next(reader)
            insert_query = f'INSERT INTO "{self.csv_file_name}" (' # starting insert query
            
            for j,col in enumerate(colum_names, start=0):
                insert_query += f'"{col}", ';
            insert_query = insert_query[:-2] 
            insert_query += ') VALUES \n' 

            # insert query generation 
            for i,row in enumerate(reader,start=1):
                insert_query = f'{insert_query} ('                   
                for j, col in enumerate(row, start=1):              
                    # replacing ' with '', ' cause problesm to the query
                    data_type_obj = self.infer_data_types(col)
                    col = data_type_obj['data']
                    col = col.replace("'", "''")
                    if (data_type_obj['postgres'] != self.postgres_types['int'] or data_type_obj['postgres'] != self.postgres_types['float']):
                        col = data_type_obj['data']
                        if (col == ''):
                            col = 'NULL'  # if col is empty we must put NULL
                        else:
                            # if it's string, simply add quotes
                            col = f"'{col}'"                      # if it's string, simply add quotes 
                    if(j == len(row)):
                        insert_query =  insert_query + col
                    else: insert_query = insert_query + col + ','   # add comma only if is not last element 
                insert_query = f'{insert_query} ),\n'               # closing element parethesis and adding new line
        
        # removing last comma
        insert_query = insert_query[:-2] 
        self.print_query(insert_query)
        return  insert_query
    
    # generate query for table 'tables' in superset this table describe the table you wanto to create
    def generate_superset_tables_query(self,database_id:int):
        cols_dict = conf.get_superset_tables_conf(self.csv_file_name,database_id,database_id,str(uuid.uuid4()))

        columns_query = f'INSERT INTO {self.superset_tables_name} (\n' 
        values_query = 'VALUES (\n';

        for key in cols_dict:       
            columns_query += f'{key}, \n' # adding columns name
            
            # adding values                      
            if(cols_dict[key] is not None):                            
                values_query += f'{str(cols_dict[key])}, \n' 
            else: values_query += 'NULL ,\n'

        columns_query = columns_query[:-3] + ')'  # removing last comma
        values_query = values_query[:-3] + ')'  # removing last comma
        query = columns_query +  '\n' + values_query + ' RETURNING id;'
        self.print_query(query)

        return query
        


    # generate query for table 'table_columns', in superset this table describe each columns of the created table
    def generate_superset_table_columns_query(self ,dir:str ,table_id ):

        column_names = conf.superset_table_columns_cols;

        query = f'INSERT INTO {self.superset_table_columns_name} ( ' + ', '.join(f'{ w }' for w in column_names) + ' ) VALUES \n' 

        csv_file=f'{dir}/{self.csv_file_name}{conf.csv_ext}'

        with open(csv_file, 'r') as f:
            reader = csv.reader(f)
        
            colum_names = next(reader)
            data = next(reader) # first data column is used to infer types

            for j,col in enumerate(colum_names, start=0):
                query += '('
                data_type = ''
                data_col = ''
                is_dttm = 'false'
                if(self.use_model) : 
                    data_type = self.model[col]["superset_type"]
                    data_col = self.model[col]["name"]
                else : 
                    inference = self.infer_data_types(data[j])
                    data_type = inference['superset']
                    is_dttm = inference['is_dttm']
                    data_col = col
                values_dict = conf.get_superset_table_columns_conf(table_id, data_col, data_type,str(uuid.uuid4()),is_dttm)
                    
            
                for key in values_dict:
                    if(values_dict[key] is not None): # se l'elemento è None non deve venire stampato come stringa ma come NULL
                        query += f'{str(values_dict[key])} , ' 
                    else: query += 'NULL ,'
                query = query[:-2]  # removing last element comma;
                query += '),\n' 
            query = query[:-2] # removing last row comma

        self.print_query(query)
        return(query)

    def infer_date_time(self,date_str):
        try:

            parsed_date = parser.parse(date_str)
            formatted_date = parsed_date.strftime("%Y-%m-%d %H:%M:%S.%f")
            return formatted_date

        except ValueError as e:

            raise ValueError('')


    postgres_types = {
        "int": 'int',
        "float": 'float',
        "date_time": 'timestamp(3)',
        "varchar": 'varchar',
    }


    def infer_data_types(self ,col):
        type = {}
        try:
            int(col)
            type['postgres'] = self.postgres_types['int']
            type['superset'] = 'BIGINT'
            type['is_dttm'] = 'false'
            type['data'] = col
            return type
        except:
            try:
                float(col)
                type['postgres'] = self.postgres_types['float']
                type['superset'] = 'DOUBLE PRECISION'
                type['is_dttm'] = 'false'
                type['data'] = col
                return type
            except:
                try:
                    date_time = self.infer_date_time(col)
                    type['postgres'] = self.postgres_types['date_time']
                    type['superset'] = 'TIMESTAMP WITHOUT TIME ZONE'
                    type['is_dttm'] = 'true'
                    type['data'] = f"{date_time}"
                    return type
                except:
                    type['postgres'] = self.postgres_types['varchar']
                    type['superset'] = 'VARCHAR'
                    type['is_dttm'] = 'false'
                    type['data'] = col
                    return type
