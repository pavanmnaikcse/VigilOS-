import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
import json
from pathlib import Path
import os
import sys

script_dir = Path(__file__).resolve().parent
base_dir = script_dir.parent
sys.path.append(str(base_dir))

from ml.features import build_features

def main():
    data_path = base_dir / "data" / "synthetic_fraud_data_2M.csv"
    if not data_path.exists():
        print(f"Dataset not found at {data_path}. Please provide it.")
        return

    model_dir = script_dir / 'model'
    model_dir.mkdir(exist_ok=True, parents=True)
    
    model_path = model_dir / 'fraud_scorer.json'
    ranges_path = model_dir / 'feature_ranges.json'
    
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    print("Preparing features...")
    # New dataset is already pre-engineered
    target = 'is_fraud'
    
    # Drop non-numeric or leak columns
    drop_cols = [target, 'timestamp', 'ip_address']
    X = df.drop(columns=[col for col in drop_cols if col in df.columns])
    y = df[target].values
    
    # Calculate feature ranges for OOD detection
    print("Calculating feature ranges...")
    feature_ranges = {}
    for col in X.columns:
        feature_ranges[col] = {
            "min": float(X[col].min()),
            "max": float(X[col].max()),
            "p01": float(X[col].quantile(0.01)),
            "p99": float(X[col].quantile(0.99))
        }
    with open(ranges_path, 'w') as f:
        json.dump(feature_ranges, f, indent=2)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    
    print(f"Training XGBoost with scale_pos_weight={scale_pos_weight:.2f}...")
    clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    clf.fit(X_train, y_train)
    
    print("Evaluating...")
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print(f"AUC-ROC: {auc:.4f}")
    
    print(f"Saving model to {model_path}...")
    clf.save_model(str(model_path))
    
    print("Done.")

if __name__ == '__main__':
    main()
