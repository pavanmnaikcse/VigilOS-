import pandas as pd
import xgboost as xgb
from sklearn.metrics import classification_report, confusion_matrix
import json
from pathlib import Path

def engineer_features(df):
    df['type_eligible'] = df['type'].isin(['TRANSFER', 'CASH_OUT']).astype(int)
    df['amount_balance_ratio'] = df['amount'] / (df['oldbalanceOrg'] + 1)
    df['balance_mismatch'] = abs((df['oldbalanceOrg'] - df['amount']) - df['newbalanceOrig'])
    df['mule_pattern'] = ((df['oldbalanceDest'] == 0) & (df['newbalanceDest'] == 0)).astype(int)
    df['timing_gap'] = df['step'] % 24
    df['velocity'] = df['amount'] / (df['step'] + 1)
    return df

def main():
    script_dir = Path(__file__).resolve().parent
    base_dir = script_dir.parent
    data_path = base_dir / 'data' / 'paysim' / 'synthetic_mule_dataset.csv'
    model_dir = script_dir / 'model'
    model_path = model_dir / 'fraud_scorer.json'
    features_path = model_dir / 'feature_names.json'
    
    print("Loading feature names...")
    with open(features_path, 'r') as f:
        features = json.load(f)
        
    print(f"Loading model from {model_path}...")
    model = xgb.XGBClassifier()
    model.load_model(str(model_path))
    
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    print("Filtering eligible types...")
    df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])].copy()
    
    print("Engineering features...")
    df = engineer_features(df)
    
    X = df[features]
    y = df['isFraud']
    
    print("Predicting...")
    y_pred = model.predict(X)
    
    print("\nClassification Report:")
    print(classification_report(y, y_pred))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y, y_pred))

if __name__ == '__main__':
    main()
