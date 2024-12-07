from flask import Flask, request, jsonify
from prediction import predict_category

# Create Flask app
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    """Handle HTTP POST request to make predictions."""
    data = request.get_json()  # Get JSON data from request
    headline = data.get('headline', '')
    
    if not headline:
        return jsonify({ 'error': 'No headline provided' }), 400
    
    category = predict_category(headline)
    return jsonify({ 'category': category })

# Cloud Function entry point (this will be used by Google Cloud Functions)
def entry_point(request):
    return app(request)