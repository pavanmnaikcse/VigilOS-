from app.database import get_neo4j_driver, get_neo4j_database

def find_correlations(account_id: str, case_id: str) -> dict:
    driver = get_neo4j_driver()
    db_name = get_neo4j_database()
    
    query = """
    MATCH (a:Account {id: $account_id})-[:TRANSFER|CASH_OUT*1..2]-(b:Account)-[:INVOLVED_IN]->(c:Case)
    WHERE c.case_id <> $case_id
    RETURN c.case_id AS case_id, collect(distinct b.id) as shared
    """
    
    correlated_cases = []
    shared_accounts = set()
    
    with driver.session(database=db_name) as session:
        result = session.run(query, account_id=account_id, case_id=case_id)
        for record in result:
            c_id = record["case_id"]
            shared = record["shared"]
            correlated_cases.append(c_id)
            for acc in shared:
                shared_accounts.add(acc)
                
    shared_accounts_list = list(shared_accounts)
    
    pattern_type = None
    if correlated_cases:
        if len(shared_accounts_list) >= 3:
            pattern_type = 'ring'
        else:
            pattern_type = 'chain'
            
    return {
        "correlated_cases": correlated_cases,
        "shared_accounts": shared_accounts_list,
        "pattern_type": pattern_type
    }


