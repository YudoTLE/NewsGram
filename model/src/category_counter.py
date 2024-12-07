from collections import Counter

category_counter = Counter()

with open('Data/test_data.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()

for line in lines:
    parts = line.strip().split('\t')
    
    if len(parts) >= 2:
        category = parts[0]
        category_counter[category] += 1

for category, count in category_counter.items():
    print(f"{category}: {count}")
