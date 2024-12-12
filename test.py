import os
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

model = load_model('user_model.keras')

vocabulary = {}
with open("user_vocabulary.txt", "r") as file:
    for line in file:
        word = line.strip()
        vocabulary[word] = True

def prepare_input_data(headline, vocabulary):
    tokenizer = Tokenizer()
    tokenizer.word_index = {word: index + 1 for index, word in enumerate(vocabulary)}
    sequences = tokenizer.texts_to_sequences([headline])
    max_len = max(len(seq) for seq in sequences)
    padded_sequences = pad_sequences(sequences, padding='pre', maxlen=max_len)
    return padded_sequences

def predict_similarity(headline):
    input_data = prepare_input_data(headline, vocabulary)
    prediction = model.predict(input_data)
    similarity = prediction[0][0]
    
    return similarity

headline = input("Enter a headline to check similarity: ")

similarity = predict_similarity(headline)

print(f"Similarity score: {similarity:.4f}")

