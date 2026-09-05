import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

def generate_fraud_dataset(num_rows=2000000, output_path='fraud_synthetic_dataset.csv'):
    print(f"Generating {num_rows} rows of synthetic fraud data...")
    
    # Pre-allocate numpy arrays for performance
    np.random.seed(42)
    
    # 1. Customer Risk Tier (Low=1, Medium=2, High=3)
    # 70% Low, 25% Medium, 5% High
    risk_tiers = np.random.choice([1, 2, 3], size=num_rows, p=[0.70, 0.25, 0.05])
    
    # 2. Original Balance (Log-normal distribution for realistic balances)
    original_balances = np.random.lognormal(mean=8, sigma=1.5, size=num_rows).round(2)
    
    # 3. Transaction Amount
    # Typical amount is a small fraction of balance, but anomalies happen
    amount_fractions = np.random.beta(a=0.5, b=5, size=num_rows)
    amounts = (original_balances * amount_fractions).round(2)
    # Ensure minimum transaction amount
    amounts = np.clip(amounts, a_min=1.0, a_max=None)
    
    # Updated Balance
    updated_balances = (original_balances - amounts).round(2)
    
    # 4. Amount vs 90-day average behavior anomaly (ratio)
    # 1.0 means exactly average. Most are between 0.5 and 2.0. Fraud can be 5.0+
    amount_vs_90d_avg = np.random.lognormal(mean=0, sigma=0.8, size=num_rows).round(2)
    
    # 5. Contextual flags
    new_device = np.random.choice([0, 1], size=num_rows, p=[0.9, 0.1])
    odd_hour = np.random.choice([0, 1], size=num_rows, p=[0.85, 0.15])
    new_payee = np.random.choice([0, 1], size=num_rows, p=[0.8, 0.2])
    
    # 6. Velocity
    velocity_1h = np.random.poisson(lam=0.5, size=num_rows)
    velocity_spike = np.where(velocity_1h > 3, 1, 0)
    
    # 7. Account Drained Flag
    # If amount is > 95% of original balance
    account_drained = np.where(amounts >= (original_balances * 0.95), 1, 0)
    
    # Base timestamp
    start_time = int(datetime(2025, 1, 1).timestamp())
    end_time = int(datetime(2026, 9, 1).timestamp())
    timestamps_sec = np.random.randint(start_time, end_time, size=num_rows)
    
    # Generating IPs (Random for simplicity, vectorized)
    ip_parts = np.random.randint(1, 255, size=(num_rows, 4)).astype(str)
    
    # Calculate Fraud Label based on correlations
    # A transaction is highly likely to be fraud if multiple risky conditions are met
    fraud_prob = np.zeros(num_rows)
    
    # Base probability
    fraud_prob += 0.001 
    
    # Add probabilities based on conditions
    fraud_prob += (risk_tiers == 3) * 0.05
    fraud_prob += (amount_vs_90d_avg > 5.0) * 0.15
    fraud_prob += (new_device == 1) * 0.10
    fraud_prob += (odd_hour == 1) * 0.05
    fraud_prob += (new_payee == 1) * 0.10
    fraud_prob += (velocity_spike == 1) * 0.20
    fraud_prob += (account_drained == 1) * 0.25
    
    # Non-linear combinations
    fraud_prob += ((new_device == 1) & (new_payee == 1) & (account_drained == 1)) * 0.4
    fraud_prob += ((velocity_spike == 1) & (amount_vs_90d_avg > 3.0)) * 0.3
    
    fraud_prob = np.clip(fraud_prob, 0, 1)
    
    # Determine fraud (0 or 1)
    is_fraud = np.random.binomial(n=1, p=fraud_prob)
    
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
    
    # Add IP address as string (vectorized join)
    df['ip_address'] = pd.Series(ip_parts[:, 0]).str.cat(
        [pd.Series(ip_parts[:, 1]), pd.Series(ip_parts[:, 2]), pd.Series(ip_parts[:, 3])], sep='.'
    )
    
    print(f"Dataset generated! Fraud rate: {df['is_fraud'].mean():.2%}")
    print(f"Saving to {output_path}...")
    
    df.to_csv(output_path, index=False)
    
    print("Complete!")

if __name__ == "__main__":
    generate_fraud_dataset(2000000, "C:\\Users\\pn466\\OneDrive\\Documents\\VigilOS\\data\\synthetic_fraud_data_2M.csv")
