import random

with open('../Data/test_data.tsv', 'r', encoding='utf-8') as file:
    lines = file.readlines()

lines = [line.strip() for line in lines if line.strip()]

random_lines = random.sample(lines, 100)
randomized_lines = [f"{line}\t{random.randint(0, 1)}" for line in random_lines]

with open('userdata.tsv', 'w', encoding='utf-8') as output_file:
    output_file.write('\n'.join(randomized_lines))