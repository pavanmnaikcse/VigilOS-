import os
import sys
import pandas as pd
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent

def seed():
    load_dotenv(dotenv_path=PROJECT_ROOT / ".env")
    
    neo4j_password = os.getenv("NEO4J_PASSWORD")
    if not neo4j_password:
        print("Missing NEO4J_PASSWORD in .env")
        return
        
    uri = os.getenv("NEO4J_URI", "neo4j+ssc://f90d91b4.databases.neo4j.io")
    user = os.getenv("NEO4J_USER", "f90d91b4")
    database = os.getenv("NEO4J_DATABASE", "f90d91b4")
    auth = (user, neo4j_password)
    
    csv_path = Path(r"c:\Users\pn466\OneDrive\Documents\paysim dataset.csv")
    if not csv_path.exists():
        print(f"CSV file not found at {csv_path}. Please download Paysim data.")
        return
        
    print("Loading data...")
    df = pd.read_csv(csv_path)
    
    df_filtered = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])]
    fraud_df = df_filtered[df_filtered['isFraud'] == 1]
    non_fraud_df = df_filtered[df_filtered['isFraud'] == 0]
    
    sample_fraud = fraud_df.sample(n=min(5000, len(fraud_df)), random_state=42)
    sample_non_fraud = non_fraud_df.sample(n=min(5000, len(non_fraud_df)), random_state=42)
    
    final_df = pd.concat([sample_fraud, sample_non_fraud])
    
    driver = GraphDatabase.driver(uri, auth=auth)
    
    def create_constraints(tx):
        tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE")
    
    def process_batch(tx, batch):
        tx.run(
            """
            UNWIND $batch AS row
            MERGE (a:Account {id: row.nameOrig})
            MERGE (b:Account {id: row.nameDest})
            """,
            batch=batch
        )
        tx.run(
            """
            UNWIND $batch AS row
            MATCH (a:Account {id: row.nameOrig})
            MATCH (b:Account {id: row.nameDest})
            WITH a, b, row
            WHERE row.type = 'TRANSFER'
            CREATE (a)-[:TRANSFER {amount: row.amount, step: row.step, isFraud: row.isFraud}]->(b)
            """,
            batch=batch
        )
        tx.run(
            """
            UNWIND $batch AS row
            MATCH (a:Account {id: row.nameOrig})
            MATCH (b:Account {id: row.nameDest})
            WITH a, b, row
            WHERE row.type = 'CASH_OUT'
            CREATE (a)-[:CASH_OUT {amount: row.amount, step: row.step, isFraud: row.isFraud}]->(b)
            """,
            batch=batch
        )

    print("Connecting to Neo4j...")
    with driver.session(database=database) as session:
        session.execute_write(create_constraints)
        
        batch_size = 500
        records = final_df.to_dict('records')
        batches = [records[i:i + batch_size] for i in range(0, len(records), batch_size)]
        
        print(f"Inserting {len(records)} records in {len(batches)} batches...")
        for i, batch in enumerate(batches):
            session.execute_write(process_batch, batch)
            print(f"Batch {i+1}/{len(batches)} completed.")
            
        print("Checking totals...")
        result = session.run("MATCH (n) RETURN count(n) AS node_count")
        node_count = result.single()["node_count"]
        result = session.run("MATCH ()-[r]->() RETURN count(r) AS rel_count")
        rel_count = result.single()["rel_count"]
        
        print(f"Total Nodes: {node_count}")
        print(f"Total Relationships: {rel_count}")
        
    driver.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
