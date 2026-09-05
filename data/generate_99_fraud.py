import os
import numpy as np
import pandas as pd
from datetime import datetime

def generate_99_fraud_dataset(num_rows=2000000, output_path='C:\\Users\\pn466\\OneDrive\\Documents\\VigilOS\\data\\synthetic_fraud_data_2M.csv'):
    print(f"Generating {num_rows} rows of synthetic data (99% fraud)...")
    np.random.seed(42)
    
    is_fraud = np.random.choice([0, 1], size=num_rows, p=[0.01, 0.99])
    
    # 1. Customer Risk Tier (Low=1, Medium=2, High=3)
    # Fraudsters are usually High or Medium
    risk_tiers = np.where(is_fraud == 1, 
                          np.random.choice([1, 2, 3], size=num_rows, p=[0.1, 0.3, 0.6]),
                          np.random.choice([1, 2, 3], size=num_rows, p=[0.70, 0.25, 0.05]))
    
    # 2. Original Balance
    original_balances = np.random.lognormal(mean=8, sigma=1.5, size=num_rows).round(2)
    
    # 3. Transaction Amount (Fraudsters drain accounts, Normal users take a small fraction)
    amount_fractions_fraud = np.random.beta(a=5, b=0.5, size=num_rows) # Skewed towards 1.0
    amount_fractions_normal = np.random.beta(a=0.5, b=5, size=num_rows) # Skewed towards 0.0
    
    amount_fractions = np.where(is_fraud == 1, amount_fractions_fraud, amount_fractions_normal)
    amounts = (original_balances * amount_fractions).round(2)
    amounts = np.clip(amounts, a_min=1.0, a_max=None)
    
    updated_balances = (original_balances - amounts).round(2)
    
    # 4. Amount vs 90-day avg
    amount_vs_90d_avg = np.where(is_fraud == 1,
                                 np.random.lognormal(mean=2, sigma=1, size=num_rows).round(2), # Very high (avg ~7.3)
                                 np.random.lognormal(mean=0, sigma=0.8, size=num_rows).round(2)) # Normal
    
    # 5. Contextual flags
    new_device = np.where(is_fraud == 1, np.random.choice([0, 1], size=num_rows, p=[0.1, 0.9]), np.random.choice([0, 1], size=num_rows, p=[0.9, 0.1]))
    odd_hour = np.where(is_fraud == 1, np.random.choice([0, 1], size=num_rows, p=[0.2, 0.8]), np.random.choice([0, 1], size=num_rows, p=[0.85, 0.15]))
    new_payee = np.where(is_fraud == 1, np.random.choice([0, 1], size=num_rows, p=[0.05, 0.95]), np.random.choice([0, 1], size=num_rows, p=[0.8, 0.2]))
    
    # 6. Velocity
    velocity_1h = np.where(is_fraud == 1, np.random.poisson(lam=5, size=num_rows), np.random.poisson(lam=0.5, size=num_rows))
    velocity_spike = np.where(velocity_1h > 3, 1, 0)
    
    # 7. Account Drained Flag
    account_drained = np.where(amounts >= (original_balances * 0.95), 1, 0)
    
    start_time = int(datetime(2025, 1, 1).timestamp())
    end_time = int(datetime(2026, 9, 1).timestamp())
    timestamps_sec = np.random.randint(start_time, end_time, size=num_rows)
    
    ip_parts = np.random.randint(1, 255, size=(num_rows, 4)).astype(str)
    
    print("Building DataFrame...")
    df = pd.DataFrame({
        'timestamp': pd.to_datetime(timestamps_sec, unit='s'),
        'customer_risk_tier': risk_tiers,
        'original_balance': original_balances,
        'amount': amounts,
        'updated_balance': updated_balances,
        'amount_vs_90d_avg': amount_vs_90d_avg,
        'new_device': new_device,
        'odd_hour': odd_hour,
        'new_payee': new_payee,
        'velocity_1h': velocity_1h,
        'velocity_spike': velocity_spike,
        'account_drained': account_drained,
        'is_fraud': is_fraud
    })
    
    df['ip_address'] = pd.Series(ip_parts[:, 0]).str.cat(
        [pd.Series(ip_parts[:, 1]), pd.Series(ip_parts[:, 2]), pd.Series(ip_parts[:, 3])], sep='.'
    )
    
    print(f"Fraud ratio: {df['is_fraud'].mean()*100:.2f}%")
    print(f"Saving to {output_path}...")
    df.to_csv(output_path, index=False)
    print("Done!")

if __name__ == '__main__':
    generate_99_fraud_dataset()
