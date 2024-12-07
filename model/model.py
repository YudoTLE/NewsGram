from runtime_stopwatch import Stopwatch
stopwatch = Stopwatch()
stopwatch.start()
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
import io
import numpy as np

# Params
VOCAB_SIZE = 50000
MAX_LENGTH = 60
EMBEDDING_DIM = 64
BATCH_SIZE = 32
PADDING_TYPE = 'pre'
TRUNC_TYPE = 'post'
SHUFFLE_BUFFER_SIZE = 1000
PREFETCH_BUFFER_SIZE = tf.data.AUTOTUNE

train_dataset = tf.data.TextLineDataset('Data/train_data.tsv')
test_dataset = tf.data.TextLineDataset('Data/test_data.tsv')

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

category_lookup = tf.lookup.StaticHashTable(
    tf.lookup.KeyValueTensorInitializer(
        keys=tf.constant(list(category_map.keys())), 
        values=tf.constant(list(category_map.values()), dtype=tf.int64)
    ),
    default_value=3
)

def parse_line(line):
    parts = tf.strings.split(line, '\t')
    category = parts[0]
    headline = parts[1]
    category_tensor = category_lookup.lookup(category) 
    headline_tensor = tf.convert_to_tensor(headline, dtype=tf.string)

    return category_tensor, headline_tensor

train_dataset = train_dataset.map(parse_line)
test_dataset = test_dataset.map(parse_line)
# for category, headline in parsed_dataset.take(4):
#     print((headline, category))

# train_size =  0.8
# total_size = tf.data.experimental.cardinality(parsed_dataset).numpy()
# train_count = int(total_size * train_size)

# shuffled_dataset = parsed_dataset.shuffle(total_size, seed=42)
# train_dataset = shuffled_dataset.take(train_count)
# test_dataset = shuffled_dataset.skip(train_count)

train_headlines = train_dataset.map(lambda category, headline: headline)
train_category = train_dataset.map(lambda category, headline: category)
test_headlines = test_dataset.map(lambda category, headline: headline)
test_category = test_dataset.map(lambda category, headline: category)
 
vectorize_layer = tf.keras.layers.TextVectorization(
    max_tokens=VOCAB_SIZE,
    output_sequence_length=MAX_LENGTH
)

vectorize_layer.adapt(train_headlines)
vocabulary = vectorize_layer.get_vocabulary()
with open("vocabulary.txt", "w") as file:
    for word in vocabulary:
        file.write(word + "\n")
def padding_func(sequences):
    padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(
        sequences, 
        maxlen=MAX_LENGTH, 
        truncating=TRUNC_TYPE, 
        padding=PADDING_TYPE
    )
                                                          
    return padded_sequences

train_sequences = tf.data.Dataset.from_tensor_slices(padding_func([vectorize_layer(text) for text in train_headlines]))
test_sequences = tf.data.Dataset.from_tensor_slices(padding_func([vectorize_layer(text) for text in test_headlines]))

train_dataset_vectorized = tf.data.Dataset.zip((train_sequences, train_category))
test_dataset_vectorized = tf.data.Dataset.zip((test_sequences, test_category))

train_dataset_final = (train_dataset_vectorized
                       .cache()
                       .shuffle(SHUFFLE_BUFFER_SIZE)
                       .prefetch(PREFETCH_BUFFER_SIZE)
                       .batch(BATCH_SIZE)
                       )

test_dataset_final = (test_dataset_vectorized
                      .cache()
                      .prefetch(PREFETCH_BUFFER_SIZE)
                      .batch(BATCH_SIZE)
                      )


model = tf.keras.Sequential([
    tf.keras.Input(shape=(MAX_LENGTH,)), 
    tf.keras.layers.Embedding(input_dim=VOCAB_SIZE, output_dim=EMBEDDING_DIM, input_length=MAX_LENGTH),  
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True)),  
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=True)),  
    tf.keras.layers.GlobalAveragePooling1D(),  
    tf.keras.layers.Dense(128, activation='relu'),  
    tf.keras.layers.Dropout(0.3),  
    tf.keras.layers.Dense(15, activation='softmax')
])

class EarlyStoppingCallback(tf.keras.callbacks.Callback):

    def on_epoch_end(self, epoch, logs=None):
        train_acc = logs.get("accuracy")
        val_acc = logs.get("val_accuracy")
        
        if train_acc >= 0.95 and val_acc >= 0.80:
            self.model.stop_training = True
            print("\nReached 95% train accuracy and 80% validation accuracy, so cancelling training!")


model.compile(optimizer='adam',  
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

model.summary()

NUM_EPOCHS = 15
model.fit(
    train_dataset_final,
    epochs=NUM_EPOCHS,
    validation_data=test_dataset_final,
    callbacks=[EarlyStoppingCallback()]
)

model.save('trained_model.keras')
stopwatch.stop()