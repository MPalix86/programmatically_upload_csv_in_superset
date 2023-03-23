import psycopg2

class Postgresconn:
    database: str
    user:str
    password: str
    host:str
    port:int
    conn:any

    def __init__(self,database, user, password, host, port):
        self.database = database
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.conn = None

    def connect(self):
        try:
            self.conn = psycopg2.connect(
            host= self.host,
            port= self.port, 
            database= self.database,
            user=self.user,
            password=self.password
    )
            print("Postgres database connection successful!")
        except Exception as e:
            print(f"Error while connecting to the database: {e}")

    def disconnect(self):
        if self.conn is not None:
            self.conn.close()
            print("Postgres database connection closed successfully!")

    def update(self, query):
            try:
                cursor = self.conn.cursor()
                cursor.execute(query)
                self.conn.commit()
                cursor.close()
                print("Update query executed successfully!")
            except Exception as e:
                self.conn.rollback()
                print(f"Error while executing the update query: {e}")

    def insert(self, query:str):
        try:
            cursor = self.conn.cursor()
            cursor.execute(query)
            self.conn.commit()
            if cursor.description is not None:
                last_insert_id = cursor.fetchone()[0]
                print("Insert query executed successfully!")
                return last_insert_id
            else:
                print("Insert query executed successfully but no result returned")
                return None
        except Exception as e:
            self.conn.rollback()
            print(f"Error while executing the insert query: {e}" )
            return None

    def create(self, query:str):
        try:
            cursor = self.conn.cursor()
            cursor.execute(query)
            self.conn.commit()
            cursor.close()
            print("Table created successfully!")
        except Exception as e:
            self.conn.rollback()
            print(f"Error while creating the table {e}" )

    # QUERY FUNCTIONS WITHOUT EXCEPTION HANDLING, TO HANDLE ROLLBACK AND COMMIT EXTERNALLY 
    # 

    def query_norb(self, query:str):
        cursor = self.conn.cursor()
        cursor.execute(query)
        if cursor.description is not None:
            last_insert_id = cursor.fetchone()[0]
            print("Insert query executed successfully!")
            return last_insert_id
        else:
            print("Insert query executed successfully but no result returned")
            return None

    def update_norb(self, query):
        cursor = self.conn.cursor()
        cursor.execute(query)
        cursor.close()
        print("Update query executed successfully!")

    def insert_norb(self, query:str):
        cursor = self.conn.cursor()
        cursor.execute(query)
        if cursor.description is not None:
            last_insert_id = cursor.fetchone()[0]
            print("Insert query executed successfully!")
            return last_insert_id
        else:
            print("Insert query executed successfully but no result returned")
            return None

    def create_norb(self, query:str):
        cursor = self.conn.cursor()
        cursor.execute(query)
        cursor.close()
        print("Table created successfully!")

    def query_norb(self, query:str):
        cursor = self.conn.cursor()
        cursor.execute(query)
        if cursor.description is not None:
            last_insert_id = cursor.fetchone()[0]
            print("Insert query executed successfully!")
            return last_insert_id
        else:
            print("Insert query executed successfully but no result returned")
            return None
    
    def get_data_as_dict_norb(self,query):
        cursor =self.conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        results = cursor.fetchall()
        data = [dict(zip(columns, row)) for row in results]
        return data
        
    def commit(self):
        self.conn.commit()
    
    def rollback(self):
        self.conn.rollback()


    


