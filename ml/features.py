def build_features(transaction: dict) -> dict:
    t_type = transaction.get('type', '')
    amount = float(transaction.get('amount', 0))
    old_org = float(transaction.get('oldbalanceOrg', 0))
    new_org = float(transaction.get('newbalanceOrig', 0))
    old_dest = float(transaction.get('oldbalanceDest', 0))
    new_dest = float(transaction.get('newbalanceDest', 0))
    step = int(transaction.get('step', 0))
    
    return {
        'type_eligible': 1.0 if t_type in ('TRANSFER', 'CASH_OUT') else 0.0,
        'amount_balance_ratio': amount / (old_org + 1.0),
        'balance_mismatch': abs((old_org - amount) - new_org),
        'mule_pattern': 1.0 if (old_dest == 0.0 and new_dest == 0.0) else 0.0,
        'timing_gap': float(step % 24),
        'velocity': amount / (step + 1.0),
        'location_mismatch': 1.0 if transaction.get('locationOrig') != transaction.get('locationDest') else 0.0
    }
