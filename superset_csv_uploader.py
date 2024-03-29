import os
from superset_queries import SupersetQueries
from db_conn import Postgresconn
import configurations as conf
import logging

logging.basicConfig(filename=conf.get_log_file(), level=logging.INFO, format='%(asctime)s - %(levelname)s: %(message)s')

# programmatically upload csv in superset
def upload_csv_in_superset(csv_dir_path ,use_model = False, use_same_model_for_all_csv = False , external_conf = None, model_dir_path = '', ):


    # opening file in write mode to remove the file content
    try: 
        with open(conf.log_file_path, 'w'):
            pass
    except Exception as e:
        pass

    superset_db_name = ''
    user = ''
    password = ''
    host = ''
    port = 0
    target_db = ''

    update_table_if_exists = True
    replace_table_if_exists = False
    delete_files_after_upload = False
        
    # predisposition if you want to expose this as an api and call by external service
    if(external_conf):
        superset_db_name = external_conf['supersetDb']
        user = external_conf['user']
        password = external_conf['password']
        host = external_conf['host']
        port = external_conf['port']
        update_table_if_exists = external_conf['updateTableIfExists']
        replace_table_if_exists = external_conf['replaceTableIfExists']
        delete_files_after_upload =  external_conf['deleteFilesAfterUpload']
        target_db_name = external_conf['targetDb']
        use_model = external_conf['useJsonModel']
        use_same_model_for_all_csv = external_conf['useSameModelForAllCsv']
        model_dir_path = external_conf['jsonModelDirPath']
        csv_dir_path = external_conf['csvDirPath']
    else : 
        superset_db_name = conf.superset_db
        user = conf.user
        password = conf.password
        host = conf.host
        port = conf.port
        target_db_name = conf.target_db
        update_table_if_exists = conf.update_table_if_exists
        replace_table_if_exists = conf.replace_table_if_exists
        delete_files_after_upload =  conf.delete_files_after_upload
        use_same_model_for_all_csv = use_same_model_for_all_csv
        use_model = use_model
        model_dir_path = model_dir_path
        csv_dir_path = csv_dir_path

    if(use_model and model_dir_path == ''):
        model_dir_path = csv_dir_path
   
    if (not os.path.isdir(csv_dir_path)):
        logging.info(f'output folder {csv_dir_path} not found ')
        exit()

    logging.info('upload csv in superset')
    # upload csv in superset
    csv_dir = csv_dir_path
    files = [f for f in os.listdir(csv_dir) if os.path.isfile(os.path.join(csv_dir, f))]

    for file in files:

        logging.info('verifyng file: ' +  file)
        ext = os.path.splitext(file)[1]
        file_name = os.path.splitext(file)[0]
        insert_metadata = True; 
        table_exists = False;

        if (conf.csv_ext == ext.lower()):
            logging.info('found a csv file')
            
            # creating new Supersetqueries object with all info necessaries to upload the csv
            sq = SupersetQueries(use_model = use_model, model_dir_path = model_dir_path, csv_file_name = file_name)
            
            '''
            To import a CSV dataset in Superset:
            - Create a new table in the chosen database with data from the CSV.
            - Insert the data into the newly created table.
            - Insert the required fields into the Superset table called "tables", which describes the newly created table in general.
            - Insert the description of each column of the newly created table into the Superset table called "table_columns". A field must be inserted for each column!
            '''

            logging.info('connecting to database')
            superset_db = Postgresconn(superset_db_name, user, password, host, port)
            
            logging.info('recovering default database info')
            query = sq.get_database_info(target_db_name)

            try:
                superset_db.connect()
                logging.info('connected to database ')
                target_db_info = superset_db.get_data_as_dict_norb(query)
                if len(target_db_info) <= 0:
                    logging.info(f' no db found on superset with name {target_db_name}')
                    return None

                real_target_db_name = target_db_info[0]['sqlalchemy_uri'].split('/')[-1]

                if (real_target_db_name == target_db_name):
                    target_db = Postgresconn(target_db_name, user, password, host, port)
                    target_db.connect()
                elif (real_target_db_name == superset_db_name):
                    target_db = superset_db
                else:
                    raise Exception("no match db found")

                # recovering target database id
                logging.info('recovering target database info')
                query = sq.get_database_info(target_db_name)
                target_db_id = superset_db.get_data_as_dict_norb(query)[0]['id']

                # when you delete a table afrom superset, only the metadata about table will be removed
                # so there is the possibility that this query return that table doesn't exist, but it actually exists
                logging.info('trying to find table')
                query = sq.get_id_from_tables()
                result = superset_db.get_data_as_dict_norb(query)
                logging.info(result)

                if (result != []):  # if table is not not dropped in superset
                    table_exists = True
                    logging.info('table found')
                    table_id = result[0]['id']
                    
                    if(update_table_if_exists):
                        insert_metadata = False; # If we only want to update the table, there's no need to insert metadata again.
                        query = sq.count_table_rows()
                        rows_number = superset_db.query_norb(query)
                        if(rows_number > 0):
                            logging.info('updating table')
                            query = sq.delete_all_table_rows()
                            
                            superset_db.query_norb(query)    

                    elif(replace_table_if_exists):
                        logging.info('replacing table')
                        query = sq.delete_columns_from_superset_table_columns(table_id)
                        superset_db.query_norb(query)

                        query = sq.delete_column_from_superset_tables(table_id)
                        superset_db.query_norb(query)

                        # dropping target table
                        query = sq.drop_table_if_exists()
                        target_db.query_norb(query)
                        logging.info('table dropped')
                # when you delete a table afrom superset, only the metadata about table will be removed
                # so there is the possibility that this query return that table doesn't exist, but it actually exists
                # so in this case we try to eliminate the table to avoid errors in the nex steps
                # note that this case is different from the case above because in the case above inside the elif case,
                # the metadata about table exists 
                else:
                    logging.info('table does not exists on superset metadata, trying to remove table if exists')
                    query = sq.drop_table_if_exists()
                    target_db.query_norb(query)

                
                # will create the table only if the table does not exists
                if(not table_exists):
                    create_table = sq.csv_create_table_query(csv_dir)
                    target_db.create_norb(create_table)
                    logging.info('creating table')


                insert_data = sq.csv_insert_data_query(csv_dir)
                target_db.insert_norb(insert_data)
                logging.info('insert data')

                if(insert_metadata): 
                    superset_tables = sq.generate_superset_tables_query( database_id=target_db_id)
                    table_id = superset_db.insert_norb(superset_tables)
                    logging.info('insert metadata in tables')
        
                    superset_table_columns = sq.generate_superset_table_columns_query(csv_dir, table_id)
                    superset_db.insert_norb(superset_table_columns)
                    logging.info('insert metadata in table_columns')

                superset_db.commit()
                target_db.commit()
                logging.info('commit')
                
                if(delete_files_after_upload):
                    csv_file=f'{csv_dir}/{file_name}{conf.csv_ext}'
                    if os.path.exists(csv_file):
                        os.remove(csv_file)

                target_db.disconnect()
                superset_db.disconnect()

                res = {"status" : "true" }
                return res

            except Exception as e:
                if(delete_files_after_upload):
                    csv_file=f'{csv_dir}/{file_name}{conf.csv_ext}'
                    if os.path.exists(csv_file):
                        os.remove(csv_file)
                if (superset_db != target_db):
                    target_db.rollback()
                superset_db.rollback()
                logging.info('executed rollback')
                logging.error(f"some error occurred \n -> {e}")


