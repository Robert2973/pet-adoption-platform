// src/api.js
import axios from 'axios';

const backendHost = window.location.hostname; // detecta la IP del host
const api = axios.create({
  baseURL: `http://${backendHost}:5000`,
});

export default api;
