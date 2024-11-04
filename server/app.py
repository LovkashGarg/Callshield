from flask import Flask, request, jsonify
import joblib
import os
from flask_cors import CORS

app = Flask(__name__)

CORS(app)


base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'model', 'model.pkl')
vectorizer_path = os.path.join(base_dir, 'model', 'vectorizer.pkl')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

store = {}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_text = data.get('text')
    id = data.get('id')

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400
    
    if id not in store:
        store[id] = [input_text]
        
    else:
        store[id].append(input_text)

    text = ' '.join(store[id])
    print("all text : ", text)

    if len(store[id])> 4:
        store[id].pop(0)

    input_transformed = vectorizer.transform([text]).toarray()

    probabilities = model.predict_proba(input_transformed)
    positive_prob = probabilities[0, 1] if probabilities.shape[1] > 1 else 0.5
    score = round(positive_prob * 100)

    return jsonify({"fraud_probability": 100 - score})

if __name__ == '__main__':
    app.run(debug=True)
