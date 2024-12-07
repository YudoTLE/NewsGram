from flask import Flask, request, jsonify
from prediction import predict_category

# Create Flask app
app = Flask(__name__)

@app.route('/predict-category', methods=['POST'])
def predict():
    """Handle HTTP POST request to make predictions."""
    data = request.get_json()  # Get JSON data from request
    headline = data.get('headline', '')
    
    if not headline:
        return jsonify({ 'error': 'No headline provided' }), 400
    
    category = predict_category(headline)
    return jsonify({ 'category': category })

# Cloud Function entry point (this will be used by Google Cloud Functions)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)