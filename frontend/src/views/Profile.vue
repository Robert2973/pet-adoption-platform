<template>
<v-container fluid class="py-6" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
    <!-- Banner -->
    <v-sheet
      class="text-center pa-6 mb-6 rounded-lg"
      color="primary"
      dark
      elevation="4"
    >
      <h2 class="text-h4 font-weight-bold mb-2">🐾 Perfil de {{ user.username || 'Usuario' }}</h2>
      <p class="text-subtitle-1">Explora tu información, estadísticas y mascotas</p>
    </v-sheet>

    <v-slide-y-transition mode="out-in">
      <v-card class="pa-4" elevation="6" v-if="!loading" key="profile-card">
        <v-row>
          <!-- Avatar -->
          <v-col cols="12" md="4" class="text-center">
            <v-avatar size="120" class="elevation-4 mb-3">
              <v-img
                :src="user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
                alt="avatar"
              />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-1">{{ user.username || 'Sin nombre' }}</h3>
            <p class="text-caption">{{ user.email }}</p>
            <v-chip class="ma-1" color="secondary" small>Miembro desde: {{ user.joinedAt }}</v-chip>
            <v-chip class="ma-1" color="purple" small>{{ user.role }}</v-chip>
            <v-btn color="secondary" class="mt-3" size="small" prepend-icon="mdi-pencil">
              Editar Perfil
            </v-btn>
          </v-col>
          <!-- Info general -->
          <v-col cols="12" md="8">
            <v-row>
              <!-- Nivel -->
              <v-col cols="12" sm="6">
                <v-card color="success" dark class="pa-4 transition-smooth">
                  <v-card-title class="text-h6">Nivel</v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center justify-center flex-column">
                      <v-progress-circular
                        :model-value="user.points % 100"
                        :size="100"
                        :width="12"
                        color="white"
                      >
                        <span class="text-h6 font-weight-bold">Lvl {{ Math.floor(user.points/100) + 1 }}</span>
                      </v-progress-circular>
                      <p class="mt-2">Puntos: {{ user.points }}</p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Logros -->
              <v-col cols="12" sm="6">
                <v-card color="info" dark class="pa-4 transition-smooth">
                  <v-card-title class="text-h6">Insignias</v-card-title>
                  <v-card-text>
                    <v-avatar
                      v-for="(badge, i) in user.badges"
                      :key="i"
                      size="40"
                      class="ma-1 animate-pop"
                    >
                      <v-img :src="badge"></v-img>
                    </v-avatar>
                    <p v-if="user.badges.length === 0" class="text-caption mt-2">
                      Aún no tienes insignias, participa más en la comunidad ✨
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
            v-for="(interest, i) in user.interests"
            :key="i"
            class="ma-1"
            color="deep-purple lighten-3"
          >
            {{ interest }}
          </v-chip>
          <p v-if="user.interests.length === 0" class="text-caption">Agrega intereses a tu perfil</p>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Mascotas registradas -->
        <h4 class="text-h6 mb-3">🐶 Mis Mascotas</h4>
        <v-row>
          <v-col
            v-for="(pet, i) in user.pets"
            :key="i"
            cols="12" sm="6" md="4"
          >
            <v-card class="pa-2" outlined>
              <v-img :src="pet.photo" height="140" class="rounded mb-2"></v-img>
              <h5 class="text-subtitle-2">{{ pet.name }}</h5>
              <p class="text-caption">{{ pet.species }} - {{ pet.age }}</p>
            </v-card>
          </v-col>
        </v-row>
        <p v-if="user.pets.length === 0" class="text-caption">Aún no has registrado mascotas</p>

        <v-divider class="my-4"></v-divider>

        <!-- Estadísticas -->
        <h4 class="text-h6 mb-3">📊 Estadísticas</h4>
        <v-row>
          <v-col cols="12" sm="4">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">🐾 Mascotas registradas</h5>
              <p class="text-h5 font-weight-bold">{{ user.stats.pets }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">📩 Solicitudes enviadas</h5>
              <p class="text-h5 font-weight-bold">{{ user.stats.requests }}</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card outlined class="pa-4 text-center">
              <h5 class="text-h6">🤝 Adopciones completadas</h5>
              <p class="text-h5 font-weight-bold">{{ user.stats.adoptions }}</p>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Actividad reciente -->
        <h4 class="text-h6 mb-3">📌 Actividad Reciente</h4>
        <v-list two-line>
          <v-list-item
            v-for="(activity, index) in user.activities"
            :key="index"
          >
            <v-list-item-avatar>
              <v-icon color="primary">mdi-history</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ activity.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ activity.date }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <p v-if="user.activities.length === 0" class="text-caption">No hay actividad reciente</p>
        </v-list>

        <v-divider class="my-4"></v-divider>

        <!-- Acciones -->
        <div class="d-flex flex-wrap gap-3 justify-center">
          <v-btn color="secondary" prepend-icon="mdi-cog" elevation="4">
            Configuración
          </v-btn>
          <v-btn color="purple" prepend-icon="mdi-key" elevation="4">
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useGamificationStore } from '@/stores/gamification';
import { defineEmits } from 'vue';
const emit = defineEmits(['close']);

const router = useRouter();
const store = useGamificationStore();

const user = ref({
  email: '',
  username: '',
  avatar: '',
  points: 0,
  badges: [],
  bio: '',
  interests: [],
  pets: [],
  activities: [],
  stats: { pets: 0, requests: 0, adoptions: 0 },
  joinedAt: '2025-01-01',
  role: 'Usuario'
});

const loading = ref(true);

const fetchUser = async () => {
  try {
    loading.value = true;
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('No hay usuario logueado');
    const res = await axios.get(`/users/${userId}`);
    user.value = res.data;

    // Si no tiene datos, simulamos algunos
    if (!user.value.badges) {
      user.value.badges = [
        'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
        'https://cdn-icons-png.flaticon.com/512/190/190411.png'
      ];
    }
    if (!user.value.interests) {
      user.value.interests = ['Animales', 'Voluntariado', 'Tecnología'];
    }
    if (!user.value.pets) {
      user.value.pets = [
        { name: 'Firulais', species: 'Perro', age: 'Joven', photo: 'https://placedog.net/300/200' },
        { name: 'Michi', species: 'Gato', age: 'Adulto', photo: 'https://placekitten.com/300/200' }
      ];
    }
    if (!user.value.stats) {
      user.value.stats = { pets: 2, requests: 5, adoptions: 1 };
    }
    if (!user.value.activities) {
      user.value.activities = [
        { title: 'Registraste a Michi 🐱', date: '2025-09-28' },
        { title: 'Completaste una adopción 🐾', date: '2025-09-20' }
      ];
    }

    store.points = res.data.points;
    store.achievements = res.data.achievements;
  } catch (err) {
    console.error('Error fetchUser:', err);
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  store.points = 0;
  store.achievements = [];
  emit('close');
  router.push('/login');
};

onMounted(fetchUser);
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
</style>
