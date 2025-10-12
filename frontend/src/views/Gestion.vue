<template>
<v-container fluid class="pa-4" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
    <v-row justify="center" align="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="display-2 font-weight-bold white--text mb-4 animate__animated animate__fadeInDown">🐾 Gestión de Mis Mascotas</h1>
        <p class="subtitle-1 white--text mb-4 animate__animated animate__fadeIn">Administra tu familia peluda: agrega, edita, ve y elimina</p>
        <v-btn color="pink" large class="shadow-lg hover-scale mb-4" @click="openAddDialog" elevation="12">
          <v-icon left>mdi-plus</v-icon> Agregar Mascota
        </v-btn>
        <v-btn color="indigo" large class="shadow-lg hover-scale" @click="fetchPets" elevation="12">
          <v-icon left>mdi-refresh</v-icon> Actualizar Lista
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de mascotas en tarjetas -->
    <v-row v-if="pets.length > 0">
      <v-col
        v-for="pet in pets"
        :key="pet._id"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <v-card
          class="mx-auto my-4 pa-4 rounded-xl shadow-lg transform hover-elevate animate__animated animate__zoomIn pet-card"
          style="background: linear-gradient(135deg, #667eea, #764ba2); transition: all 0.3s ease;"
        >
          <v-img
            :src="pet.photo ? `${API_URL}${pet.photo}` : placeholderImage"
            height="200"
            class="mb-4 rounded-lg"
            @error="handleImgError"
          ></v-img>
          <h3 class="text-h6 font-weight-bold mb-2 white--text">{{ pet.name }}</h3>
          <p class="mb-2 white--text"><strong>Especie:</strong> {{ pet.species }}</p>
          <p class="mb-2 white--text"><strong>Edad:</strong> {{ pet.age }}</p>
          <p class="mb-2 white--text"><strong>Ubicación:</strong> {{ pet.location }}</p>
          <p class="mb-2 white--text"><strong>Descripción:</strong> {{ pet.description }}</p>
          <div class="d-flex justify-space-around mt-4">
            <v-btn small color="indigo" @click="openEditDialog(pet)" class="hover-scale white--text">
              <v-icon left>mdi-pencil</v-icon> Editar
            </v-btn>
            <v-btn small color="red" @click="openDeleteDialog(pet)" class="hover-scale white--text">
              <v-icon left>mdi-delete</v-icon> Eliminar
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mensaje si no hay mascotas -->
    <v-row v-else justify="center" class="mb-8">
      <v-col cols="12" class="text-center">
        <h2 class="white--text">No hay mascotas registradas aún 😺</h2>
        <p class="white--text">¡Agrega tu primera mascota para empezar!</p>
      </v-col>
    </v-row>

    <!-- Diálogo para agregar/editar mascota -->
    <v-dialog v-model="crudDialog" max-width="600" persistent>
      <v-card class="rounded-xl crud-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <v-card-title class="white--text justify-center">
          <v-icon left color="white" size="32">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Editar' : 'Agregar' }} Mascota
        </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="crudForm" v-model="validForm" lazy-validation>
            <v-text-field
              v-model="formData.name"
              label="Nombre de la mascota *"
              outlined
              dense
              :rules="[v => !!v || 'Nombre requerido']"
              prepend-inner-icon="mdi-account"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="formData.species"
              :items="speciesOptions"
              label="Especie *"
              outlined
              dense
              :rules="[v => !!v || 'Especie requerida']"
              prepend-inner-icon="mdi-dog"
              class="mb-4"
            ></v-select>

            <v-select
              v-model="formData.age"
              :items="ageOptions"
              label="Edad *"
              outlined
              dense
              :rules="[v => !!v || 'Edad requerida']"
              prepend-inner-icon="mdi-cake"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model="formData.location"
              label="Ubicación (ej: Casa, Calle) *"
              outlined
              dense
              :rules="[v => !!v || 'Ubicación requerida']"
              prepend-inner-icon="mdi-map-marker"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Descripción *"
              outlined
              dense
              rows="3"
              :rules="[v => !!v || 'Descripción requerida', v => v.length >= 10 || 'Mínimo 10 caracteres']"
              prepend-inner-icon="mdi-text"
              class="mb-4"
            ></v-textarea>

            <v-file-input
              v-model="formData.photoFile"
              label="Foto (opcional)"
              outlined
              dense
              accept="image/*"
              prepend-inner-icon="mdi-camera"
              class="mb-4"
              :rules="[v => !v || v.size < 2000000 || 'Imagen debe ser menor a 2MB']"
            ></v-file-input>

            <!-- Mostrar foto actual si editando -->
            <v-img
              v-if="isEditing && selectedPet && selectedPet.photo"
              :src="`${API_URL}${selectedPet.photo}`"
              height="150"
              class="mb-4 rounded-lg"
              @error="handleImgError"
            ></v-img>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 justify-space-between">
          <v-btn color="grey" text @click="closeCrudDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="pink"
            :disabled="!validForm"
            @click="submitCrud"
            class="hover-scale white--text"
          >
            <v-icon left>mdi-check</v-icon>
            {{ isEditing ? 'Actualizar' : 'Agregar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="500" persistent>
      <v-card class="rounded-xl delete-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        <v-card-title class="white--text justify-center">
          <v-icon left color="white" size="32">mdi-alert</v-icon>
          ¿Eliminar {{ selectedPet ? selectedPet.name : '' }}?
        </v-card-title>

        <v-card-text class="pa-4 white--text">
          Esta acción es irreversible. ¿Estás seguro?
        </v-card-text>

        <v-card-actions class="pa-4 justify-space-between">
          <v-btn color="grey" text @click="closeDeleteDialog">
            Cancelar
          </v-btn>
          <v-btn color="red" @click="confirmDelete" class="white--text">
            <v-icon left>mdi-delete</v-icon>
            Eliminar
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
import { ref } from 'vue';
import axios from 'axios';
import api from '@/api';

//const API_URL = 'http://localhost:5000'; // URL backend
const API_URL = `http://${window.location.hostname}:5000`;

const pets = ref([]);
const snackbar = ref({ show: false, message: '', color: 'info' });

const crudDialog = ref(false);
const isEditing = ref(false);
const selectedPet = ref(null);
const validForm = ref(false);
const crudForm = ref(null);
const formData = ref({
  name: '',
  species: '',
  age: '',
  location: '',
  description: '',
  photoFile: null
});

const deleteDialog = ref(false);

const speciesOptions = ['dog', 'cat', 'otro'];
const ageOptions = ['cachorro', 'joven', 'adulto', 'senior'];
const placeholderImage = '/placeholder-pet.jpg';

const fetchPets = async () => {
  try {
    const res = await api.get(`/pets`);
    pets.value = res.data;
  } catch (err) {
    console.error(err);
    showSnackbar(err.response?.data?.error || 'Error cargando mascotas', 'error');
  }
};

const handleImgError = (event) => {
  event.target.src = placeholderImage;
};

const openAddDialog = () => {
  isEditing.value = false;
  selectedPet.value = null;
  formData.value = { name: '', species: '', age: '', location: '', description: '', photoFile: null };
  crudDialog.value = true;
  if (crudForm.value) crudForm.value.resetValidation();
};

const openEditDialog = (pet) => {
  isEditing.value = true;
  selectedPet.value = pet;
  formData.value = {
    name: pet.name,
    species: pet.species,
    age: pet.age,
    location: pet.location,
    description: pet.description,
    photoFile: null
  };
  crudDialog.value = true;
  if (crudForm.value) crudForm.value.resetValidation();
};

const submitCrud = async () => {
  if (!validForm.value || !crudForm.value.validate()) {
    showSnackbar('Por favor completa los campos requeridos', 'warning');
    return;
  }

  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.value.name);
  formDataToSend.append('species', formData.value.species);
  formDataToSend.append('age', formData.value.age);
  formDataToSend.append('location', formData.value.location);
  formDataToSend.append('description', formData.value.description);
  if (formData.value.photoFile) formDataToSend.append('photo', formData.value.photoFile);

  try {
    let res;
    if (isEditing.value) {
      res = await api.put(`/pets/${selectedPet.value._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar(`¡${formData.value.name} actualizada con éxito!`, 'success');
    } else {
      res = await axios.post(`/pets`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar(`¡${formData.value.name} agregada con éxito!`, 'success');
    }

    closeCrudDialog();
    fetchPets();
  } catch (err) {
    console.error(err);
    const errorMsg = err.response?.data?.error || err.message || 'Error en la operación';
    showSnackbar(errorMsg, 'error');
  }
};

const closeCrudDialog = () => {
  crudDialog.value = false;
  selectedPet.value = null;
  formData.value = { name: '', species: '', age: '', location: '', description: '', photoFile: null };
  if (crudForm.value) crudForm.value.resetValidation();
};

const openDeleteDialog = (pet) => {
  selectedPet.value = pet;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/pets/${selectedPet.value._id}`);
    showSnackbar(`${selectedPet.value.name} eliminada con éxito`, 'success');
    closeDeleteDialog();
    fetchPets();
  } catch (err) {
    console.error(err);
    const errorMsg = err.response?.data?.error || err.message || 'Error eliminando mascota';
    showSnackbar(errorMsg, 'error');
  }
};

const closeDeleteDialog = () => {
  deleteDialog.value = false;
  selectedPet.value = null;
};

const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};

// Carga inicial
fetchPets();
</script>

<style scoped>
.hover-scale { transition: transform 0.2s ease; }
.hover-scale:hover { transform: scale(1.05); }
.transform { transition: all 0.3s ease; }
.hover-elevate:hover { transform: translateY(-5px); }

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

/* Forzar color blanco en el formulario de agregar/editar */
.crud-card {
  color: white !important;
}
.crud-card .v-label {
  color: white !important;
}
.crud-card input,
.crud-card textarea,
.crud-card select {
  color: white !important;
}
.crud-card input::placeholder,
.crud-card textarea::placeholder {
  color: white !important;
  opacity: 0.7;
}
.crud-card .v-select__selection,
.crud-card .v-select__selection--placeholder {
  color: white !important;
}
.crud-card .v-file-input__text,
.crud-card .v-file-input label {
  color: white !important;
}
.crud-card .v-input__slot {
  color: white !important;
}
.crud-card .v-messages {
  color: rgba(255, 255, 255, 0.7) !important; /* Para mensajes de error/validación */
}

/* Forzar color blanco en el diálogo de eliminar (por consistencia) */
.delete-card {
  color: white !important;
}
.delete-card .v-card-text {
  color: white !important;
}
</style>
