<template>
  <v-container fluid class="py-6" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
    <!-- Banner -->
    <v-sheet class="text-center pa-6 mb-6 rounded-lg" color="primary" dark elevation="4">
      <h2 class="text-h4 font-weight-bold mb-2">🐾 Perfil de {{ user.username || 'Usuario' }}</h2>
      <p class="text-subtitle-1">Explora tu información, estadísticas y mascotas</p>
    </v-sheet>

    <!-- Transición solo para perfil/loading -->
    <v-slide-y-transition mode="out-in">
      <v-card class="pa-4" elevation="6" v-if="!loading" key="profile-card">
        <v-row>
          <!-- Avatar -->
          <v-col cols="12" md="4" class="text-center">
            <v-avatar size="120" class="elevation-4 mb-3">
              <v-img :src="user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" alt="avatar" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-1">{{ user.username || 'Sin nombre' }}</h3>
            <p class="text-caption">{{ user.email }}</p>
            <v-chip class="ma-1" color="secondary" small>Miembro desde: {{ formatDate(user.joinedAt) }}</v-chip>
            <v-chip class="ma-1" color="purple" small>{{ user.role || 'Usuario' }}</v-chip>
            <!-- Botón editar (abre modal) -->
            <v-btn color="secondary" class="mt-3" size="small" prepend-icon="mdi-pencil" @click="showEditDialog = true">
              Editar Perfil
            </v-btn>
          </v-col>
          <!-- Info general -->
          <v-col cols="12" md="8">
            <v-row>
              <!-- Nivel y Puntos (Adopciones *20 + Shares *50 – Reactivo Total) -->
              <v-col cols="12" sm="6">
                <v-card color="success" dark class="pa-4 transition-smooth">
                  <v-card-title class="text-h6">Nivel</v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center justify-center flex-column">
                      <v-progress-circular
                        :model-value="progressToNextLevel"
                        :size="100"
                        :width="12"
                        color="white"
                      >
                        <span class="text-h6 font-weight-bold">Lvl {{ level }}</span>
                      </v-progress-circular>
                      <!-- Opcional: Muestra el % numérico -->
                      <p class="mt-1 text-caption white--text">{{ progressToNextLevel }}% al siguiente nivel</p>
