import csv
import re

STOPWORDS = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
             "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
             "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", 
             "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", 
             "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", 
             "if", "in", "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", 
             "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", 
             "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such", "than", 
             "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", 
             "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", 
             "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", 
             "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", 
             "with", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"]

def custom_standardize(text):
    text = re.sub(r"[^a-zA-Z\s]", "", text) 
    return text

def remove_stopwords(text):
    words = text.split() 
    filtered_words = [word for word in words if word.lower() not in STOPWORDS]  
    return " ".join(filtered_words) 

data = []
with open('Data/test.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('\t')  

        if len(parts) >= 4:
            if parts[1] in ["video", "kids", "northamerica", "middleeast", "tv"]:
                continue
            elif parts[4] == '':
                continue
            elif parts[1] == "weather":
                category = "environment"
            elif parts[1] in ["movies", "games"]:
                category = "entertainment"
            elif parts[1] == "news":
                if parts[2] == "newsscienceandtechnology":
                    category = "scienceandtechnology"
                elif parts[2] == "newspolitics":
                    category = "politics"
                elif parts[2] == "newsbusiness":
                    category = "finance"
                elif parts[2] in ["newsus", "newsgoodnews", "newsworld"]:
                    category = "world"
                elif parts[2] == "newscrime":
                    category = "crime"
                elif parts[2] in ["newsoffbeat"]:
                    category = "miscellaneous"
                elif parts[2] == "newsweather":
                    category = "environment"
                elif parts[2] == "elections-2020-us":
                    category = "politics"
            else:
                category = parts[1]

            headline = parts[3] + " " + parts[4]
            headline = headline.lower()
            headline = remove_stopwords(headline)
            headline = custom_standardize(headline)

            data.append((category, headline))

max_samples = 3000  
balanced_data = []
category_counts = {}

for category, headline in data:
    if category not in category_counts:
        category_counts[category] = 0

    if category_counts[category] < max_samples:
        balanced_data.append((category, headline))
        category_counts[category] += 1

with open('Data/test_data.tsv', 'w', encoding='utf-8', newline='') as output_file:
    writer = csv.writer(output_file, delimiter='\t')
    writer.writerow(["Category", "Headline"])
    writer.writerows(balanced_data)

print("Balanced data extraction complete!")