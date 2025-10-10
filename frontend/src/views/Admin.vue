<template>
<v-container fluid class="pa-4" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
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
                <v-icon left>mdi-refresh</v-icon> Recargar
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
                        <v-icon small class="mr-2 white--text">mdi-account</v-icon>
                        <span class="font-weight-bold white--text">Usuario:</span>
                        <span class="white--text">{{ adopt.userId?.email || 'Desconocido' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-dog</v-icon>
                        <span class="font-weight-bold white--text">Mascota:</span>
                        <span class="white--text">{{ adopt.petId?.name || 'Desconocida' }} ({{ adopt.petId?.species || 'N/A' }})</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-message-text</v-icon>
                        <span class="font-weight-bold white--text">Mensaje:</span>
                        <span class="white--text">{{ adopt.message || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-star</v-icon>
                        <span class="font-weight-bold white--text">Experiencia:</span>
                        <span class="white--text">{{ adopt.experience || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-home</v-icon>
                        <span class="font-weight-bold white--text">Tipo de vivienda:</span>
                        <span class="white--text">{{ adopt.housingType || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-paw</v-icon>
                        <span class="font-weight-bold white--text">Otra mascota:</span>
                        <span class="white--text">{{ adopt.hasOtherPets ? 'Sí' : 'No' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-calendar-clock</v-icon>
                        <span class="font-weight-bold white--text">Disponibilidad:</span>
                        <span class="white--text">{{ adopt.availability || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-heart-pulse</v-icon>
                        <span class="font-weight-bold white--text">Compromiso con salud:</span>
                        <span class="white--text">{{ adopt.healthCommitment ? 'Sí' : 'No' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-phone</v-icon>
                        <span class="font-weight-bold white--text">Contacto:</span>
                        <span class="white--text">{{ adopt.phone || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2 white--text">mdi-email</v-icon>
                        <span class="font-weight-bold white--text">Email:</span>
                        <span class="white--text">{{ adopt.email || 'N/A' }}</span>
                      </div>
                    </v-col>

                    <!-- Acciones -->
                    <v-col cols="12" md="4" class="d-flex flex-column align-center justify-center">
                      <v-chip :color="getStatusColor(adopt.status)" class="mb-3" dark>
                        {{ adopt.status?.charAt(0).toUpperCase() + adopt.status?.slice(1) || 'N/A' }}
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

// Función para traer las solicitudes
const fetchAdoptions = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token no encontrado')

    const res = await axios.get('http://localhost:5000/admin/adoptions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    adoptions.value = res.data
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.error || err.message || 'Error cargando solicitudes.'
  } finally {
    loading.value = false
  }
}

// Funciones para aprobar y rechazar
const approveAdoption = async (id) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://localhost:5000/adoptions/${id}`, { status: 'approved' }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar('¡Adopción aprobada!', 'success')
    fetchAdoptions()
  } catch (err) {
    console.error(err)
    showSnackbar('Error al aprobar', 'error')
  }
}

const rejectAdoption = async (id) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(`http://localhost:5000/adoptions/${id}`, { status: 'rejected' }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar('¡Adopción rechazada!', 'warning')
    fetchAdoptions()
  } catch (err) {
    console.error(err)
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
  color: white;  /* Asegura que todos los textos sean blancos por defecto */
}
</style>
