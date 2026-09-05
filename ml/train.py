import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from pathlib import Path

# Paths
dataset_path = r'C:\Users\pn466\OneDrive\Documents\VigilOS\data\synthetic_fraud_data_2M.csv'
model_dir = Path(r'C:\Users\pn466\OneDrive\Documents\VigilOS\ml\model')
model_path = model_dir / 'fraud_scorer.json'
model_dir.mkdir(parents=True, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(dataset_path)

# Features expected by fraud_scorer.py
features = [
    'customer_risk_tier',
    'original_balance',
    'amount',
    'updated_balance',
    'amount_vs_90d_avg',
    'new_device',
    'odd_hour',
    'new_payee',
    'velocity_1h',
    'velocity_spike',
    'account_drained'
]
target = 'is_fraud'

X = df[features]
y = df[target]

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training XGBoost Classifier on 2 million rows (99% fraud)...")
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    tree_method='hist' # Fast histogram optimized
)

model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print(f"Model accuracy on test set: {score:.4f}")

print(f"Saving model to {model_path}...")
model.save_model(str(model_path))
print("Training complete! Model saved.")
