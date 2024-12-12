import csv
import re

# List of stopwords
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

# Custom text cleaning functions
def custom_standardize(text):
    text = re.sub(r"[^a-zA-Z\s]", "", text) 
    return text

def remove_stopwords(text):
    words = text.split() 
    filtered_words = [word for word in words if word.lower() not in STOPWORDS]  
    return " ".join(filtered_words) 

# Process data and save to a new file
data = []
input_file = 'userdata.tsv'
output_file = 'model_data.tsv'

with open(input_file, 'r', encoding='utf-8') as file:
    lines = file.readlines()

    for line in lines:
        parts = line.strip().split('\t')  
        if len(parts) >= 3:  # Ensure proper formatting
            headline = parts[1]
            value = parts[2]
            
            headline = headline.lower()
            headline = remove_stopwords(headline)
            headline = custom_standardize(headline)

            data.append((headline, value))

with open(output_file, 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file, delimiter='\t')
    for row in data:
        writer.writerow(row)

print("Data preprocessing and saving complete!")
