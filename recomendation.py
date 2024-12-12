import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.models import load_model
import numpy as np
from collections import Counter
import random

model = load_model('user_model.keras')

vocabulary = {}
with open("user_vocabulary.txt", "r") as file:
    for line in file:
        word = line.strip()
        vocabulary[word] = True

tokenizer = Tokenizer()
tokenizer.word_index = {word: index + 1 for index, word in enumerate(vocabulary)}

def prepare_input_data(headlines):
    sequences = tokenizer.texts_to_sequences(headlines)
    max_len = max(len(seq) for seq in sequences)
    sequences = tf.keras.preprocessing.sequence.pad_sequences(sequences, padding='pre', maxlen=max_len)
    return sequences

def predict_similarity(headline):
    input_data = prepare_input_data([headline])
    prediction = model.predict(input_data)
    return prediction[0][0]

test_data_file = '../Data/train_data.tsv'
test_data = []

with open(test_data_file, 'r', encoding='utf-8') as file:
    lines = file.readlines()
    for line in lines:
        parts = line.strip().split('\t')
        if len(parts) == 2:
            headline = parts[1]
            category = parts[0]
            test_data.append((headline, category))

category_counter = Counter()
with open('userdata.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()
    for line in lines:
        parts = line.strip().split('\t')
        if len(parts) >= 2:
            category = parts[0]
            category_counter[category] += 1

top_categories = category_counter.most_common(3)
print("Top 3 Categories:", top_categories)

category_cycle = [2, 1, 1, 1] 
selected_headlines = []
collected_count = 0
category_idx = 0

def get_headlines_by_category(category):
    return [headline for headline, cat in test_data if cat == category]

def collect_headlines_from_category(category, count):
    category_headlines = get_headlines_by_category(category)
    if len(category_headlines) >= count:
        return random.sample(category_headlines, count)
    elif len(category_headlines) > 0:
        return category_headlines  
    return []

while collected_count < 200:
    category = top_categories[category_idx % 3][0]  # Cycle through top 3 categories
    headlines_to_add = collect_headlines_from_category(category, category_cycle[category_idx % 4])
    
    if headlines_to_add:
        selected_headlines.extend(headlines_to_add)
        collected_count += len(headlines_to_add)

    category_idx += 1  

# Get headlines from other categories
other_headlines = [headline for headline, category in test_data if category not in [top_categories[0][0], top_categories[1][0], top_categories[2][0]]]
selected_headlines.extend(random.sample(other_headlines, 100))

# Predict similarities and filter headlines with similarity > 0.4
recommended_headlines = []

for headline in selected_headlines:
    similarity = predict_similarity(headline)
    if similarity > 0.5:
        recommended_headlines.append((headline, similarity))

# Save the recommended headlines to a new file
with open('recommendation.tsv', 'w', encoding='utf-8') as file:
    for headline, similarity in recommended_headlines:
        file.write(f"{headline}\t{similarity:.4f}\n")

print(f"Saved {len(recommended_headlines)} recommended headlines to 'recommendation.tsv'.")
