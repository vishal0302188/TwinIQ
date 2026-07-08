import csv
import random
from datetime import datetime, timedelta

def generate_mock_csv():
    # File target path inside public folder of Next.js app
    file_path = "../public/historical_ledger_sales.csv"
    
    customers = [
        "MalhotraTech Solutions", "Stellar Brands Ltd", "Ananya Sharma", 
        "Rohan Verma", "Karan Johar", "Vikram Malhotra", "Meera Sen", 
        "SpeedData Suppliers", "TechNova Systems", "Apex Retailers"
    ]
    
    items = [
        "Premium Micro-Controller Chipset", "Solid State Drive Array 4TB", 
        "Fiber Optic Router Switch", "Custom API License Core", 
        "Database Cloud Sync Package", "E-Commerce Gateway Setup"
    ]
    
    categories = ["Hardware", "Hardware", "Hardware", "SaaS License", "Cloud Service", "Consulting"]
    channels = ["Razorpay Gateway", "UPI (Paytm/PhonePe)", "Bank Transfer (IMPS)", "Cash", "Check"]
    statuses = ["Success", "Success", "Success", "Success", "Pending", "Failed"]
    
    start_date = datetime(2026, 1, 1)
    
    with open(file_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        # Headers matching typical ledger logs
        writer.writerow(["Transaction_ID", "Date", "Customer_Name", "Product_Item", "Category", "Amount_INR", "Payment_Channel", "Status"])
        
        for i in range(1, 1201):
            tx_id = f"TXN-{100000 + i}"
            tx_date = (start_date + timedelta(days=random.randint(0, 185))).strftime("%Y-%m-%d")
            cust = random.choice(customers)
            item_idx = random.randint(0, len(items) - 1)
            item = items[item_idx]
            cat = categories[item_idx]
            amt = random.randint(1500, 185000)
            chan = random.choice(channels)
            stat = random.choice(statuses)
            
            writer.writerow([tx_id, tx_date, cust, item, cat, amt, chan, stat])
            
    print(f"Generated 1200 rows of mock business ledger data at {file_path}")

if __name__ == "__main__":
    generate_mock_csv()
