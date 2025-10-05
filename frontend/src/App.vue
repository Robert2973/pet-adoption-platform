<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Plataforma de Adopción de Mascotas</v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- Menú superior -->
      <v-btn to="/" text>Inicio</v-btn>
      <v-btn to="/catalog" text>Catálogo</v-btn>

      <!-- Mostrar Perfil solo si está logueado y NO es admin -->
      <v-btn v-if="isLoggedIn && !isAdmin" to="/profile" text>Perfil</v-btn>

      <!-- Mostrar Admin solo si está logueado y es admin -->
      <v-btn v-if="isLoggedIn && isAdmin" to="/admin" text>Admin</v-btn>

      <v-btn v-if="!isLoggedIn" to="/login" text>Iniciar Sesión</v-btn>
      <v-btn v-if="isLoggedIn" text @click="logout">Cerrar Sesión</v-btn>
    </v-app-bar>

    <!-- Drawer lateral -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav>
        <v-list-item to="/" title="Inicio" />
        <v-list-item to="/catalog" title="Catálogo" />

        <!-- Perfil solo para usuarios normales -->
        <v-list-item v-if="isLoggedIn && !isAdmin" to="/profile" title="Perfil" />

        <!-- Admin solo para admins -->
        <v-list-item v-if="isLoggedIn && isAdmin" to="/admin" title="Admin" />

        <v-list-item v-if="!isLoggedIn" to="/login" title="Iniciar Sesión" />
        <v-list-item v-if="isLoggedIn" @click="logout" title="Cerrar Sesión" />
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer app>
      <span>© 2023 Plataforma de Adopción con Gamificación</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

const drawer = ref(false);
const { isLoggedIn, isAdmin, checkAuth, logout } = useAuth();

onMounted(() => {
  checkAuth();
  // Escucha cambios en localStorage para sincronizar sesión entre pestañas
  window.addEventListener('storage', checkAuth);
});
</script>

<style>
.v-main {
  padding: 20px;
}
</style>
