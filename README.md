# PetAdoption Platform

![Vue.js](https://img.shields.io/badge/Vue.js-3.0-green?style=flat&logo=vue.js) ![Node.js](https://img.shields.io/badge/Node.js-18.x-blue?style=flat&logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-yellow?style=flat&logo=mongodb)

Una plataforma web completa para la adopción de mascotas, construida con Vue.js en el frontend y Node.js/Express en el backend. Permite a los usuarios registrarse, agregar/editar/eliminar mascotas, solicitar adopciones, compartir publicaciones para ganar puntos, y analizar imágenes de mascotas con IA.

## Descripción

Esta app es un sistema de adopción de mascotas con funcionalidades clave:
- **Gestión de Usuarios**: Registro, login, perfil con puntos y logros.
- **Catálogo de Mascotas**: Buscar, filtrar por especie/edad/ubicación, solicitar adopción con formulario detallado.
- **Gestión de Mascotas**: Agregar, editar, eliminar mascotas con upload de fotos.
- **Sistema de Puntos**: Ganar +50 puntos por compartir mascotas.
- **Análisis IA**: Proxy a Flask para detectar especie/raza en fotos.
- **Admin**: Aprobar/rechazar adopciones (rol admin).

## Características Principales

- **Frontend (Vue 3 + Vuetify)**: Interfaz responsive con diálogos, snackbars, animaciones (Animate.css), y formularios validados.
- **Backend (Node/Express)**: API REST con auth JWT, validación (express-validator), hash passwords (bcrypt) y CORS.
- **Base de Datos**: MongoDB/Mongoose para users, pets, adoptions.
- **IA Integrada**: Proxy a Flask (puerto 5001) para análisis de imágenes (/api/analyze-image).
- **Puntos y Logros**: Sistema gamificado.
- **Compartir**: Native share o clipboard, registra en backend para puntos.
- **Seguridad**: Auth token, admin middleware, validación inputs.

## Tecnologías Usadas

- **Frontend**: Vue 3, Vuetify 3, Axios, Vue Router, Animate.css.
- **Backend**: Node.js, Express, Mongoose, Multer, Bcryptjs, Jsonwebtoken, Express-validator, CORS.
- **DB**: MongoDB.
- **IA**: Flask proxy (Python, puerto 5001).
- **Herramientas**: Nodemon (dev server), Postman (test API).
- **Otras**: FormData para uploads, Web Share API para compartir.

## Requisitos Previos

- Node.js (v18+)
- MongoDB (local o MongoDB Atlas free)
- npm/yarn
- Python/Flask para IA (puerto 5001)
- Tensorflow
- Pillow
- Numpy
- Typing-extensions

Instala dependencias:
- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`

## Instalación y Configuración

### 1. Configura MongoDB
- **Local**: Instala MongoDB, corre `mongod` (o usa MongoDB Compass).
- **Atlas (Recomendado)**: Crea cluster free en mongodb.com/atlas, obtén URI (ej: `mongodb+srv://user:pass@cluster.mongodb.net/petdb`), agrega a .env backend:
- **MONGODB_URI=mongodb+srv://tu-user:tu-pass@cluster0.abcde.mongodb.net/petdb JWT_SECRET=secreto123

### 2. Backend (Node/Express)
- `cd backend`
- Crea .env con MONGODB_URI y JWT_SECRET.
- `npm install` (instala express, mongoose, etc.).
- `npm run dev` o `nodemon server.js` (puerto 5000).
- Test: Postman GET http://localhost:5000/pets → [] (vacío OK).

### 3. Frontend (Vue)
- `cd frontend`
- `npm install` (instala vue, vuetify, axios, etc.).
- Configura vite.config.js para proxy API (target: 'http://localhost:5000/api').
- `npm run dev` (puerto 5173).

### 4. IA Flask
- Crea app.py (Flask en puerto 5001) para /analyze.
- `python app.py` (puerto 5001).
- Backend proxy /api/analyze-image → Flask.

### 5. Correr la App
- Backend: `node server.js` (puerto 5000).
- Backend(IA): `python app.py` (puerto 5001).
- Frontend: `npm run dev -- --host` (puerto 5173).
- Accede: http://localhost:5173 (local).
- Registro/Login → /catalog (ver mascotas) → /gestion (agregar/editar).

## Uso

1. **Registro/Login**: Crea cuenta (email/password), gana puntos por shares.
2. **Catálogo**: Busca mascotas, filtra, solicita adopción (formulario detallado: experiencia, vivienda, etc.).
3. **Gestión Mascotas**: /gestion → agrega con foto (visible multi-device), edita/elimina.
4. **Compartir**: Clic "Compartir" → +50 pts, logro "Adoptador Novato" (>50 pts).
5. **Admin**: Login admin → /admin → aprueba adopciones.
6. **IA**: Sube foto en /analyze-photos → detecta especie (Flask/Clarifai).

**Ejemplo Flujo**:
- Registro → /catalog → filtra "dog" → "Adoptar" → formulario → backend guarda adopción.
- /gestion → agrega "Max" (foto) → push lista, imagen visible en celular.
- Share "Max" → +50 pts, snackbar.

## Endpoints API (Postman Test)

- **Auth**:
- POST /register: {email, password} → {token, user}
- POST /login: {email, password} → {token, user}
- **Users**:
- GET /users/:id (auth token): User profile.
- PUT /users/points (auth): {pointsToAdd, achievement} → Update points.
- **Pets**:
- GET /pets?species=dog&location=Casa: Lista mascotas (filtros).
- POST /pets (multipart photo): {name, species, age, location, description, photo} → Nueva mascota.
- PUT /pets/:id (multipart photo): Update mascota.
- DELETE /pets/:id: Eliminar.
- **Adoptions**:
- POST /adoptions (auth): {petId, message, experience, ...} → Solicitud.
- PUT /adoptions/:id (admin): {status: 'approved'} → Aprobar.
- GET /admin/adoptions (admin): Lista pendientes.
- **IA**:
- POST /api/analyze-image (multipart image): Análisis especie/raza.

Headers: Authorization: Bearer [token] para auth.

## Problemas Comunes y Soluciones

- **Imágenes No Visible Multi-Device**: Usa ngrok o IP dinámica (API_URL = `http://${window.location.hostname}:5000`). Backend photo relativo, frontend prepend.
- **CORS Error**: Backend app.use(cors({ origin: '*' }));.
- **MongoDB Conexión Falla**: Verifica URI en .env, Mongo corriendo.
- **Uploads 404**: Carpeta /uploads writable, app.use('/uploads', express.static('uploads')).