<p class="mt-2 white--text">Puntos: {{ currentPoints }}</p>                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Logros (Basados en Total Points – Automáticos) -->
              <v-col cols="12" sm="6">
                <v-card color="info" dark class="pa-4 transition-smooth">
                  <v-card-title class="text-h6">Logros</v-card-title>
                  <v-card-text>
                    <div class="d-flex flex-wrap justify-center">
                      <v-tooltip
                        v-for="(badge, i) in currentAchievements"
                        :key="i"
                        location="bottom"
                        :text="badge"
                      >
                        <template v-slot:activator="{ props }">
                          <v-avatar
                            v-bind="props"
                            size="40"
                            class="ma-1 animate-pop"
                          >
                            <v-img :src="getBadgeIcon(badge)" :alt="badge" />
                          </v-avatar>
                        </template>
                      </v-tooltip>
                    </div>
                    <p v-if="currentAchievements.length === 0" class="text-caption mt-2">
                      Aún no tienes logros, participa más en la comunidad ✨
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Biografía -->
        <h4 class="text-h6 mb-3">📝 Biografía</h4>
        <v-card class="pa-3 mb-4" outlined>
          <p>{{ user.bio || 'Aún no has escrito tu biografía.' }}</p>
        </v-card>

        <!-- Intereses -->
        <h4 class="text-h6 mb-3">💡 Intereses</h4>
        <div class="mb-4">
          <v-chip
            v-for="(interest, i) in user.interests || []"
            :key="i"
            class="ma-1"
            color="deep-purple lighten-3"
          >
            {{ interest }}
          </v-chip>
          <p v-if="!(user.interests || []).length" class="text-caption">Agrega intereses a tu perfil</p>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Mascotas Adoptadas -->
        <h4 class="text-h6 mb-3">🐶 Mis Mascotas Adoptadas</h4>
        <v-row>
          <v-col v-for="(pet, i) in adoptedPets" :key="i" cols="12" sm="6" md="4">
            <v-card class="pa-2" outlined>
              <v-img :src="pet.photo || 'https://placedog.net/300/200'" height="140" class="rounded mb-2"></v-img>
              <h5 class="text-subtitle-2">{{ pet.name }}</h5>
              <p class="text-caption">{{ pet.species }} - {{ pet.age || 'N/A' }}</p>
            </v-card>
          </v-col>
        </v-row>
        <p v-if="adoptedPets.length === 0" class="text-caption">Aún no has adoptado mascotas</p>

        <v-divider class="my-4"></v-divider>

        <!-- Estadísticas (NUEVO: + Comparticiones) + Recargar -->
        <h4 class="text-h6 mb-3 text-center">📊 Estadísticas</h4>

        <v-row justify="center" align="center" class="text-center">
          <v-col cols="12" sm="3">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">🐾 Mascotas adoptadas</h5>
              <p class="text-h5 font-weight-bold">{{ stats.adoptedPets }}</p>
            </v-card>
          </v-col>

          <v-col cols="12" sm="3">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">✅ Adopciones completadas</h5>
              <p class="text-h5 font-weight-bold">{{ stats.completedAdoptions }}</p>
            </v-card>
          </v-col>

          <v-col cols="12" sm="2">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">🔗 Comparticiones</h5>
              <p class="text-h5 font-weight-bold">{{ sharesCount }}</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Botón Recargar (Actualiza shares/adopciones → Puntos Total Auto) -->
        <v-row justify="center" class="mt-4">
          <v-col cols="auto">
            <v-btn color="primary" @click="refetchProfile" :loading="refetching" prepend-icon="mdi-refresh">
              Recargar Perfil
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Acciones -->
        <div class="d-flex flex-wrap gap-3 justify-center">
          <v-btn color="purple" prepend-icon="mdi-key" elevation="4" @click="showPasswordDialog = true">
            Cambiar Contraseña
          </v-btn>
          <v-btn @click="logout" color="error" prepend-icon="mdi-logout" elevation="4">
            Cerrar Sesión
          </v-btn>
        </div>
      </v-card>

      <!-- Loading -->
      <v-card v-else key="loading-card" class="pa-6 text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-3">Cargando perfil...</p>
      </v-card>
    </v-slide-y-transition>

    <!-- Error Alert -->
    <v-alert v-if="error" type="error" class="mt-4" dismissible @click="error = ''">
      {{ error }}
    </v-alert>

    <!-- Modal Editar Perfil -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>Editar Perfil</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.username"
            label="Nombre de Usuario"
            :rules="[v => !!v || 'El nombre es requerido', v => v.length >= 3 || 'Mínimo 3 caracteres']"
          />
          <v-select
            v-model="editForm.selectedAvatar"
            label="Foto de Perfil (elige un avatar de animal)"
            :items="availableAvatars"
            item-title="name"
            item-value="url"
            prepend-icon="mdi-camera"
            hint="Selecciona un avatar temático de animales para tu perfil."
            persistent-hint
          >
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-avatar size="32" class="mr-3">
                    <v-img :src="item.raw.url" alt="Avatar preview" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              </v-list-item>
            </template>
            <template v-slot:selection="{ item }">
              <v-avatar size="24" class="mr-2">
                <v-img :src="item.raw.url" alt="Selected avatar" />
              </v-avatar>
              {{ item.title }}
            </template>
          </v-select>
          <v-text-field v-model="editForm.bio" label="Biografía" />
          <v-combobox
            v-model="editForm.interests"
            label="Intereses"
            multiple
            chips
            closable-chips
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showEditDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveProfile" :loading="saving">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Configuración -->
    <v-dialog v-model="showSettingsDialog" max-width="400">
      <v-card>
        <v-card-title>Configuración</v-card-title>
        <v-card-text>
          <v-switch v-model="settings.notifications" label="Notificaciones por email" />
          <v-switch v-model="settings.darkMode" label="Modo oscuro" />
          <p class="text-caption mt-4">Otras opciones de configuración aquí...</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showSettingsDialog = false">Cerrar</v-btn>
          <v-btn color="primary" @click="saveSettings">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Cambiar Contraseña -->
    <v-dialog v-model="showPasswordDialog" max-width="500">
      <v-card>
        <v-card-title>Cambiar Contraseña</v-card-title>
        <v-card-text>
          <v-text-field v-model="passwordForm.oldPassword" label="Contraseña actual" type="password" />
          <v-text-field v-model="passwordForm.newPassword" label="Nueva contraseña" type="password" />
          <v-text-field v-model="passwordForm.confirmPassword" label="Confirmar nueva contraseña" type="password" />
          <v-alert v-if="passwordError" type="error" class="mt-2">{{ passwordError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showPasswordDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="changePassword" :disabled="!isPasswordValid" :loading="changingPassword">
            Cambiar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import api from '@/api';

const router = useRouter();

const user = ref({});
const loading = ref(true);
const error = ref('');
const adoptedPets = ref([]);
const recentActivities = ref([]);
const stats = ref({ adoptedPets: 0, requestsSent: 0, completedAdoptions: 0 });
const refetching = ref(false);
const sharesCount = ref(0);  // ← NUEVO: Contador de comparticiones (de user.sharesCount)

// Modales
const showEditDialog = ref(false);
const showSettingsDialog = ref(false);
const showPasswordDialog = ref(false);
const saving = ref(false);
const changingPassword = ref(false);
const passwordError = ref('');

// Forms para modales
const editForm = ref({
  username: '',
  selectedAvatar: '',  // URL del avatar seleccionado
  bio: '',
  interests: []
});
const settings = ref({ notifications: true, darkMode: false });
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });

