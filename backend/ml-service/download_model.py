import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
import os

# Desactivar logs de oneDNN para menos ruido (opcional)
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

print("Creando modelo MobileNetV2 local (built-in Keras)... (tarda 1-2 min)")

# Cargar MobileNetV2 pre-entrenado (include_top=True para clasificación completa)
# input_shape=(224, 224, 3) es estándar para imágenes
base_model = MobileNetV2(
    weights='imagenet',  # Descarga weights pre-entrenados (internet requerido)
    include_top=True,    # Incluye capa de clasificación (1000 clases ImageNet)
    input_shape=(224, 224, 3)
)

# Guardar como modelo local (.h5)
base_model.save('mobilenet_pet_model.h5')

print("Modelo guardado exitosamente en mobilenet_pet_model.h5 (~14MB)")
print("Listo para usar en app.py – detecta clases como 'dog', 'cat', etc.")
