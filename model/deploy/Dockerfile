
FROM tensorflow/tensorflow:2.17.0

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir --ignore-installed -r requirements.txt

EXPOSE 8080

CMD ["python", "app.py"]