<template>
  <v-container>
    <v-card class="pa-4" elevation="2">
      <v-card-title>Agregar Nueva Mascota</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitPet">
          <v-text-field v-model="form.name" label="Nombre" required />
          <v-select v-model="form.species" :items="['perro', 'gato', 'otro']" label="Especie" required />
          <v-text-field v-model="form.location" label="Ubicación" required />
          <v-textarea v-model="form.description" label="Descripción" required />
          <v-file-input
            v-model="form.photo"
            label="Foto (opcional)"
            accept="image/*"
            prepend-icon="mdi-camera"
          ></v-file-input>
          <v-btn type="submit" color="primary" :loading="loading">Agregar Mascota</v-btn>
          <v-btn to="/catalog" color="secondary" class="ml-2">Cancelar</v-btn>
        </v-form>
      </v-card-text>
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({
  name: '',
  species: '',
  location: '',
  description: '',
  photo: null
});
const loading = ref(false);
const snackbar = ref({ show: false, message: '', color: 'info' });

const submitPet = async () => {
  if (!form.value.name || !form.value.species || !form.value.location || !form.value.description) {
    showSnackbar('Completa todos los campos requeridos', 'error');
    return;
  }

  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('species', form.value.species);
    formData.append('location', form.value.location);
    formData.append('description', form.value.description);
    if (form.value.photo) {
      formData.append('photo', form.value.photo);
    }

    const res = await axios.post('/pets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    showSnackbar(`Mascota "${res.data.name}" agregada con éxito! Tags: ${res.data.tags.join(', ')}`, 'success');
    form.value = { name: '', species: '', location: '', description: '', photo: null };  // Limpia form
    router.push('/catalog');  // Redirige a catálogo
  } catch (err) {
    showSnackbar(err.response?.data?.error || 'Error agregando mascota', 'error');
  } finally {
    loading.value = false;
  }
};

const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};
</script>

<style scoped>
/* Estilos opcionales */
.v-file-input {
  max-width: 400px;
}
</style>
