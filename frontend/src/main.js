  import { createApp } from 'vue';
  import { createPinia } from 'pinia';
  import App from './App.vue';
  import router from './router';
  import axios from 'axios';
  import { createVuetify } from 'vuetify';
  import 'vuetify/styles';
  import * as components from 'vuetify/components';
  import * as directives from 'vuetify/directives';
  import '@mdi/font/css/materialdesignicons.css'

  // Config Axios con interceptor para token
  axios.defaults.baseURL = '/api';
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Vuetify
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1976D2',
            secondary: '#424242',
            accent: '#82B1FF',
            error: '#FF5252',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107'
          }
        }
      }
    }
  });

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(vuetify);
  app.config.globalProperties.$axios = axios;  // Para uso global si necesitas
  app.mount('#app');

