import csv
from collections import Counter

# List to store subcategories
subcategories = []

with open('news.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('\t')
        
        if len(parts) >= 4:  # Ensure the line has enough columns
            main_category = parts[1].lower()
            subcategory = parts[2].strip() if len(parts) > 2 else None
            
            if main_category == "news" and subcategory:  # Filter by main category "news"
                subcategories.append(subcategory)

# Use Counter to count occurrences of each subcategory
subcategory_counts = Counter(subcategories)

# Print the counts
print("Subcategory counts for 'news':")
for subcategory, count in subcategory_counts.items():
    print(f"{subcategory}: {count}")
