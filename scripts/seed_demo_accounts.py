import pandas as pd
import json
from pathlib import Path
import random

def main():
    base_dir = Path(__file__).resolve().parent.parent
    data_path = Path(r"c:\Users\pn466\OneDrive\Documents\paysim dataset.csv")
    out_path = base_dir / 'data' / 'demo_accounts.json'
    
    out_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading {data_path}...")
    df = pd.read_csv(data_path)
    
    df_trans = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].copy()
    
    print("Sampling demo accounts...")
    
    demo_accounts = []
    names = ["Alice", "Bob", "Charlie", "Diana"]
    
    for i, name in enumerate(names):
        sample = df_trans.sample(1).iloc[0]
        
        history_samples = df_trans.sample(3)
        history = []
        for _, row in history_samples.iterrows():
            history.append({
                "type": row['type'],
                "amount": float(row['amount']),
                "oldbalanceOrg": float(row['oldbalanceOrg']),
                "newbalanceOrig": float(row['newbalanceOrig']),
                "oldbalanceDest": float(row['oldbalanceDest']),
                "newbalanceDest": float(row['newbalanceDest']),
                "step": int(row['step'])
            })
            
        account = {
            "name": name,
            "account_id": f"ACC_{i}_{int(sample['oldbalanceOrg'])}",
            "starting_balance": float(sample['oldbalanceOrg']),
            "history": history
        }
        demo_accounts.append(account)
        
    with open(out_path, 'w') as f:
        json.dump(demo_accounts, f, indent=2)
        
    print(f"Saved demo accounts to {out_path}")

if __name__ == '__main__':
    main()
