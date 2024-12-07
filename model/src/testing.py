import streamlit as st
import tensorflow as tf
import numpy as np
import re
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load the trained model
model = tf.keras.models.load_model('trained_model.keras')

# Define parameters
VOCAB_SIZE = 50000
MAX_LENGTH = 30

# Define categories
category_map = {
    "lifestyle": 0,
    "scienceandtechnology": 1,
    "health": 2,
    "world": 3,
    "sports": 4,
    "environment": 5,
    "entertainment": 6,
    "foodanddrink": 7,
    "autos": 8,
    "travel": 9,
    "politics": 10,
    "finance": 11,
    "music": 12,
    "crime": 13,
    "miscellaneous": 14
}

# Load vocabulary from file
with open('vocabulary.txt', 'r') as file:
    vocabulary_list = file.read().splitlines()

# Create and set up TextVectorization layer
vectorize_layer = tf.keras.layers.TextVectorization(
    max_tokens=VOCAB_SIZE, output_sequence_length=MAX_LENGTH
)
vectorize_layer.set_vocabulary(vocabulary_list)

# STOPWORDS and utility functions
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
    """Convert to lowercase and remove punctuation."""
    text = re.sub(r"[^a-zA-Z\s]", "", text)  # Remove punctuation
    text = text.lower()  # Convert to lowercase
    return text

def remove_stopwords(text):
    """Remove stopwords from text."""
    words = text.split()
    filtered_words = [word for word in words if word not in STOPWORDS]
    return " ".join(filtered_words)

def preprocess_text(text):
    """Complete preprocessing pipeline."""
    text = custom_standardize(text)
    text = remove_stopwords(text)
    return text

def predict_category(headline):
    """Predict category for a given headline."""
    # Preprocess input
    cleaned_headline = preprocess_text(headline)
    sequence = vectorize_layer([cleaned_headline])
    padded_sequence = pad_sequences(sequence, maxlen=MAX_LENGTH, padding='pre', truncating='post')
    prediction = model.predict(padded_sequence)
    category_index = np.argmax(prediction, axis=1)[0]
    category = list(category_map.keys())[category_index]
    return category

# Streamlit app
st.title("News Category Prediction")
st.write("Enter a headline to predict its category:")

headline_input = st.text_input("Headline")

if headline_input:
    category = predict_category(headline_input)
    st.write(f"The predicted category for this headline is: **{category}**")
