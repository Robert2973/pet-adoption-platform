<template>
<v-container fluid fill-height class="page-container">
    <AnimatedBackground :num-cats="8" :num-paws="12" />    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card
          class="pa-6 register-card animate__animated animate__fadeInUp"
          elevation="6"
        >
          <!-- Icono superior -->
          <div class="icon-container">
            <v-icon color="pink" size="64">mdi-paw</v-icon>
          </div>

          <v-card-title class="text-center text-h5 font-weight-bold mb-2">
            Crear Cuenta
          </v-card-title>
          <v-card-subtitle class="text-center mb-4">
            Regístrate para adoptar mascotas y ganar puntos
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="register">
              <!-- Email -->
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                outlined
                dense
                class="animated-field"
                :rules="[v => !!v || 'Email requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                required
              ></v-text-field>

              <!-- Contraseña -->
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                outlined
                dense
                class="animated-field"
                :rules="[v => !!v || 'Contraseña requerida', v => v.length >= 6 || 'Mínimo 6 caracteres']"
                required
              ></v-text-field>

              <!-- Botón Registrarse -->
              <v-btn
                type="submit"
                color="pink"
                class="mt-4 btn-hover"
                block
                large
                elevation="4"
                :loading="loading"
              >
                Registrarse
              </v-btn>
            </v-form>

            <v-divider class="my-4"></v-divider>

            <!-- Link Login -->
            <div class="text-center mt-2">
              <router-link to="/login" class="login-link">
                ¿Ya tienes cuenta? Inicia sesión
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar para errores/notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import api from '@/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const snackbar = ref({ show: false, message: '', color: 'info' });

const register = async () => {
  if (!email.value || !password.value) {
    showSnackbar('Completa email y contraseña', 'error');
    return;
  }

  try {
    loading.value = true;
    const res = await api.post('/register', {
      email: email.value,
      password: password.value
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userId', res.data.user.id);
    localStorage.setItem('isAdmin', res.data.user.isAdmin.toString());
    showSnackbar('¡Cuenta creada! Bienvenido.', 'success');
    router.push('/catalog');
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Error en registro. Intenta otro email.';
    showSnackbar(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

/* Fondo y centrar card */
.register-container {
  position: relative;
   background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%);
   min-height: 100vh;
   display: flex;
   align-items: center;
   justify-content: center;
   overflow: hidden;
}

/* Card mejorada */
.register-card {
  border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  perspective: 1000px;
}

/* Icono superior */
.icon-container {
  text-align: center;
  margin-bottom: 16px;
}

/* Campos animados */
.animated-field input {
  transition: all 0.3s ease;
}

.animated-field input:focus {
  border-color: #ff4081 !important;
  box-shadow: 0 0 10px rgba(255, 64, 129, 0.3);
}

/* Botón hover */
.btn-hover {
  transition: all 0.3s ease;
}

.btn-hover:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

/* Link login */
.login-link {
  color: #ff4081;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #e73370;
  text-decoration: underline;
}
</style>
