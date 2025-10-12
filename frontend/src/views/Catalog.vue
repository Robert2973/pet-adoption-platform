<template>
<v-container fluid class="pa-4" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
    <!-- Encabezado llamativo -->
    <v-row justify="center" align="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="display-2 font-weight-bold white--text mb-4 animate__animated animate__fadeInDown">🐶 Catálogo de Mascotas</h1>
        <p class="subtitle-1 white--text mb-4 animate__animated animate__fadeIn">Encuentra tu mejor amigo con estilo y diversión</p>
        <!-- Solo botón principal de búsqueda -->
        <v-btn color="pink" large class="shadow-lg hover-scale" @click="fetchPets" elevation="12">
          <v-icon left>mdi-magnify</v-icon> Buscar mascotas
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtros centrados -->
    <v-row justify="center" class="mb-8" dense>
      <v-col cols="12" md="3" class="text-center">
        <v-text-field
          v-model="filters.location"
          label="Ubicación"
          outlined
          dense
          clearable
          class="white--text"
          prepend-inner-icon="mdi-map-marker"
          @update:model-value="fetchPets"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3" class="text-center">
        <v-select
          v-model="filters.species"
          :items="speciesOptions"
          label="Especie"
          outlined
          dense
          clearable
          prepend-inner-icon="mdi-dog"
          @update:model-value="fetchPets"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3" class="text-center">
        <v-select
          v-model="filters.age"
          :items="ageOptions"
          label="Edad"
          outlined
          dense
          clearable
          prepend-inner-icon="mdi-cake"
          @update:model-value="fetchPets"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Tarjetas de mascotas -->
    <v-row>
      <v-col
        v-for="pet in pets"
        :key="pet._id"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <v-card
          class="mx-auto my-4 pa-4 rounded-xl shadow-lg transform hover-elevate animate__animated animate__zoomIn white--text pet-card"
          style="background:linear-gradient(135deg, #667eea, #764ba2); transition: all 0.3s ease;  "
        >
          <v-img
            :src="pet.photo ? `${API_BASE}${pet.photo}` : placeholderImage"
            height="200"
            class="mb-4 rounded-lg"
            @error="handleImgError"
          ></v-img>
          <h3 class="text-h6 font-weight-bold mb-2 white--text">{{ pet.name }}</h3>
          <p class="mb-2 white--text"><strong>Especie:</strong> {{ pet.species }}</p>
          <p class="mb-2 white--text"><strong>Ubicación:</strong> {{ pet.location }}</p>
          <p class="mb-2 white--text"><strong>Descripción:</strong> {{ pet.description }}</p>
          <!-- Opcional: Mostrar edad en la tarjeta si está disponible en el modelo -->
          <p v-if="pet.age" class="mb-2 white--text"><strong>Edad:</strong> {{ pet.age }}</p>
          <div class="d-flex justify-space-around mt-4">
            <v-btn small color="pink" @click="requestAdoption(pet)" :disabled="!isLoggedIn" class="hover-scale">
              <v-icon left>mdi-heart</v-icon> Adoptar
            </v-btn>
            <v-btn small color="indigo" @click="sharePet(pet)" class="hover-scale">
              <v-icon left>mdi-share-variant</v-icon> Compartir
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo del formulario de adopción (expandido) -->
    <v-dialog v-model="adoptionDialog" max-width="600" persistent>
      <v-card class="rounded-xl adoption-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <v-card-title class="white--text justify-center">
          <v-icon left color="white" size="32">mdi-heart</v-icon>
          Solicitar Adopción de {{ selectedPet ? selectedPet.name : '' }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="adoptionForm" v-model="validForm" lazy-validation>
            <!-- Mensaje requerido -->
            <v-textarea
              v-model="formData.message"
              label="¿Por qué quieres adoptar a esta mascota? Cuéntanos un poco sobre ti y tu hogar."
              outlined
              dense
              rows="3"
              :rules="[v => !!v || 'El mensaje es requerido', v => v.length >= 10 || 'Mínimo 10 caracteres']"
              prepend-inner-icon="mdi-message-text"
              class="mb-4"
            ></v-textarea>

            <!-- Experiencia con mascotas (requerido) -->
            <v-select
              v-model="formData.experience"
              :items="experienceOptions"
              label="¿Tienes experiencia con mascotas?"
              outlined
              dense
              :rules="[v => !!v || 'Selecciona una opción']"
              prepend-inner-icon="mdi-account-heart"
              class="mb-4"
            ></v-select>

            <!-- Tipo de vivienda (opcional) -->
            <v-select
              v-model="formData.housingType"
              :items="housingOptions"
              label="Tipo de vivienda (opcional)"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-home"
              class="mb-4"
            ></v-select>

            <!-- Otras mascotas (checkbox + textarea condicional) -->
            <v-checkbox
              v-model="formData.hasOtherPets"
              label="¿Tienes otras mascotas en casa?"
              color="pink"
              class="mb-2"
              prepend-icon="mdi-paw"
            ></v-checkbox>
            <v-textarea
              v-if="formData.hasOtherPets"
              v-model="formData.otherPetsDescription"
              label="Describe brevemente tus otras mascotas (opcional)"
              outlined
              dense
              rows="2"
              prepend-inner-icon="mdi-paw-off"
              class="mb-4"
            ></v-textarea>

            <!-- Disponibilidad para cuidados (requerido) -->
            <v-select
              v-model="formData.availability"
              :items="availabilityOptions"
              label="¿Cuánto tiempo puedes dedicar a los cuidados?"
              outlined
              dense
              :rules="[v => !!v || 'Selecciona una opción']"
              prepend-inner-icon="mdi-clock-time-four"
              class="mb-4"
            ></v-select>

            <!-- Compromiso con salud (checkbox opcional) -->
            <v-checkbox
              v-model="formData.healthCommitment"
              label="Estoy dispuesto a vacunar y llevar a chequeos regulares"
              color="pink"
              class="mb-4"
              prepend-icon="mdi-medical-bag"
            ></v-checkbox>

            <!-- Teléfono opcional -->
            <v-text-field
              v-model="formData.phone"
              label="Teléfono de contacto (opcional)"
              outlined
              dense
              prepend-inner-icon="mdi-phone"
              :rules="[v => !v || /^\d{10}$/.test(v) || 'Teléfono inválido (10 dígitos)']"
              class="mb-4"
            ></v-text-field>

            <!-- Email (pre-rellenado si disponible) -->
            <v-text-field
              v-model="formData.email"
              label="Email de contacto"
              outlined
              dense
              prepend-inner-icon="mdi-email"
              :rules="[v => !!v || 'Email requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
              class="mb-4"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 justify-space-between">
          <v-btn color="white" text @click="closeAdoptionDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="pink"
            :disabled="!validForm"
            @click="submitAdoption"
            class="hover-scale white--text"
          >
            <v-icon color="white" left>mdi-send</v-icon>
            Enviar Solicitud
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" top right>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';  // Agregado watch para campos condicionales
//const API_BASE = 'http://localhost:5000';  // ← FIX: Base URL para API (ajusta puerto si diferente)
const API_BASE = `http://${window.location.hostname}:5000`;
import { useRouter } from 'vue-router';
import axios from 'axios';
import api from '@/api';

const router = useRouter();
const pets = ref([]);
const filters = ref({ species: '', location: '', age: '' });
const snackbar = ref({ show: false, message: '', color: 'info' });
const isLoggedIn = ref(!!localStorage.getItem('token'));

// Refs para el formulario de adopción (expandido)
const adoptionDialog = ref(false);
const selectedPet = ref(null);
const validForm = ref(false);
const adoptionForm = ref(null);
const formData = ref({
  message: '',
  experience: '',  // Nuevo
  housingType: '',  // Nuevo
  hasOtherPets: false,  // Nuevo
  otherPetsDescription: '',  // Nuevo
  availability: '',  // Nuevo
  healthCommitment: false,  // Nuevo
  phone: '',
  email: ''
});

const speciesOptions = ['dog', 'cat', 'otro'];
const ageOptions = ['cachorro', 'joven', 'adulto', 'senior'];
const placeholderImage = '/placeholder-pet.jpg';

// Opciones para los nuevos selects
const experienceOptions = [
  'Ninguna experiencia',
  'Experiencia con perros',
  'Experiencia con gatos',
  'Experiencia con ambas'
];

const housingOptions = [
  'Casa con jardín',
  'Casa sin jardín',
  'Departamento'
];

const availabilityOptions = [
  'Tiempo completo (diario)',
  'Medio tiempo (varias horas al día)',
  'Fines de semana principalmente'
];
// Pre-rellenar email si el usuario está logueado
if (isLoggedIn.value) {
  try {
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    formData.value.email = payload.email || '';
  } catch (err) {
    console.warn('No se pudo decodificar el token para email');
  }
}

const fetchPets = async () => {
  try {
    const paramsObj = {};
    for (const key in filters.value) {
      const val = filters.value[key];
      if (val) paramsObj[key] = val;
    }
    const params = new URLSearchParams(paramsObj).toString();
    const res = await api.get(`/pets?${params}`);
    pets.value = res.data;
  } catch (err) {
    showSnackbar('Error cargando mascotas', 'error');
  }
};

const handleImgError = (event) => {
  event.target.src = placeholderImage;
};

// Watch para resetear descripción de otras mascotas si cambia el checkbox
watch(() => formData.value.hasOtherPets, (newVal) => {
  if (!newVal) {
    formData.value.otherPetsDescription = '';
  }
});

// Modificada: Abre el diálogo y resetea nuevos campos
const requestAdoption = (pet) => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }
  selectedPet.value = pet;
  adoptionDialog.value = true;
  // Reset form pero mantén email
  formData.value.message = '';
  formData.value.experience = '';
  formData.value.housingType = '';
  formData.value.hasOtherPets = false;
  formData.value.otherPetsDescription = '';
  formData.value.availability = '';
  formData.value.healthCommitment = false;
  formData.value.phone = '';
  // Email ya pre-rellenado
};

