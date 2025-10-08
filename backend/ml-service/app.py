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

    # Log estructura para debug (muestra si usa 'commonBreeds' o 'breeds')
    for species, data in animals_data.get('species', {}).items():
        breeds_key = 'commonBreeds' if 'commonBreeds' in data else ('breeds' if 'breeds' in data else 'ninguna')
        print(f"📋 Estructura JSON: {species} con {breeds_key}")

except FileNotFoundError:
    print("⚠️  No se encontró data/animals.json, usando datos por defecto.")
    animals_data = {
        'species': {
            'dog': {
                'breeds': ['mixed breed'],  # Fallback a 'breeds' para compatibilidad
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
# 🔹 Función para analizar animal (top-3 + mapeos + umbral + robustez)
# ================================
def analyze_animal(predictions, top_k=5):
    """Analiza predicciones con top-5, mapeos de confusiones y umbral de confianza"""
    # Decodificar top-5 predicciones
    decoded = decode_predictions(predictions, top=top_k)[0]
    top_classes = [(cls[1], cls[2]) for cls in decoded]  # Lista de (nombre_clase, confianza)

    print(f"🔎 Predicciones top-{top_k}: {top_classes}")

    # Confianza máxima de top-5
    max_confidence = max([conf for _, conf in top_classes])

    # Umbral más bajo: Si confianza baja, fallback a dog (no unknown)
    if max_confidence < 0.3:
        print(f"⚠️  Confianza baja en top-{top_k} ({max_confidence:.2f}): fallback a dog")
        dog_data = animals_data['species'].get('dog', {'breeds': ['mixed breed'], 'tags': ['friendly'], 'ages': ['adult']})
        dog_breeds = dog_data.get('commonBreeds', dog_data.get('breeds', ['mixed breed']))
        dog_ages = dog_data.get('estimatedAges', dog_data.get('ages', ['adult']))
        dog_tags = dog_data.get('tags', ['friendly'])
        return {
            'detectedSpecies': 'dog',
            'estimatedBreed': random.choice(dog_breeds),
            'estimatedAge': random.choice(dog_ages),
            'aiTags': random.sample(dog_tags, min(3, len(dog_tags))),
            'analysisConfidence': float(round(max_confidence, 2))
        }

    # Buscar match en especies (primero exacto en breeds/commonBreeds, luego mapeos)
    detected_species = 'unknown'
    estimated_breed = 'mixed breed'

    for label, conf in top_classes:
        label_lower = label.lower().replace('_', ' ')

        # Buscar en breeds/commonBreeds de cada especie (fuzzy match + robustez)
        for species, data in animals_data['species'].items():
            if species == 'unknown':
                continue
            # Maneja ambas claves: 'commonBreeds' o 'breeds'
            breeds_list = data.get('commonBreeds', data.get('breeds', []))
            breeds = [b.lower().replace('_', ' ') for b in breeds_list]
            # Match si la predicción contiene o es contenida en una raza
            for breed in breeds:
                if label_lower in breed or breed in label_lower:
                    detected_species = species
                    # Elige la raza más cercana (exacta si posible)
                    original_breeds = data.get('commonBreeds', data.get('breeds', ['mixed breed']))
                    # Mejor match: Busca la que mejor coincida
                    best_breed = None
                    best_score = 0
                    for b in original_breeds:
                        b_lower = b.lower().replace('_', ' ')
                        score = len(set(label_lower.split()) & set(b_lower.split()))  # Palabras comunes
                        if score > best_score and (label_lower in b_lower or b_lower in label_lower):
                            best_score = score
                            best_breed = b
                    estimated_breed = best_breed if best_breed else 'mixed breed'
                    print(f"✅ Match en breeds: {label} → {species} ({estimated_breed})")
                    break
            if detected_species != 'unknown':
                break

        # TU BLOQUE ORIGINAL: Si no match en breeds, chequear mapeos de confusiones
        if detected_species == 'unknown':
            for species, data in animals_data['species'].items():
                if 'imageNetMappings' in data:
                    mappings = [m.lower() for m in data['imageNetMappings']]
                    if label_lower in mappings:
                        detected_species = species
                        # Maneja breeds/commonBreeds para raza genérica
                        breeds_list = data.get('commonBreeds', data.get('breeds', ['mixed breed']))
                        estimated_breed = random.choice(breeds_list)
                        print(f"✅ Match en mapeo: {label} → {species} (confusión redirigida)")
                        break
                if detected_species != 'unknown':
                    break

        if detected_species != 'unknown':
            break  # Usa el primer match válido en top-5

    # Fallback si aún unknown (MEJORADO: Usa top-1 para breed, pero especie válida para datos JSON)
    if detected_species == 'unknown':
        print("⚠️  No match encontrado: fallback a top-1 predicción")

        # Top-1: La clase con más confianza
        top_label, top_conf = top_classes[0]  # ej: ('Great_Dane', 0.93)

        # Solo usa si confianza alta (ajusta >0.5 si quieres más estricto)
        if top_conf > 0.5:
            # Detectar especie básica de la top-1 (simple: chequea palabras clave) - SIEMPRE ASIGNA ESPECIE VÁLIDA
            label_lower = top_label.lower()
            if any(word in label_lower for word in ['dog', 'puppy', 'hound', 'retriever', 'shepherd', 'terrier', 'mastiff', 'dane', 'poodle']):
                detected_species = 'dog'
            elif any(word in label_lower for word in ['cat', 'kitten', 'siamese', 'persian', 'tabby']):
                detected_species = 'cat'
            elif any(word in label_lower for word in ['bird', 'parrot', 'cock', 'hen', 'owl', 'eagle', 'duck']):
                detected_species = 'bird'
            elif any(word in label_lower for word in ['rabbit', 'bunny', 'hare']):
                detected_species = 'rabbit'
            else:
                detected_species = 'dog'  # Default para mascotas (evita unknown)

            estimated_breed = top_label  # Usa la predicción top-1 directamente (ej: "Great_Dane")
            print(f"✅ Fallback top-1: {detected_species} ({estimated_breed}) - Confianza: {top_conf:.2f}")
        else:
            # Si confianza baja, usa mixed breed genérico
            print("⚠️  Confianza baja en top-1: usa mixed breed")
            detected_species = 'dog'  # Default
            estimated_breed = 'mixed breed'

    # TU BLOQUE ORIGINAL: Obtener datos de la especie detectada (robustez para todas las claves)
    species_data = animals_data['species'].get(detected_species, animals_data['species'].get('unknown', {}))
    estimated_ages = species_data.get('estimatedAges', species_data.get('ages', ['adult']))
    estimated_age = random.choice(estimated_ages)
    tags = species_data.get('tags', ['friendly'])
    ai_tags = random.sample(tags, min(3, len(tags)))

    print(f"✅ Análisis final: {detected_species} ({estimated_breed}) - Confianza: {max_confidence:.2f}")

    return {
        'detectedSpecies': detected_species,
        'estimatedBreed': estimated_breed,
        'estimatedAge': estimated_age,
        'aiTags': ai_tags,
        'analysisConfidence': float(round(max_confidence, 2))  # FIX: Convertir a float nativo para JSON
    }


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

        # Predicción con MobileNetV2 (top-3 implícito en analyze_animal)
        predictions = model.predict(input_tensor, verbose=0)

        # Analizar con lógica mejorada
        result = analyze_animal(predictions)

        return jsonify(result)

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
