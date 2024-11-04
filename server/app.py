from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
socketio = SocketIO(app)

CORS(app)


base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'model', 'model.pkl')
vectorizer_path = os.path.join(base_dir, 'model', 'vectorizer.pkl')

# Load model and vectorizer
model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

# Store previous messages for each ID
store = {}

@app.route('/predict', methods=['POST'])
def predict():
    """This endpoint handles regular HTTP POST requests for predictions."""
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
    print("all text:", text)

    if len(store[id]) > 4:
        store[id].pop(0)

    input_transformed = vectorizer.transform([text]).toarray()

    probabilities = model.predict_proba(input_transformed)
    positive_prob = probabilities[0, 1] if probabilities.shape[1] > 1 else 0.5
    score = round(positive_prob * 100)

    return jsonify({"fraud_probability": 100 - score})

@socketio.on('predict')
def handle_predict_event(data):
    """This handler responds to WebSocket messages for predictions."""
    input_text = data.get('text')
    id = data.get('id')

    print("Received text:", input_text)

    if not input_text:
        emit('error', {"error": "No input text provided"})
        return
    
    # Append or create the stored text history for this ID
    if id not in store:
        store[id] = [input_text]
    else:
        store[id].append(input_text)

    # Combine text messages for prediction
    text = ' '.join(store[id])
    print("All text:", text)

    # Limit history size to last 4 messages
    if len(store[id]) > 4:
        store[id].pop(0)

    # Transform input text for model prediction
    input_transformed = vectorizer.transform([text]).toarray()

    # Get fraud prediction probability
    probabilities = model.predict_proba(input_transformed)
    positive_prob = probabilities[0, 1] if probabilities.shape[1] > 1 else 0.5
    score = round(positive_prob * 100)

    # Send the result back to the client through WebSocket
    emit('prediction', {"fraud_probability": 100 - score})

if __name__ == '__main__':
    socketio.run(app, debug=True)
