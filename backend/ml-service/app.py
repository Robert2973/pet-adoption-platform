from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image as keras_image
import numpy as np
from PIL import Image
import io
import os
import random
import json

# Inicializar la app Flask
app = Flask(__name__)
CORS(app)  # Permite llamadas desde frontend (CORS)

# ================================
# 🔹 Cargar modelo MobileNetV2
# ================================
print("Cargando modelo MobileNetV2...")
model = MobileNetV2(weights='imagenet')
print("✅ Modelo cargado exitosamente!")

# ================================
# 🔹 Cargar archivo JSON de animales
# ================================
ANIMALS_PATH = 'data/animals.json'
try:
    with open(ANIMALS_PATH, 'r') as f:
        animals_data = json.load(f)
    print(f"✅ JSON cargado: {len(animals_data['species'])} especies")
except FileNotFoundError:
    print("⚠️  No se encontró data/animals.json, usando datos por defecto.")
    animals_data = {
        'species': {
            'dog': {
                'breeds': ['mixed breed'],
                'tags': ['friendly'],
                'ages': ['adult']
            }
        }
    }
except Exception as e:
    print(f"⚠️  Error al cargar JSON: {e}")
    animals_data = {
        'species': {
            'dog': {
                'breeds': ['mixed breed'],
                'tags': ['friendly'],
                'ages': ['adult']
            }
        }
    }

# ================================
# 🔹 Función para coincidencia en JSON
# ================================
def find_species_breed(pred_name):
    pred_lower = pred_name.lower()
    for species, data in animals_data['species'].items():
        for breed in data['breeds']:
            if pred_lower in breed.lower() or breed.lower() in pred_lower:
                return species, breed
    # Fallback por palabras clave
    if any(kw in pred_lower for kw in ['dog', 'retriever', 'shepherd', 'poodle', 'beagle']):
        return 'dog', 'mixed breed'
    elif any(kw in pred_lower for kw in ['cat', 'siamese', 'persian', 'tabby']):
        return 'cat', 'mixed breed cat'
    return 'unknown', 'mixed'

# ================================
# 🔹 Función para preprocesar la imagen
# ================================
def preprocess_image(image_bytes):
    """Preprocesa la imagen para MobileNetV2"""
    try:
        # Cargar imagen desde bytes con Pillow
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        pil_img = pil_img.resize((224, 224))

        # Convertir a arreglo NumPy usando Keras
        x = keras_image.img_to_array(pil_img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)  # Normalización específica de MobileNet
        return x
    except Exception as e:
        print(f"⚠️  Error en preprocess_image: {e}")
        raise e

# ================================
# 🔹 Ruta principal de análisis
# ================================
@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No se proporcionó ninguna imagen'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400

        image_bytes = file.read()
        input_tensor = preprocess_image(image_bytes)

        # Predicción con MobileNetV2
        predictions = model.predict(input_tensor, verbose=0)
        decoded = decode_predictions(predictions, top=5)[0]
        top_pred = decoded[0]  # (class_id, class_name, confidence)
        confidence = float(top_pred[2])
        pred_name = top_pred[1]

        print(f"🔎 Predicción raw: {pred_name} (confianza: {confidence:.2f})")

        # Detectar especie y raza
        detected_species, estimated_breed = find_species_breed(pred_name)
        if detected_species == 'unknown':
            detected_species = 'dog'  # Default para mascotas
            estimated_breed = 'mixed breed'

        # Obtener edad y etiquetas
        species_data = animals_data['species'].get(
            detected_species, animals_data['species']['dog']
        )
        estimated_age = random.choice(species_data['ages'])
        ai_tags = random.sample(species_data['tags'], min(3, len(species_data['tags'])))

        print(f"✅ Análisis final: {detected_species} ({estimated_breed}) - Confianza: {confidence:.2f}")

        return jsonify({
            'detectedSpecies': detected_species,
            'estimatedBreed': estimated_breed,
            'estimatedAge': estimated_age,
            'aiTags': ai_tags,
            'analysisConfidence': confidence
        })

    except Exception as e:
        print(f"❌ Error en análisis: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error en análisis: {str(e)}'}), 500

# ================================
# 🔹 Ejecutar servidor
# ================================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
