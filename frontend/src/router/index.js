import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import Catalog from '../views/Catalog.vue';
import Profile from '../views/Profile.vue';
import Admin from '../views/Admin.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';  // Importa si usas lazy no

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/catalog', name: 'catalog', component: Catalog },
    { path: '/profile', name: 'profile', component: Profile },
    { path: '/admin', name: 'admin', component: Admin },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register }  // Nueva ruta
  ]
});

// Guards (ya los tienes, pero agrega para register si quieres público)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (to.path === '/profile' && !token) {
    next('/login');
  } else if (to.path === '/admin' && (!token || !isAdmin)) {
    next('/login');
  } else {
    next();
  }
});

export default router;
