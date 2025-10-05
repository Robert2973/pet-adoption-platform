import { ref } from 'vue';

const isLoggedIn = ref(false);
const isAdmin = ref(false);

const checkAuth = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
  isAdmin.value = localStorage.getItem('isAdmin') === 'true';
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  checkAuth();
};

export function useAuth() {
  return {
    isLoggedIn,
    isAdmin,
    checkAuth,
    logout,
  };
}