// Submit del formulario (expandido con nuevos campos)
const submitAdoption = async () => {
  if (!validForm.value || !adoptionForm.value.validate()) {
    showSnackbar('Por favor, completa los campos requeridos correctamente', 'warning');
    return;
  }

  try {
    const adoptionData = {
      petId: selectedPet.value._id,
      message: formData.value.message,
      experience: formData.value.experience,  // Nuevo
      housingType: formData.value.housingType || undefined,  // Nuevo, opcional
      hasOtherPets: formData.value.hasOtherPets,  // Nuevo
      otherPetsDescription: formData.value.otherPetsDescription || undefined,  // Nuevo, opcional
      availability: formData.value.availability,  // Nuevo
      healthCommitment: formData.value.healthCommitment,  // Nuevo
      phone: formData.value.phone || undefined,
      email: formData.value.email
    };

    await axios.post('/adoptions', adoptionData);
    showSnackbar(`¡Solicitud enviada para ${selectedPet.value.name}! Espera aprobación.`, 'success');
    closeAdoptionDialog();
  } catch (err) {
    showSnackbar(err.response?.data?.error || 'Error en la solicitud de adopción', 'error');
  }
};

// Cerrar diálogo y reset form (expandido)
const closeAdoptionDialog = () => {
  adoptionDialog.value = false;
  selectedPet.value = null;
  formData.value = {
    message: '',
    experience: '',
    housingType: '',
    hasOtherPets: false,
    otherPetsDescription: '',
    availability: '',
    healthCommitment: false,
    phone: '',
    email: formData.value.email  // Mantén email
  };
  if (adoptionForm.value) adoptionForm.value.resetValidation();
};

