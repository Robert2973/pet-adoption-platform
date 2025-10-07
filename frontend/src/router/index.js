   import { createRouter, createWebHistory } from 'vue-router';
   import HomeView from '../views/Home.vue';
   import Catalog from '../views/Catalog.vue';
   import Profile from '../views/Profile.vue';
   import Admin from '../views/Admin.vue';
   import Login from '../views/Login.vue';
   import Register from '../views/Register.vue';
   import Gestion from '../views/Gestion.vue';
   import AnalyzePhotos from '../components/AnalyzePhotos.vue';  // Verifica esta ruta exacta

   const router = createRouter({
     history: createWebHistory(import.meta.env.BASE_URL),
     routes: [
       { path: '/', name: 'home', component: HomeView },
       { path: '/catalog', name: 'catalog', component: Catalog },
       { path: '/profile', name: 'profile', component: Profile },
       { path: '/admin', name: 'admin', component: Admin },
       { path: '/login', name: 'login', component: Login },
       { path: '/register', name: 'register', component: Register },
       { path: '/gestion', name: 'gestion', component: Gestion },
       { path: '/analyze-photos', name: 'AnalyzePhotos', component: AnalyzePhotos }  // Fallback si falla
     ]
   });

   // Guards con logs para debug
   router.beforeEach((to, from, next) => {
     console.log(`Navegando de ${from.path} a ${to.path}`);  // Debug: Muestra navegación
     const token = localStorage.getItem('token');
     const isAdmin = localStorage.getItem('isAdmin') === 'true';

     if (to.path === '/profile' && !token) {
       next('/login');
     } else if ((to.path === '/admin' || to.path === '/gestion') && (!token || !isAdmin)) {
       next('/login');
     } else {
       next();
     }
   });

   // Error handler global (captura errores en componentes)
   router.onError((error, to, from) => {
     console.error('Error en router:', error, to.path);
     // Fallback: Redirige a home si error en componente
     window.location.href = '/';
   });

   export default router;

