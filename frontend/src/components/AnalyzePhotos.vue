<template>
  <v-container fluid class="pa-4" :style="{
    background: 'linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: !imagePreview ? 'center' : 'flex-start',
    paddingTop: !imagePreview ? '0' : '1rem',  // Reduce padding top inicial para mejor centrado
    paddingBottom: !imagePreview ? '0' : '1rem'
  }">
    <!-- Título y subtítulo centrados horizontal y verticalmente (inicialmente) -->
    <v-row justify="center" class="mb-8 flex-grow-1" :class="{ 'align-center': !imagePreview }">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="display-2 font-weight-bold white--text mb-4">🔍 Análisis IA de Mascotas</h1>
        <p class="subtitle-1 white--text">Sube una foto para detectar especie, raza, edad y más</p>
      </v-col>
    </v-row>

    <!-- Input para subir/capturar imagen (centrado debajo del título) -->
    <v-row justify="center" class="mb-6" :class="{ 'mt-0': !imagePreview }">
      <v-col cols="12" md="6">
        <v-file-input
          v-model="selectedImage"
          label="Sube una foto o usa cámara"
          accept="image/*"
          prepend-icon="mdi-camera"
          :rules="[v => !!v || 'Selecciona una imagen']"
          @change="handleImageUpload"
          capture="environment"
        ></v-file-input>
      </v-col>
    </v-row>

    <!-- Preview de imagen con overlays (si hay resultados) -->
    <v-row v-if="analysis" justify="center" class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="mx-auto" elevation="10">
          <v-img
            :src="imagePreview || analysis.imageUrl || 'https://via.placeholder.com/400x400?text=Imagen+Analizada'"
            height="400"
            class="rounded-lg"
            style="position: relative;"
          >
            <v-overlay absolute :value="true">
              <div class="d-flex flex-column pa-4" style="background: rgba(0,0,0,0.7); border-radius: 10px; max-width: 300px;">
                <v-chip color="pink" class="ma-1 white--text">{{ analysis.detectedSpecies || 'Desconocido' }}</v-chip>
                <v-chip color="indigo" class="ma-1 white--text">Raza: {{ analysis.estimatedBreed || 'Mixed' }}</v-chip>
                <v-chip color="green" class="ma-1 white--text">Edad: {{ analysis.estimatedAge || 'Adulto' }}</v-chip>
                <div v-if="analysis.aiTags && analysis.aiTags.length" class="mt-2">
                  <strong>Tags:</strong>
                  <v-chip v-for="tag in analysis.aiTags" :key="tag" small color="warning" class="ma-1">{{ tag }}</v-chip>
                </div>
                <v-progress-linear :value="analysis.analysisConfidence * 100" color="success" class="mt-2">
                  Confianza: {{ Math.round(analysis.analysisConfidence * 100) }}%
                </v-progress-linear>
              </div>
            </v-overlay>
          </v-img>
        </v-card>
      </v-col>
    </v-row>

    <!-- Preview simple si hay imagen pero no análisis -->
    <v-row v-if="imagePreview && !analysis" justify="center" class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="mx-auto" elevation="5">
          <v-img :src="imagePreview" height="300" class="rounded-lg"></v-img>
          <v-card-text class="text-center">Imagen lista para analizar</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de análisis (si hay imagen pero no resultados) -->
    <v-row v-if="selectedImage && !analysis" justify="center" class="mb-6">
      <v-col cols="12" md="6" class="text-center">
        <v-btn
          color="white"
          large
          @click="analyzeImage"
          :loading="loading"
        >
          🔍 Analizar con IA
        </v-btn>
      </v-col>
    </v-row>

    <!-- Sección de características detalladas (abajo de la imagen, solo si hay análisis) -->
    <v-row v-if="analysis" justify="center" class="mb-6">
      <v-col cols="12" md="10">
        <v-card class="mx-auto pa-6" elevation="8" color="white" rounded="lg">
          <v-card-title class="text-h5 font-weight-bold primary--text mb-4">
            📋 Características Detectadas
          </v-card-title>

          <!-- Especie, Raza y Edad en chips grandes -->
          <v-row class="mb-4">
            <v-col cols="12" sm="4">
              <v-chip color="pink" large class="ma-2 white--text">
                🐶 Especie: {{ analysis.detectedSpecies || 'Desconocido' }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="4">
              <v-chip color="indigo" large class="ma-2 white--text">
                🐕 Raza: {{ analysis.estimatedBreed || 'Mixed' }}
              </v-chip>
            </v-col>
            <v-col cols="12" sm="4">
              <v-chip color="green" large class="ma-2 white--text">
                📅 Edad: {{ analysis.estimatedAge || 'Adulto' }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Tags en lista -->
          <v-row v-if="analysis.aiTags && analysis.aiTags.length" class="mb-4">
            <v-col cols="12">
              <v-card-subtitle class="text-h6 font-weight-medium warning--text mb-2">
                🏷️ Tags Automáticos:
              </v-card-subtitle>
              <v-chip
                v-for="tag in analysis.aiTags"
                :key="tag"
                small
                color="warning"
                class="ma-1"
                outlined
              >
                {{ tag }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Confianza en barra y texto -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-card-subtitle class="text-h6 font-weight-medium success--text mb-2">
                📊 Nivel de Confianza:
              </v-card-subtitle>
              <v-progress-linear
                :value="analysis.analysisConfidence * 100"
                color="success"
                height="20"
                class="mb-2"
              >
                <strong class="ml-2">{{ Math.round(analysis.analysisConfidence * 100) }}%</strong>
              </v-progress-linear>
              <p class="caption grey--text">
                {{ analysis.analysisConfidence > 0.8 ? 'Alta precisión' : analysis.analysisConfidence > 0.5 ? 'Precisión media' : 'Baja precisión – considera verificar manualmente' }}
              </p>
            </v-col>
          </v-row>

          <!-- Botón para limpiar y cargar otra -->
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-btn
                color="error"
                large
                outlined
                @click="resetAnalysis"
                class="ma-2"
              >
                🗑️ Limpiar y Subir Nueva Imagen
              </v-btn>
              <p class="caption grey--text mt-2">
                Haz clic para analizar otra mascota
              </p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mensaje de carga o error -->
    <v-row v-if="loading" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
        <p class="white--text mt-2">Analizando imagen... (usando TensorFlow)</p>
      </v-col>
    </v-row>

    <!-- Mensaje de error si hay problema -->
    <v-row v-if="errorMsg" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-alert type="error" prominent>
          {{ errorMsg }}
        </v-alert>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

// Estados reactivos (sin cambios)
const selectedImage = ref(null);  // Single File o null
const imagePreview = ref(null);
const analysis = ref(null);
const loading = ref(false);
const errorMsg = ref(null);
const snackbar = ref({ show: false, message: '', color: 'success' });

onMounted(() => {
  console.log('AnalyzePhotos componente montado correctamente!');
});

// Backup: Si v-model cambia sin @change, genera preview (sin cambios)
const handleImageUploadFromModel = () => {
  if (selectedImage.value && !imagePreview.value) {
    const file = selectedImage.value;
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
};

watch(selectedImage, () => {
  handleImageUploadFromModel();
});

// FIX: Manejo del DOM Event en @change (sin cambios)
const handleImageUpload = (event) => {
  if (analysis.value) {
    resetAnalysis();
  }

  try {
    console.log('Event recibido en @change:', event.type, event.target?.nodeName);  // Debug: Confirma Event
    errorMsg.value = null;  // Limpia errores

    const files = event.target?.files;  // FileList del input nativo
    console.log('Files extraídos de event.target.files:', files, files?.length);  // Debug clave

    if (files && files.length > 0) {
      const file = files[0];  // Single file (no multiple)
      if (file instanceof File && file.size > 0) {
        // Chequeo robusto: MIME type O extensión
        const isImageType = file.type.startsWith('image/');
        const isImageExt = file.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
        if (isImageType || isImageExt) {
          // ✅ Válido: Setea selectedImage y genera preview
          selectedImage.value = file;
          console.log('Archivo válido para preview:', file.name, file.size, 'Tipo:', file.type);

          const reader = new FileReader();
          reader.onload = (e) => {
            imagePreview.value = e.target.result;
          };
          reader.onerror = () => {
            console.error('Error leyendo archivo:', reader.error);
            errorMsg.value = 'Error al cargar preview de imagen';
          };
          reader.readAsDataURL(file);
        } else {
          console.log('Archivo no válido - Tipo:', file.type, 'Extensión:', file.name);
          selectedImage.value = null;
          imagePreview.value = null;
          errorMsg.value = 'Archivo no es una imagen válida (JPG/PNG/GIF).';
        }
      } else {
        console.log('File inválido (no File o size 0):', file);
        selectedImage.value = null;
        imagePreview.value = null;
      }
    } else {
      // Limpieza: No hay files
      selectedImage.value = null;
      imagePreview.value = null;
      console.log('No hay files en FileList (limpieza o cancelación)');
    }
  } catch (err) {
    console.error('Error en handleImageUpload:', err);
    errorMsg.value = 'Error al procesar imagen: ' + err.message;
    selectedImage.value = null;
    imagePreview.value = null;
  }
};

// Análisis de imagen (sin cambios)
const analyzeImage = async () => {
  if (!selectedImage.value) {
    showSnackbar('Selecciona una imagen primero', 'warning');
    return;
  }

  loading.value = true;
  analysis.value = null;
  errorMsg.value = null;

  try {
    const formData = new FormData();
    formData.append('image', selectedImage.value);

    console.log('Enviando request a /api/analyze-image...');
    const response = await axios.post('/api/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    analysis.value = response.data;
    showSnackbar('Análisis completado!', 'success');
    console.log('Respuesta ML exitosa:', response.data);
  } catch (error) {
    console.error('Error en análisis:', error);
    errorMsg.value = 'Error: ' + (error.response?.data?.error || error.message || 'Servidor no disponible');
    showSnackbar(errorMsg.value, 'error');
  } finally {
    loading.value = false;
  }
};

const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};

// Función para resetear análisis y permitir nueva imagen
const resetAnalysis = () => {
  analysis.value = null;
  selectedImage.value = null;
  imagePreview.value = null;
  errorMsg.value = null;
  showSnackbar('Limpio – ¡Sube una nueva imagen!', 'info');
  console.log('Análisis reseteado para nueva imagen');
};
</script>

<style scoped>
.v-overlay {
  justify-content: flex-end;
  align-items: flex-start;
}

/* Ajuste adicional para centrado perfecto en el row del título */
:deep(.v-row.align-center) {
  align-items: center !important;
}
</style>