// Array de avatares predefinidos
const availableAvatars = ref([
  { id: 1, url: 'https://placedog.net/500/500?random=1', name: 'Perro Alegre' },
  { id: 2, url: 'https://placedog.net/500/500?random=2', name: 'Perro Juguetón' },
  { id: 3, url: 'https://placedog.net/500/500?random=3', name: 'Perro Travieso' },
  { id: 4, url: 'https://placedog.net/500/500?random=4', name: 'Perro Dormilón' },
  { id: 5, url: 'https://randomfox.ca/images/15.jpg', name: 'Zorro Aventurero' },
  { id: 6, url: 'https://randomfox.ca/images/20.jpg', name: 'Zorro Astuto' },
  { id: 7, url: 'https://placebear.com/500/500', name: 'Oso Curioso' },
  { id: 8, url: 'https://placebear.com/g/500/500', name: 'Oso Dormilón' },
  { id: 9, url: 'https://picsum.photos/500/500?random=11', name: 'Panda Relajado' },
]);

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

// Base URL para API
//const API_BASE = 'http://localhost:5000';
const API_BASE = `http://${window.location.hostname}:5000`;


// ← NUEVO: Puntos Total = Adopciones *20 + Shares *50 (reactivo)
const currentPoints = computed(() => {
  const adoptions = Number(stats.value.completedAdoptions) || 0;
  const shares = Number(sharesCount.value) || 0;  // ← NUEVO: + Shares *50
  return (adoptions * 20) + (shares * 50);  // Ej: 18 adop = 360 + 2 shares = 460 pts
});

// Level y Progress basados en total points (cada 100 = level up)
const level = computed(() => {
  const points = Number(currentPoints.value) || 0;
  return Math.floor(points / 100);  // Empieza en 0: 0-99 = Lvl 0, 100-199 = Lvl 1, etc.
});

const progressToNextLevel = computed(() => {
  const points = Number(currentPoints.value) || 0;
  return points % 100;  // 0-99% al siguiente
});

// Badges automáticos por total level
const currentAchievements = computed(() => {
  const lvl = Number(level.value) || 0;
  const badges = [];
  if (lvl >= 0) badges.push('Adoptador Novato');
  if (lvl >= 1) badges.push('Amigo de los Animales');
  if (lvl >= 2) badges.push('Super Adoptador');
  if (lvl >= 4) badges.push('Voluntario Estelar');
  return badges;
});

// Validar contraseña
const isPasswordValid = computed(() => {
  return passwordForm.value.newPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6;
});