// Función para compartir mascota (+50 puntos via API)
const sharePet = async (pet) => {
  if (!isLoggedIn.value) {
    router.push('/login');
    return;
  }

  try {
    let shared = false;
    if (navigator.share) {
      await navigator.share({ title: pet.name, url: window.location.href });
      shared = true;
    } else {
      await navigator.clipboard.writeText(`${pet.name}: ${window.location.origin}/catalog`);
      shared = true;
      showSnackbar('Link copiado al clipboard!', 'info');
    }

    if (shared) {
      // ← NUEVO: Llama API para registrar share (+50 pts en backend)
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/users/${userId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }  // Si auth en ruta
      });

      console.log('✅ Share registrado:', response.data.message);
      showSnackbar('¡Compartido! +50 puntos ganados 🐕', 'success');
    }
  } catch (err) {
    console.error('Error en share:', err);
    if (err.response?.status !== 200) {  // Si API falla
      showSnackbar('Error registrando share (sin puntos)', 'error');
    }
  }
};





const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};

const resetFilters = () => {
  filters.value = { species: '', location: '', age: '' };
  fetchPets();
};

// Cargar mascotas iniciales
fetchPets();
</script>

<style scoped>
/* Efecto hover en botones y tarjetas */
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Forzar color blanco en textos de las tarjetas de mascotas */
.pet-card {
  color: white !important;
}
.pet-card h3,
.pet-card p,
.pet-card strong {
  color: white !important;
}
.pet-card .text-h6 {
  color: white !important;
}

/* Forzar color blanco en el formulario de adopción */
.adoption-card {
  color: white !important;
}
.adoption-card .v-label {
  color: white !important;
}
.adoption-card input,
.adoption-card textarea,
.adoption-card select {
  color: white !important;
}
.adoption-card input::placeholder,
.adoption-card textarea::placeholder {
  color: white !important;
  opacity: 0.7;
}
.adoption-card .v-select__selection,
.adoption-card .v-select__selection--placeholder {
  color: white !important;
}
.adoption-card .v-input--checkbox label,
.adoption-card .v-input--checkbox .v-label {
  color: white !important;
}
.adoption-card .v-input__slot {
  color: white !important;
}
.adoption-card .v-messages {
  color: rgba(255, 255, 255, 0.7) !important; /* Para mensajes de error/validación, semi-transparente */
}
</style>
