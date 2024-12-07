import tensorflow as tf
import numpy as np
import re
from tensorflow.keras.preprocessing.sequence import pad_sequences  # type: ignore

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
with open('stopwords.txt', 'r') as file:
    STOPWORDS = file.readlines()

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
    cleaned_headline = preprocess_text(headline)
    sequence = vectorize_layer([cleaned_headline])
    padded_sequence = pad_sequences(sequence, maxlen=MAX_LENGTH, padding='pre', truncating='post')
    prediction = model.predict(padded_sequence)
    category_index = np.argmax(prediction, axis=1)[0]
    category = list(category_map.keys())[category_index]
    return category
