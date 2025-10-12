<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Plataforma de Adopción de Mascotas</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- Menú superior -->
      <v-btn to="/" text>Inicio</v-btn>
      <v-btn to="/catalog" text>Catálogo</v-btn>
      <!-- NUEVO: Botón para Análisis IA (visible para todos) -->
      <v-btn to="/analyze-photos" text>Análisis IA</v-btn>

      <!-- Mostrar Perfil solo si está logueado y NO es admin -->
      <v-btn v-if="isLoggedIn && !isAdmin" to="/profile" text>Perfil</v-btn>

      <!-- Mostrar Solicitudes solo si está logueado y es admin -->
      <v-btn v-if="isLoggedIn && isAdmin" to="/admin" text>Solicitudes</v-btn>
      <v-btn v-if="isLoggedIn && isAdmin" to="/gestion" text>Gestion</v-btn>

      <v-btn v-if="!isLoggedIn" to="/login" text>Iniciar Sesión</v-btn>
      <!-- FIX: Usa handleLogout para logout + push('/login') inmediato -->
      <v-btn v-if="isLoggedIn" text @click="handleLogout">Cerrar Sesión</v-btn>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer app>
      <span>© 2025 Plataforma de Adopción</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();  // ← FIX: Instancia router
const drawer = ref(false);
const { isLoggedIn, isAdmin, checkAuth, logout } = useAuth();

// ← FIX: Nueva función handleLogout (llama logout() + navega a /login inmediatamente)
const handleLogout = async () => {
  try {
    await logout();  // Limpia storage (token, userId, etc.) via useAuth
    console.log('Logout ejecutado: Storage limpiado');  // Debug opcional
    router.push('/login');  // ← FIX: Navega inmediatamente a /login (unmount Profile)
  } catch (err) {
    console.error('Error en logout:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    router.push('/login');
  }
};

onMounted(() => {
  checkAuth();
  window.addEventListener('storage', checkAuth);
});
</script>

<style>
.v-main {
  padding: 20px;
}
</style>
