import shutil
import time
import os
import superset_queries as sq
from db_conn import Postgresconn
import configurations as conf



# programmatically upload csv in superset                
def upload_csv_in_superset():

    if(not os.path.isdir(conf.output_dir)):
        print(f'output folder {conf.output_dir} not found ')
        exit()
    

    # upload csv in superset 
    output_dir = f'{conf.output_dir}';
    files = [f for f in os.listdir(output_dir) if os.path.isfile(os.path.join(output_dir, f))]

    for file in files: 
        ext = os.path.splitext(file)[1]
        file_name = os.path.splitext(file)[0].lower()
        if(conf.csv_ext == ext.lower()):


            '''
            To import a CSV dataset in Superset:
            - Create a new table in the chosen database with data from the CSV.
            - Insert the data into the newly created table.
            - Insert the required fields into the Superset table called "tables", which describes the newly created table in general.
            - Insert the description of each column of the newly created table into the Superset table called "table_columns". A field must be inserted for each column!
            '''

            default_db = Postgresconn(conf.default_db,conf.user,conf.password,conf.host,conf.port)
            superset_db = Postgresconn(conf.superset_db,conf.user,conf.password,conf.host,conf.port)

            try:
                default_db.connect()
                superset_db.connect()

                if(conf.drop_table_if_exists):
                    is_table_dropped_query  = sq.get_id_from_tables(file_name)
                    is_table_dropped = superset_db.get_data_as_dict_norb(is_table_dropped_query)
                    
                    if (is_table_dropped != []): # table not dropped in superset
                        
                
                        table_id = is_table_dropped[0]['id'];
                
                        query = sq.delete_columns_from_superset_table_columns(table_id)
                        superset_db.query_norb(query)

                        query = sq.delete_column_from_superset_tables(table_id)
                        superset_db.query_norb(query);
                       
                    
                    # dropping target table
                    query = sq.drop_table_if_exists(file_name)
                    default_db.query_norb(query)
                    print('all table dropped ')
                                            



                print('create table query')
                create_table = sq.csv_create_table_query(output_dir,file_name);
                print(create_table)
                default_db.create_norb(create_table)

                print('insert data query')
                insert_data = sq.csv_insert_data_query(file_name,output_dir)
                default_db.insert_norb(insert_data)

                print('superset tables query')
                superset_tables = sq.generate_superset_tables_query(file_name,conf.default_db_id,conf.default_db);
                table_id = superset_db.insert_norb(superset_tables);

                print('superset table columns query')
                superset_table_columns = sq.generate_superset_table_columns_query(output_dir,file_name,table_id)
                superset_db.insert_norb(superset_table_columns)


                superset_db.commit()
                default_db.commit()

                default_db.disconnect()
                superset_db.disconnect()


            except Exception as e:
                    default_db.rollback();
                    superset_db.rollback()
                    print('executed rollback')
                    print(f"some error occurred \n -> {e}" )          
                


upload_csv_in_superset();