// ← ACTUALIZADO: Fetch perfil (carga sharesCount de user)
const fetchProfile = async () => {
  try {
    loading.value = true;
    error.value = '';
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('No hay usuario logueado');

    // 1. Fetch usuario básico (incluye sharesCount)
    const userRes = await api.get(`${API_BASE}/users/${userId}`);
    user.value = userRes.data;

    // ← NUEVO: Carga sharesCount de user
    sharesCount.value = user.value.sharesCount || 0;
    console.log(`Shares cargados: ${sharesCount.value}`);  // Debug

    // Inicializar editForm
    editForm.value.username = user.value.username || '';
    const currentAvatarMatch = availableAvatars.value.find(avatar => avatar.url === user.value.avatar);
    editForm.value.selectedAvatar = currentAvatarMatch ? currentAvatarMatch.url : '';
    editForm.value.bio = user.value.bio || '';
    editForm.value.interests = user.value.interests || [];

    // 2. Fetch adopciones para stats
    let adoptions = [];
    try {
      const adoptionsRes = await api.get(`${API_BASE}/users/${userId}/adoptions`);
      adoptions = Array.isArray(adoptionsRes.data) ? adoptionsRes.data : [];
    } catch (adoptErr) {
      console.warn('Endpoint /adoptions no disponible, usando fallback:', adoptErr);
      adoptions = Array.isArray(user.value.pets) ? user.value.pets : [];
    }

    const approvedAdoptions = adoptions.filter(adopt => adopt.status === 'approved');
    const approvedCount = Number(approvedAdoptions.length) || 0;

    // Mapear mascotas adoptadas
    adoptedPets.value = approvedAdoptions.map(adopt => ({
      name: adopt.petId?.name || adopt.name || 'Mascota sin nombre',
      species: adopt.petId?.species || adopt.species || 'N/A',
      age: adopt.petId?.age || adopt.age || 'N/A',
      photo: adopt.petId?.photo ? `${API_BASE}${adopt.petId.photo}` : 'https://placedog.net/300/200'
    }));

    // Calcular stats
    stats.value = {
      adoptedPets: approvedCount,
      requestsSent: Number(adoptions.length) || 0,
      completedAdoptions: approvedCount
    };

    // Log debug total points
    console.log(`Debug fetchProfile: ${approvedCount} adopciones → ${sharesCount.value} shares → Total Puntos: ${currentPoints.value} → Nivel: ${level.value} (progreso: ${progressToNextLevel.value}%)`);

    // 3. Fetch actividades (fallback)
    let activities = [];
    try {
      const activitiesRes = await api.get(`${API_BASE}/users/${userId}/activities`);
      activities = Array.isArray(activitiesRes.data) ? activitiesRes.data : [];
    } catch (actErr) {
      console.warn('Endpoint /activities no disponible, derivando de badges:', actErr);
      activities = currentAchievements.value.map(ach => ({
        title: `Lograste insignia: ${ach}`,
        date: new Date()
      }));
      if (currentPoints.value > 0) {
        activities.push({
          title: `Ganaste ${currentPoints.value} puntos (${stats.value.completedAdoptions} adop *20 + ${sharesCount.value} shares *50)`,
          date: new Date()
        });
      }
    }
    recentActivities.value = activities.slice(0, 5);

    // Formatear fecha
    if (user.value.joinedAt) {
      user.value.joinedAt = new Date(user.value.joinedAt).toLocaleDateString('es-ES');
    }

  } catch (err) {
    console.error('Error en fetchProfile:', err);
    error.value = err.response?.data?.error || err.message || 'Error cargando perfil.';
    // Fallback
    user.value = { sharesCount: 0, points: 0, achievements: [], pets: [], activities: [] };
    sharesCount.value = 0;
    stats.value = { adoptedPets: 0, requestsSent: 0, completedAdoptions: 0 };
    adoptedPets.value = [];
    recentActivities.value = [];
    console.log('Fallback: 0 shares, 0 puntos');
  } finally {
    loading.value = false;
  }
};

// Refetch (actualiza shares/adop → total points auto)
const refetchProfile = async () => {
  try {
    refetching.value = true;
    await fetchProfile();
    console.log('Perfil recargado: Total Puntos', currentPoints.value, 'Nivel:', level.value, '(progreso:', progressToNextLevel.value, '%)');
  } catch (err) {
    error.value = 'Error al recargar: ' + err.message;
  } finally {
    refetching.value = false;
  }
};

