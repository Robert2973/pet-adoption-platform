from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import numpy as np
import io
import os

app = Flask(__name__)
CORS(app)  # Permite llamadas desde tu frontend/backend (CORS)

# Cargar modelo al inicio (una vez)
print("Cargando modelo TensorFlow...")
model = keras.models.load_model('mobilenet_pet_model.h5')
print("Modelo cargado exitosamente!")

# Clases simples para mascotas (expande con fine-tuning)
# Para especie: Basado en top prediction (ej: si 'dog' en labels >0.5)
SPECIES_MAP = ['dog', 'cat', 'unknown']  # Índices 0=perro, 1=gato
BREED_MAP = {0: 'labrador', 1: 'siames', 2: 'mixed', 3: 'golden retriever'}  # Ejemplos
AGE_MAP = {0: 'cachorro', 1: 'joven', 2: 'adulto', 3: 'senior'}  # Basado en rasgos
EMOTION_TAGS = ['happy', 'sad', 'playful', 'calm', 'energetic']  # Filtrados de labels

def preprocess_image(image_bytes):
    """Preprocesa bytes de imagen para el modelo"""
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No se proporcionó imagen'}), 400

        file = request.files['image']
        image_bytes = file.read()

        # Preprocesar
        input_tensor = preprocess_image(image_bytes)

        # Inferencia
        predictions = model.predict(input_tensor, verbose=0)[0]
        predicted_index = np.argmax(predictions)
        confidence = float(np.max(predictions))

        # Lógica de mapeo para mascotas (simplificada; ajusta con tu dataset)
        detected_species = 'dog' if confidence > 0.6 and predicted_index % 2 == 0 else 'cat'  # Ejemplo básico
        estimated_breed = BREED_MAP.get(predicted_index % 4, 'mixed breed')
        estimated_age = AGE_MAP.get(predicted_index % 4, 'adulto')

        # Tags: Filtra labels relevantes (MobileNet da 1000 clases; simula para mascotas)
        ai_tags = [EMOTION_TAGS[predicted_index % 5]] if confidence > 0.7 else ['unknown']

        print(f"Análisis completado: {detected_species} - Confianza: {confidence:.2f}")

        return jsonify({
            'detectedSpecies': detected_species,
            'estimatedBreed': estimated_breed,
            'estimatedAge': estimated_age,
            'aiTags': ai_tags,
            'analysisConfidence': confidence
        })
    except Exception as e:
        print(f"Error en análisis: {e}")
        return jsonify({'error': f'Error en análisis: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
