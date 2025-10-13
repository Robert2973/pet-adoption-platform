# PetAdoption Platform

![Vue.js](https://img.shields.io/badge/Vue.js-3.0-green?style=flat&logo=vue.js) ![Node.js](https://img.shields.io/badge/Node.js-18.x-blue?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-yellow?style=flat&logo=mongodb) ![Ngrok](https://img.shields.io/badge/Ngrok-Free-orange?style=flat&logo=ngrok)

Una plataforma web completa para la adopción de mascotas, construida con Vue.js en el frontend y Node.js/Express en el backend. Permite a los usuarios registrarse, agregar/editar/eliminar mascotas, solicitar adopciones, compartir publicaciones para ganar puntos, y analizar imágenes de mascotas con IA (Clarifai o Flask proxy). Soporta multi-dispositivo (red local o ngrok para compartir online).

## Descripción

Esta app es un sistema de adopción de mascotas con funcionalidades clave:
- **Gestión de Usuarios**: Registro, login, perfil con puntos y logros.
- **Catálogo de Mascotas**: Buscar, filtrar por especie/edad/ubicación, solicitar adopción con formulario detallado.
- **Gestión de Mascotas**: Agregar, editar, eliminar mascotas con upload de fotos (Multer).
- **Sistema de Puntos**: Ganar +50 puntos por compartir mascotas (web share API o clipboard).
- **Análisis IA**: Proxy a Flask para detectar especie/raza en fotos (opcional Clarifai).
- **Admin**: Aprobar/rechazar adopciones (rol admin).
- **Multi-Device**: Funciona en red local (IP dinámica) o ngrok para acceso remoto (celular/PC).

Desarrollada para demo local, con soporte para ngrok (exponer a internet sin deploy).

## Características Principales

- **Frontend (Vue 3 + Vuetify)**: Interfaz responsive con diálogos, snackbars, animaciones (Animate.css), y formularios validados.
- **Backend (Node/Express)**: API REST con auth JWT, validación (express-validator), hash passwords (bcrypt), uploads (Multer), y CORS.
- **Base de Datos**: MongoDB/Mongoose para users, pets, adoptions.
- **IA Integrada**: Proxy a Flask (puerto 5001) para análisis de imágenes (/api/analyze-image).
- **Puntos y Logros**: Sistema gamificado (ej: +50 por share, "Adoptador Novato" al >50 pts).
- **Compartir**: Native share o clipboard, registra en backend para puntos.
- **Multi-Device**: IP dinámica (window.location.hostname) para red local; ngrok para online.
- **Seguridad**: Auth token, admin middleware, validación inputs.

## Tecnologías Usadas

- **Frontend**: Vue 3, Vuetify 3, Axios, Vue Router, Animate.css.
- **Backend**: Node.js, Express, Mongoose, Multer, Bcryptjs, Jsonwebtoken, Express-validator, CORS.
- **DB**: MongoDB (local o Atlas).
- **IA**: Clarifai (opcional) o Flask proxy (Python, puerto 5001).
- **Herramientas**: Ngrok (exponer local), Nodemon (dev server), Postman (test API).
- **Otras**: FormData para uploads, Web Share API para compartir.

## Requisitos Previos

- Node.js (v18+)
- MongoDB (local o MongoDB Atlas free)
- npm/yarn
- Ngrok (free tier para multi-device/online)
- Opcional: Python/Flask para IA (puerto 5001)

Instala dependencias:
- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`

## Instalación y Configuración

### 1. Configura MongoDB
- **Local**: Instala MongoDB, corre `mongod` (o usa MongoDB Compass).
- **Atlas (Recomendado)**: Crea cluster free en mongodb.com/atlas, obtén URI (ej: `mongodb+srv://user:pass@cluster.mongodb.net/petdb`), agrega a .env backend:
