from collections import Counter

category_counter = Counter()

with open('userdata.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()

for line in lines:
    parts = line.strip().split('\t')
    
    if len(parts) >= 2:
        category = parts[0]
        category_counter[category] += 1

for category, count in category_counter.items():
    print(f"{category}: {count}")

top_categories = category_counter.most_common(3)
print("\nTop 3 Most Common Categories:")
for category, count in top_categories:
    print(f"{category}: {count}")