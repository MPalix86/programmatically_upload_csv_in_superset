import os
from superset_queries import SupersetQueries
from db_conn import Postgresconn
import configurations as conf



# programmatically upload csv in superset
def upload_csv_in_superset(csv_dir_path,use_model,model_dir_path = ''):

    if(use_model and model_dir_path == ''):
        model_dir_path = csv_dir_path
   
    if (not os.path.isdir(csv_dir_path)):
        print(f'output folder {csv_dir_path} not found ')
        exit()

    print('upload csv in superset')
    # upload csv in superset
    csv_dir = csv_dir_path
    files = [f for f in os.listdir(csv_dir) if os.path.isfile(os.path.join(csv_dir, f))]

    for file in files:

        print('verifyng file: ' +  file)
        ext = os.path.splitext(file)[1]
        file_name = os.path.splitext(file)[0]
        insert_metadata = True; 
        table_exists = False;

        if (conf.csv_ext == ext.lower()):
            print('found a csv file')
            
            # creating new Supersetqueries object with all info necessaries to upload the csv
            sq = SupersetQueries(use_model = use_model, model_dir_path = model_dir_path, csv_file_name = file_name)
            
            '''
            To import a CSV dataset in Superset:
            - Create a new table in the chosen database with data from the CSV.
            - Insert the data into the newly created table.
            - Insert the required fields into the Superset table called "tables", which describes the newly created table in general.
            - Insert the description of each column of the newly created table into the Superset table called "table_columns". A field must be inserted for each column!
            '''

            print('connecting to database')
            superset_db = Postgresconn(conf.superset_db, conf.user, conf.password, conf.host, conf.port)
            
            print('recovering default database info')
            query = sq.get_database_info(conf.target_db)

            try:
                superset_db.connect()
                print('connected to database ')
                target_db_info = superset_db.get_data_as_dict_norb(query)
                real_target_db_name = target_db_info[0]['sqlalchemy_uri'].split('/')[-1]

                if (real_target_db_name == conf.target_db):
                    target_db = Postgresconn(conf.target_db, conf.user, conf.password, conf.host, conf.port)
                    target_db.connect()
                elif (real_target_db_name == conf.superset_db):
                    target_db = superset_db
                else:
                    raise Exception("no match db found")

                # recovering target database id
                print('recovering target database info')
                query = sq.get_database_info(conf.target_db)
                target_db_id = superset_db.get_data_as_dict_norb(query)[0]['id']

                # when you delete a table afrom superset, only the metadata about table will be removed
                # so there is the possibility that this query return that table doesn't exist, but it actually exists
                print('trying to find table')
                query = sq.get_id_from_tables()
                result = superset_db.get_data_as_dict_norb(query)
                print(result)

                if (result != []):  # if table is not not dropped in superset
                    table_exists = True
                    print('table found')
                    table_id = result[0]['id']
                    
                    if(conf.update_table_if_exists):
                        insert_metadata = False; # If we only want to update the table, there's no need to insert metadata again.
                        query = sq.count_table_rows()
                        rows_number = superset_db.query_norb(query)
                        if(rows_number > 0):
                            print('updating table')
                            query = sq.delete_all_table_rows()
                            
                            superset_db.query_norb(query)    

                    elif(conf.replace_table_if_exists):
                        print('replacing table')
                        query = sq.delete_columns_from_superset_table_columns(table_id)
                        superset_db.query_norb(query)

                        query = sq.delete_column_from_superset_tables(table_id)
                        superset_db.query_norb(query)

                        # dropping target table
                        query = sq.drop_table_if_exists()
                        target_db.query_norb(query)
                        print('table dropped')
                # when you delete a table afrom superset, only the metadata about table will be removed
                # so there is the possibility that this query return that table doesn't exist, but it actually exists
                # so in this case we try to eliminate the table to avoid errors in the nex steps
                # note that this case is different from the case above because in the case above inside the elif case,
                # the metadata about table exists 
                else:
                    print('table does not exists on superset metadata, trying to remove table if exists')
                    query = sq.drop_table_if_exists()
                    target_db.query_norb(query)

                
                # will create the table only if the table does not exists
                if(not table_exists):
                    create_table = sq.csv_create_table_query(csv_dir)
                    target_db.create_norb(create_table)
                    print('creating table')


                insert_data = sq.csv_insert_data_query(csv_dir)
                target_db.insert_norb(insert_data)
                print('insert data')

                if(insert_metadata): 
                    superset_tables = sq.generate_superset_tables_query( database_id=target_db_id)
                    table_id = superset_db.insert_norb(superset_tables)
                    print('insert metadata in tables')
        
                    superset_table_columns = sq.generate_superset_table_columns_query(csv_dir, table_id)
                    superset_db.insert_norb(superset_table_columns)
                    print('insert metadata in table_columns')

                superset_db.commit()
                target_db.commit()
                print('commit')
                
                if(conf.delete_files_after_upload):
                    csv_file=f'{csv_dir}/{file_name}{conf.csv_ext}'
                    if os.path.exists(csv_file):
                        os.remove(csv_file)

                target_db.disconnect()
                superset_db.disconnect()



            except Exception as e:
                if(conf.delete_files_after_upload):
                    csv_file=f'{csv_dir}/{file_name}{conf.csv_ext}'
                    if os.path.exists(csv_file):
                        os.remove(csv_file)
                if (superset_db != target_db):
                    target_db.rollback()
                superset_db.rollback()
                print('executed rollback')
                print(f"some error occurred \n -> {e}")
                return 


upload_csv_in_superset('./csv_test',use_model=True, model_dir_path="./csv_test/json_models")












