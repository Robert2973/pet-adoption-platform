<template>
  <v-container fluid class="pa-6"style="background: linear-gradient(135deg, #f9d423 0%, #ff4e50 100); min-height: 100vh;">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-4 custom-card elevation-8">
          <!-- Encabezado y botón -->
          <v-row align="center" justify="space-between" class="mb-4">
            <v-col>
              <h2 class="title-header white--text mb-0">Panel de Administración - Solicitudes de Adopción</h2>
            </v-col>
            <v-col cols="auto">
              <v-btn color="deep-purple accent-4" dark large @click="fetchAdoptions" class="hover-scale">
                <v-icon left>mdi-refresh</v-icon> Recarregar
              </v-btn>
            </v-col>
          </v-row>

          <!-- Separador -->
          <v-divider class="mb-4"></v-divider>

          <!-- Estado de carga o error -->
          <v-row v-if="loading" justify="center" class="py-8">
            <v-progress-circular indeterminate size="50" color="white"></v-progress-circular>
          </v-row>

          <v-row v-else-if="error" class="py-8 px-4">
            <v-alert type="error" prominent border="left" colored-border class="w-100">
              {{ error }}
              <template #actions>
                <v-btn color="error" text small @click="fetchAdoptions">
                  Reintentar
                </v-btn>
              </template>
            </v-alert>
          </v-row>

          <!-- Lista de solicitudes -->
          <v-row v-else>
            <v-col v-if="adoptions.length === 0" class="text-center py-12">
              <v-icon size="64" color="white">mdi-folder-open</v-icon>
              <div class="mt-4 white--text font-weight-medium text-h6">No hay solicitudes de adopción</div>
            </v-col>

            <v-col v-for="adopt in adoptions" :key="adopt._id" class="mb-4">
              <v-hover v-slot:default="{ isHovering }">
                <v-card :elevation="isHovering ? 12 : 4" class="pa-4 custom-request-card transition-ease" hover>
                  <v-row>
                    <v-col cols="12" md="8">
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-account</v-icon>
                        <span class="font-weight-bold">Usuario:</span>
                        {{ adopt.userId.email }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-dog</v-icon>
                        <span class="font-weight-bold">Mascota:</span>
                        {{ adopt.petId.name }} ({{ adopt.petId.species }})
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-message-text</v-icon>
                        <span class="font-weight-bold">Mensaje:</span> {{ adopt.message || 'N/A' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-star</v-icon>
                        <span class="font-weight-bold">Experiencia:</span> {{ adopt.experience || 'N/A' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-home</v-icon>
                        <span class="font-weight-bold">Tipo de vivienda:</span> {{ adopt.housingType || 'N/A' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-paw</v-icon>
                        <span class="font-weight-bold">Otra mascota:</span> {{ adopt.hasOtherPets ? 'Sí' : 'No' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-calendar-clock</v-icon>
                        <span class="font-weight-bold">Disponibilidad:</span> {{ adopt.availability || 'N/A' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-heart-pulse</v-icon>
                        <span class="font-weight-bold">Compromiso con salud:</span> {{ adopt.healthCommitment ? 'Sí' : 'No' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-phone</v-icon>
                        <span class="font-weight-bold">Contacto:</span> {{ adopt.phone || 'N/A' }}
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-email</v-icon>
                        <span class="font-weight-bold">Email:</span> {{ adopt.email || 'N/A' }}
                      </div>
                    </v-col>

                    <!-- Acciones -->
                    <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
                      <v-chip :color="getStatusColor(adopt.status)" class="mb-3" dark>
                        {{ adopt.status | capitalize }}
                      </v-chip>
                      <div v-if="adopt.status === 'pending'">
                        <v-btn large block color="green darken-2" class="mb-2" @click="approveAdoption(adopt._id)">
                          <v-icon left>mdi-check</v-icon> Aprobar
                        </v-btn>
                        <v-btn large block color="red darken-2" @click="rejectAdoption(adopt._id)">
                          <v-icon left>mdi-close</v-icon> Rechazar
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>




    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right timeout="3000" multi-line>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Variables reactivas
const router = useRouter()
const adoptions = ref([])
const loading = ref(false)
const error = ref('')
const snackbar = ref({ show: false, message: '', color: '' })

// Encabezados de la tabla (aunque en este diseño personalizado no los usaremos en la vista)
const headers = [
  { text: 'Usuario', value: 'user' },
  { text: 'Mascota', value: 'pet' },
  { text: 'Mensaje', value: 'message' },
  { text: 'Fecha', value: 'createdAt' },
  { text: 'Acciones', value: 'actions', sortable: false }
]



// Función para traer las solicitudes
const fetchAdoptions = async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await axios.get('/admin/adoptions')
    adoptions.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Error cargando solicitudes. ¿Eres admin?'
  } finally {
    loading.value = false
  }
}

// Funciones para aprobar y rechazar
const approveAdoption = async (id) => {
  try {
    await axios.put(`/adoptions/${id}`, { status: 'approved' })
    showSnackbar('¡Adopción aprobada!', 'success')
    fetchAdoptions()
  } catch {
    showSnackbar('Error al aprobar', 'error')
  }
}

const rejectAdoption = async (id) => {
  try {
    await axios.put(`/adoptions/${id}`, { status: 'rejected' })
    showSnackbar('¡Adopción rechazada!', 'warning')
    fetchAdoptions()
  } catch {
    showSnackbar('Error al rechazar', 'error')
  }
}

// Función para el color del estado
const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'green darken-2'
    case 'rejected':
      return 'red darken-2'
    default:
      return 'orange darken-2'
  }
}

// Función para mostrar notificación
const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color }
}

// Verificación de usuario admin
onMounted(() => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.push('/login')
  } else {
    fetchAdoptions()
  }
})
</script>

<style scoped>
/* Fondo de la página con gradiente vibrante y fondo oscuro en la tarjeta */
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.custom-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  color: #fff;
  padding: 24px;
  max-width: 100%;
}
.title-header {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
}
.hover-scale {
  transition: transform 0.2s ease-in-out;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.transition-ease {
  transition: all 0.3s ease-in-out;
}
.custom-request-card {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
