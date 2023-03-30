import os
import superset_queries as sq
from db_conn import Postgresconn
import configurations as conf



# programmatically upload csv in superset                
def upload_csv_in_superset():

    if(not os.path.isdir(conf.csv_dir)):
        print(f'output folder {conf.csv_dir} not found ')
        exit()
    

    # upload csv in superset 
    csv_dir = f'{conf.csv_dir}';
    files = [f for f in os.listdir(csv_dir) if os.path.isfile(os.path.join(csv_dir, f))]

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

            superset_db = Postgresconn(conf.superset_db,conf.user,conf.password,conf.host,conf.port)
            query =  sq.get_database_info(conf.target_db)


            try:
              
                superset_db.connect()

                target_db_info = superset_db.get_data_as_dict_norb(query);
                real_target_db_name = target_db_info[0]['sqlalchemy_uri'].split('/')[-1]

                if(real_target_db_name == conf.target_db):
                    target_db = Postgresconn(conf.target_db,conf.user,conf.password,conf.host,conf.port)
                    target_db.connect()
                elif(real_target_db_name == conf.superset_db):
                    target_db = superset_db
                else:
                    raise Exception("no match db found")

                # recovering target database id
                query = sq.get_database_info(conf.target_db)
                target_db_id = superset_db.get_data_as_dict_norb(query)[0]['id']

                if(conf.replace_table_if_exists):
                    query  = sq.get_id_from_tables(file_name)
                    result = superset_db.get_data_as_dict_norb(query)
                    
                    if (result != []): # if table is not not dropped in superset
                
                        table_id = result[0]['id'];
                
                        query = sq.delete_columns_from_superset_table_columns(table_id)
                        superset_db.query_norb(query)

                        query = sq.delete_column_from_superset_tables(table_id)
                        superset_db.query_norb(query);
                       
                    
                    # dropping target table
                    query = sq.drop_table_if_exists(file_name)
                    target_db.query_norb(query)
                    
          
                create_table = sq.csv_create_table_query(csv_dir,file_name);
                target_db.create_norb(create_table)


                insert_data = sq.csv_insert_data_query(file_name,csv_dir)
                target_db.insert_norb(insert_data)


                superset_tables = sq.generate_superset_tables_query(table_name=file_name,database_id=target_db_id);
                table_id = superset_db.insert_norb(superset_tables);

            
                superset_table_columns = sq.generate_superset_table_columns_query(csv_dir,file_name,table_id)
                superset_db.insert_norb(superset_table_columns)


                superset_db.commit()
                target_db.commit()

                target_db.disconnect()
                superset_db.disconnect()


            except Exception as e:
                    if(superset_db != target_db)
                        target_db.rollback();
                    superset_db.rollback()
                    print('executed rollback')
                    print(f"some error occurred \n -> {e}" )          
                


upload_csv_in_superset();












