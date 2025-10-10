<template>
  <v-container fluid fill-height class="login-container">
    <!-- Fondo animado con huellitas y gatitos -->
    <div class="background-animation">
      <!-- Gatitos primero -->
      <div v-for="n in 10" :key="'cat' + n" class="cat"></div>
      <!-- Huellitas después -->
      <div v-for="n in 15" :key="'paw' + n" class="paw"></div>
    </div>

    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card
          class="pa-6 login-card animate__animated animate__fadeInUp"
          @mousemove="handleParallax"
          @mouseleave="resetParallax"
          :style="{ transform: parallaxTransform }"
        >
          <!-- Icono de mascota grande -->
          <div class="icon-container">
            <v-icon color="pink" size="64">mdi-paw</v-icon>
          </div>

          <v-card-title class="text-center text-h5 font-weight-bold mb-4">
            Iniciar Sesión
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="login" ref="loginForm">
              <!-- Email -->
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                outlined
                dense
                class="animated-field"
                :rules="[v => !!v || 'El email es requerido']"
              ></v-text-field>

              <!-- Contraseña -->
              <v-text-field
                v-model="password"
                label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                append-icon="mdi-eye"
                @click:append="showPassword = !showPassword"
                outlined
                dense
                class="animated-field"
                :rules="[v => !!v || 'La contraseña es requerida']"
              ></v-text-field>

              <!-- Botón Login -->
              <v-btn
                type="submit"
                color="pink"
                class="mt-4 btn-hover"
                block
                large
                elevation="4"
                :loading="loading"
              >
                Ingresar
              </v-btn>
            </v-form>

            <!-- Mensaje de error -->
            <v-alert
              v-if="errorMsg"
              type="error"
              dense
              outlined
              class="mt-4 animate__animated animate__shakeX"
            >
              {{ errorMsg }}
            </v-alert>

            <v-divider class="my-4"></v-divider>

            <!-- Botón Cancelar -->
            <v-btn
              to="/"
              color="secondary"
              block
              outlined
              elevation="2"
              class="btn-hover-secondary"
            >
              Cancelar
            </v-btn>

            <!-- Link Registrarse -->
            <div class="text-center mt-3">
              <router-link to="/register" class="register-link">
                ¿No tienes cuenta? Regístrate
              </router-link>
            </div>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { checkAuth } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const parallaxTransform = ref('')

const handleParallax = (e) => {
  const x = (e.offsetX - e.target.offsetWidth / 2) / 40
  const y = (e.offsetY - e.target.offsetHeight / 2) / 40
  parallaxTransform.value = `rotateY(${x}deg) rotateX(${-y}deg)`
}

const resetParallax = () => {
  parallaxTransform.value = 'rotateY(0deg) rotateX(0deg)'
}

const login = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Por favor completa todos los campos.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await axios.post('/login', { email: email.value, password: password.value })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userId', res.data.user.id)
    localStorage.setItem('isAdmin', res.data.user.isAdmin.toString())
    checkAuth()
    router.push('/catalog')
  } catch (err) {
    errorMsg.value = err.response?.data?.error || 'Error en login'
  } finally {
    loading.value = false
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

.login-container {
  position: relative;
  background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Fondo animado */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.paw {
  position: absolute;
  bottom: -50px;
  width: 32px;
  height: 32px;
  background-image: url('https://cdn-icons-png.flaticon.com/512/616/616408.png');
  background-size: cover;
  opacity: 0.3;
  animation: floatUp linear infinite;
  z-index: 1;
}

/* Posiciones y velocidades para huellitas (variadas) */
.paw:nth-of-type(1) { animation-duration: 12s; left: 10%; }
.paw:nth-of-type(2) { animation-duration: 15s; left: 60%; }
.paw:nth-of-type(3) { animation-duration: 10s; left: 30%; }
.paw:nth-of-type(4) { animation-duration: 18s; left: 80%; }
.paw:nth-of-type(5) { animation-duration: 13s; left: 50%; }
.paw:nth-of-type(6) { animation-duration: 16s; left: 70%; }
.paw:nth-of-type(7) { animation-duration: 14s; left: 40%; }
.paw:nth-of-type(8) { animation-duration: 11s; left: 90%; }
.paw:nth-of-type(9) { animation-duration: 17s; left: 20%; }
.paw:nth-of-type(10) { animation-duration: 9s; left: 55%; }
.paw:nth-of-type(11) { animation-duration: 20s; left: 5%; }
.paw:nth-of-type(12) { animation-duration: 13s; left: 75%; }
.paw:nth-of-type(13) { animation-duration: 16s; left: 35%; }
.paw:nth-of-type(14) { animation-duration: 12s; left: 95%; }
.paw:nth-of-type(15) { animation-duration: 14s; left: 15%; }

.cat {
  position: absolute;
  bottom: -80px; /* Empiezan más abajo para no solaparse con paws */
  width: 50px; /* Más grandes que las paws para que se noten */
  height: 50px;
  opacity: 0.6; /* Inicial visible */
  animation: floatUpCat linear infinite; /* Animación como las paws, pero juguetona */
  z-index: 1;
}

.cat::before {
  content: '🐈'; /* Emoji gatito */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  line-height: 1;
}

/* Posiciones y velocidades para gatitos (más lentos y variados, como las paws) */
.cat:nth-of-type(1) { animation-duration: 20s; left: 15%; }
.cat:nth-of-type(2) { animation-duration: 25s; left: 45%; }
.cat:nth-of-type(3) { animation-duration: 18s; left: 70%; }
.cat:nth-of-type(4) { animation-duration: 22s; left: 5%; }
.cat:nth-of-type(5) { animation-duration: 28s; left: 85%; }
.cat:nth-of-type(6) { animation-duration: 19s; left: 35%; }
.cat:nth-of-type(7) { animation-duration: 24s; left: 65%; }
.cat:nth-of-type(8) { animation-duration: 21s; left: 25%; }
.cat:nth-of-type(9) { animation-duration: 26s; left: 55%; }
.cat:nth-of-type(10) { animation-duration: 23s; left: 80%; }

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg);
    opacity: 0;
  }
}

/* Animación para gatitos: Similar a floatUp, pero con escala juguetona (como perritos saltando) */
@keyframes floatUpCat {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20vh) rotate(-15deg) scale(1.1); /* Salto juguetón */
    opacity: 0.8;
  }
  50% {
    transform: translateY(-50vh) rotate(0deg) scale(0.95);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-80vh) rotate(15deg) scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg) scale(1);
    opacity: 0;
  }
}

/* Resto de estilos (sin cambios) */
.login-card {
  position: relative;
  z-index: 2;
  border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  perspective: 1000px;
  overflow: hidden;
  background: white;
}

.icon-container {
  text-align: center;
  margin-bottom: 16px;
}

.animated-field input {
  transition: all 0.3s ease;
}
.animated-field input:focus {
  border-color: #ff4081 !important;
  box-shadow: 0 0 10px rgba(255, 64, 129, 0.3);
}

.btn-hover {
  transition: all 0.3s ease;
}
.btn-hover:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.btn-hover-secondary {
  transition: all 0.3s ease;
}
.btn-hover-secondary:hover {
  background-color: #ffe6ea !important;
  color: #000 !important;
  transform: scale(1.05);
}

.v-alert {
  font-size: 0.9rem;
  text-align: center;
}
.register-link {
  color: #ff4081;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}
.register-link:hover {
  color: #e73370;
  text-decoration: underline;
}
</style>