// Icono de badge
const getBadgeIcon = (achievement) => {
  const badgeMap = {
    'Adoptador Novato': 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
    'Amigo de los Animales': 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    'Super Adoptador': 'https://cdn-icons-png.flaticon.com/512/2272/2272968.png',
    'Voluntario Estelar': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };
  return badgeMap[achievement] || badgeMap.default;
};

// Formatear fecha
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Save Profile (sin cambios)
const saveProfile = async () => {
  try {
    saving.value = true;
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!token || !userId) throw new Error('Faltan credenciales');

    if (!editForm.value.username || editForm.value.username.length < 3) {
      error.value = 'El nombre de usuario debe tener al menos 3 caracteres.';
      return;
    }

    const updateData = {
      username: editForm.value.username,
      avatar: editForm.value.selectedAvatar || user.value.avatar || defaultAvatar,
      bio: editForm.value.bio || '',
      interests: editForm.value.interests || []
    };

    const response = await axios.put(`${API_BASE}/users/${userId}`, updateData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    console.log('📥 Respuesta del backend:', response.data);
    user.value = { ...user.value, ...response.data };
    user.value = { ...user.value };  // Fuerza reactividad

    showEditDialog.value = false;
    console.log('✅ Perfil actualizado');
  } catch (err) {
    console.error('Error guardando perfil:', err);
    error.value = 'Error al guardar perfil: ' + (err.response?.data?.error || err.message);
  } finally {
    saving.value = false;
  }
};

// Save Settings (placeholder)
const saveSettings = () => {
  console.log('Settings guardados:', settings.value);
  showSettingsDialog.value = false;
};

// Change Password (sin cambios – ya funciona)
const changePassword = async () => {
  try {
    changingPassword.value = true;
    passwordError.value = '';

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = 'Las contraseñas no coinciden';
      changingPassword.value = false;
      return;
    }
    if (passwordForm.value.newPassword.length < 6) {
      passwordError.value = 'La nueva contraseña debe tener al menos 6 caracteres';
      changingPassword.value = false;
      return;
    }
    if (!passwordForm.value.oldPassword) {
      passwordError.value = 'Ingresa tu contraseña actual';
      changingPassword.value = false;
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId) {
      passwordError.value = 'No hay usuario logueado';
      changingPassword.value = false;
      return;
    }

    const updateData = {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    };

    console.log('🔄 Enviando cambio de contraseña para userId:', userId);

    const response = await axios.put(`${API_BASE}/users/${userId}/change-password`, updateData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Respuesta backend cambio contraseña:', response.data);

    showPasswordDialog.value = false;
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    passwordError.value = '';
    console.log('🎉 Contraseña cambiada exitosamente');

  } catch (err) {
    console.error('❌ Error cambiando contraseña:', err.response?.status, err.response?.data);

    if (err.response?.status === 400) {
      passwordError.value = err.response.data.error || 'Datos inválidos. Verifica las contraseñas.';
    } else if (err.response?.status === 401) {
      if (err.response.data?.error?.includes('incorrecta') || err.response.data?.error?.includes('oldPassword')) {
        passwordError.value = 'Contraseña actual incorrecta. Verifica e intenta de nuevo.';
      } else {
        passwordError.value = 'No autorizado. Inicia sesión de nuevo.';
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/login');
      }
    } else if (err.response?.status === 404) {
      passwordError.value = 'Ruta no encontrada. Contacta al administrador.';
    } else if (err.response?.status === 500) {
      passwordError.value = 'Error en el servidor. Intenta de nuevo.';
    } else {
      passwordError.value = err.response?.data?.error || err.message || 'Error al cambiar contraseña. Intenta de nuevo.';
    }
  } finally {
    changingPassword.value = false;
  }
};

// Logout (limpia storage + push /login)
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  router.push('/login');
};

// Montar componente
onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.transition-smooth {
  transition: all 0.3s ease;
}
.animate-pop {
  animation: pop 0.3s ease;
}
@keyframes pop {
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.gap-3 {
  gap: 12px;
}
</style>

