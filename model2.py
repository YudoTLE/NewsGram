from runtime_stopwatch import Stopwatch
stopwatch = Stopwatch()
stopwatch.start()
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.layers import TextVectorization, Embedding, Dense, LSTM, Dropout
from tensorflow.keras.models import Sequential

import io
import numpy as np

VOCAB_SIZE = 50000
MAX_LENGTH = 60
EMBEDDING_DIM = 64
BATCH_SIZE = 4
PADDING_TYPE = 'pre'
TRUNC_TYPE = 'post'

train_headlines = []
train_behaviour = []

with open('model_data.tsv', 'r') as file:
    for line in file:
        parts = line.strip().split('\t')  
        if len(parts) == 2:  
            train_headlines.append(parts[0])  
            train_behaviour.append(int(parts[1]))  

vectorize_layer = TextVectorization(
    max_tokens=VOCAB_SIZE, 
    output_sequence_length=MAX_LENGTH, 
)

vectorize_layer.adapt(train_headlines)
vocabulary = vectorize_layer.get_vocabulary()
with open("user_vocabulary.txt", "w") as file:
    for word in vocabulary:
        file.write(word + "\n")

train_sequences = vectorize_layer(train_headlines)
train_dataset_vectorized = tf.data.Dataset.from_tensor_slices((train_sequences,train_behaviour))

train_dataset_final = (train_dataset_vectorized
                       .cache()
                       .batch(BATCH_SIZE)
                       )

model = Sequential([
    Embedding(input_dim=VOCAB_SIZE, output_dim=EMBEDDING_DIM, input_length=MAX_LENGTH),
    LSTM(64, return_sequences=True),
    Dropout(0.2),
    LSTM(32),
    Dropout(0.2),
    Dense(16, activation='relu'),
    Dense(1, activation='sigmoid')  # Sigmoid for binary classification
])

model.compile(
    loss='binary_crossentropy',
    optimizer='adam',
    metrics=['accuracy']
)

NUM_EPOCHS = 15
model.fit(
    train_dataset_final,
    epochs=NUM_EPOCHS,
)

model.save('user_model.keras')
stopwatch.stop()