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
# 🔹 Cargar archivo JSON de animales (expandido o viejo)
# ================================
ANIMALS_PATH = 'data/animals.json'
try:
    with open(ANIMALS_PATH, 'r') as f:
        animals_data = json.load(f)
    num_species = len(animals_data.get('species', {}))
    print(f"✅ JSON cargado: {num_species} especies")

    # Log estructura para debug
    for species, data in animals_data.get('species', {}).items():
        breeds_key = 'commonBreeds' if 'commonBreeds' in data else ('breeds' if 'breeds' in data else 'ninguna')
        print(f"📋 Estructura JSON: {species} con {breeds_key}")

except FileNotFoundError:
    print("⚠️  No se encontró data/animals.json, usando datos por defecto.")
    animals_data = {
        'species': {
            'dog': {
                'breeds': ['mixed breed'],
                'tags': ['friendly'],
                'ages': ['adult']
            },
            'unknown': {
                'breeds': ['mixed'],
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
            },
            'unknown': {
                'breeds': ['mixed'],
                'tags': ['friendly'],
                'ages': ['adult']
            }
        }
    }

# ================================
# 🔹 Función para analizar animal (FIX FINAL: Top-1 Mayor Prob Prioritario + Label Directo si No en JSON)
# ================================
def analyze_animal(predictions, top_k=5):
    """Analiza: TOP-1 (mayor probabilidad) prioritario. Si no en JSON, usa label directo como breed."""
    # Decodificar top-5 (ordenado descendente por probabilidad)
    decoded = decode_predictions(predictions, top=top_k)[0]
    top_classes = [(cls[1], cls[2]) for cls in decoded]  # (label, conf)

    print(f"🔎 Predicciones top-{top_k}: {top_classes}")

    # ← ACUERDO: TOP-1 = MAYOR PROBABILIDAD (primera en lista)
    top1_label, top1_conf = top_classes[0]  # ej: ('golden_retriever', 0.92)
    print(f"🎯 Top-1 (mayor prob): '{top1_label}' con {top1_conf:.2f}")

    label_lower = top1_label.lower().replace('_', ' ')
    detected_species = 'unknown'
    estimated_breed = top1_label.replace('_', ' ').title()  # ← ACUERDO: Usa label directo si no match

    # Detectar especie por keywords en top-1 label (siempre asigna válida)
    if any(word in label_lower for word in ['dog', 'puppy', 'hound', 'retriever', 'shepherd', 'terrier', 'mastiff', 'dane', 'poodle', 'beagle', 'bulldog', 'collie', 'spaniel']):
        detected_species = 'dog'
    elif any(word in label_lower for word in ['cat', 'kitten', 'siamese', 'persian', 'tabby', 'maine', 'russian', 'abyssinian']):
        detected_species = 'cat'
    elif any(word in label_lower for word in ['bird', 'parrot', 'cock', 'hen', 'owl', 'eagle', 'duck', 'canary', 'finch']):
        detected_species = 'bird'
    elif any(word in label_lower for word in ['rabbit', 'bunny', 'hare', 'lop']):
        detected_species = 'rabbit'
    else:
        detected_species = 'dog'  # ← ACUERDO: Default 'dog' si ambiguo (no unknown)

    # ← ACUERDO: Chequea si top-1 match en JSON (breeds/commonBreeds o mappings)
    match_found = False
    for species, data in animals_data['species'].items():
        if species == 'unknown':
            continue
        # Chequea breeds/commonBreeds
        breeds_list = data.get('commonBreeds', data.get('breeds', []))
        breeds = [b.lower().replace('_', ' ') for b in breeds_list]
        for breed in breeds:
            if label_lower in breed or breed in label_lower:
                match_found = True
                # Usa la raza del JSON si match (mejor que label directo)
                best_breed = None
                best_score = 0
                for b in breeds_list:
                    b_lower = b.lower().replace('_', ' ')
                    score = len(set(label_lower.split()) & set(b_lower.split()))
                    if score > best_score and (label_lower in b_lower or b_lower in label_lower):
                        best_score = score
                        best_breed = b
                estimated_breed = best_breed if best_breed else estimated_breed  # Prioriza JSON si match
                detected_species = species  # Actualiza especie si match mejor
                print(f"✅ Match en JSON breeds: '{top1_label}' → {species} ({estimated_breed})")
                break
        if match_found:
            break

        # Si no en breeds, chequea mappings (tu lógica original)
        if not match_found and 'imageNetMappings' in data:
            mappings = [m.lower() for m in data['imageNetMappings']]
            if label_lower in mappings:
                match_found = True
                breeds_list = data.get('commonBreeds', data.get('breeds', ['mixed breed']))
                estimated_breed = random.choice(breeds_list)  # O usa top1_label si prefieres directo
                detected_species = species
                print(f"✅ Match en JSON mappings: '{top1_label}' → {species}")
                break

    # ← ACUERDO: Si no match en JSON, usa label directo como breed (ej: "komondor" no en JSON → breed="Komondor")
    if not match_found:
        print(f"⚠️  No match en JSON para '{top1_label}': usando label directo como breed bajo '{detected_species}'")
        # estimated_breed ya es top1_label formatted – perfecto

    # Umbral confianza: Si top-1 <0.3, fallback genérico (pero usa top-1 label si posible)
    if top1_conf < 0.3:
        print(f"⚠️  Confianza top-1 baja ({top1_conf:.2f}): genérico pero con label")
        estimated_breed = 'mixed breed (' + top1_label.replace('_', ' ').title() + ')'  # Incluye predicción

    # Obtener datos de especie (ages/tags del JSON – siempre válido)
    species_data = animals_data['species'].get(detected_species, animals_data['species'].get('dog', {}))
    estimated_ages = species_data.get('estimatedAges', species_data.get('ages', ['adult']))
    estimated_age = random.choice(estimated_ages)
    tags = species_data.get('tags', ['friendly'])
    ai_tags = random.sample(tags, min(3, len(tags)))

    print(f"✅ Análisis final: {detected_species} ({estimated_breed}) - Confianza top-1: {top1_conf:.2f}")
    return {
        'detectedSpecies': detected_species,
        'estimatedBreed': estimated_breed,
        'estimatedAge': estimated_age,
        'aiTags': ai_tags,
        'analysisConfidence': float(round(top1_conf, 2))  # Siempre top-1 conf
    }

# ================================
# 🔹 Función para preprocesar la imagen (sin cambios)
# ================================
def preprocess_image(image_bytes):
    """Preprocesa la imagen para MobileNetV2"""
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        pil_img = pil_img.resize((224, 224))
        x = keras_image.img_to_array(pil_img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        return x
    except Exception as e:
        print(f"⚠️  Error en preprocess_image: {e}")
        raise e

# ================================
# 🔹 Ruta principal de análisis (sin cambios)
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

        predictions = model.predict(input_tensor, verbose=0)
        result = analyze_animal(predictions)

        return jsonify(result)

    except Exception as e:
        print(f"❌ Error en análisis: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error en análisis: {str(e)}'}), 500

# ================================
# 🔹 Ejecutar servidor (sin cambios)
# ================================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
