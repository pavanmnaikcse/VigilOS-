import whois
from datetime import datetime
from Levenshtein import ratio

def analyze_link(url: str) -> dict:
    whitelist = ['chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com', 'usbank.com', 'pnc.com', 'tdbank.com', 'capitalone.com']
    
    domain = url.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]
    
    whois_age_days = None
    error_details = None
    
    try:
        w = whois.whois(domain)
        creation_date = w.creation_date
        if type(creation_date) is list:
            creation_date = creation_date[0]
            
        if creation_date:
            delta = datetime.now() - creation_date
            whois_age_days = delta.days
    except Exception as e:
        error_details = str(e)
        
    highest_sim = 0.0
    for bank in whitelist:
        sim = ratio(domain, bank)
        if sim > highest_sim:
            highest_sim = sim
            
    is_suspicious = False
    if (whois_age_days is not None and whois_age_days < 30) or highest_sim > 0.7:
        is_suspicious = True
        
    return {
        "domain": domain,
        "whois_age_days": whois_age_days,
        "similarity_score": highest_sim,
        "is_suspicious": is_suspicious,
        "details": error_details if error_details else f"Domain age: {whois_age_days} days. Max similarity: {highest_sim:.2f}."
    }


