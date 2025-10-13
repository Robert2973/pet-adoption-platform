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
- **MONGODB_URI=mongodb+srv://tu-user:tu-pass@cluster0.abcde.mongodb.net/petdb JWT_SECRET=secreto123 # Cambia por clave segura CLARIFAI_API_KEY=tu-key # Opcional para IA

- 
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
- `npm run dev` (puerto 5173, host: true para ngrok).

### 4. IA Flask (Opcional)
- Crea app.py (Flask en puerto 5001) para /analyze (procesa imagen, retorna especie/raza).
- `python app.py` (puerto 5001).
- Backend proxy /api/analyze-image → Flask.

### 5. Ngrok para Multi-Device/Online
- Descarga ngrok.exe (ngrok.com).
- PowerShell 1: Backend `ngrok http 5000` → URL backend (ej: https://abc.ngrok-free.app).
- PowerShell 2: Frontend `ngrok http 5173` → URL frontend (ej: https://def.ngrok-free.app).
- Actualiza vite.config.js proxy target a ngrok backend URL.
- Comparte frontend ngrok URL (celular/PC ven app completa).

### 6. Correr la App
- Backend: `node server.js` (puerto 5000).
- Frontend: `npm run dev -- --host` (puerto 5173).
- Accede: http://localhost:5173 (local) o ngrok URL (online).
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

## Screenshots

- **Catálogo**: ![Catálogo](screenshots/catalog.png)
- **Gestión Mascotas**: ![Gestión](screenshots/gestion.png)
- **Formulario Adopción**: ![Adopción](screenshots/adopcion.png)
- **Perfil**: ![Perfil](screenshots/perfil.png)

(Agrega imágenes reales en carpeta /screenshots y actualiza paths.)

## Problemas Comunes y Soluciones

- **Imágenes No Visible Multi-Device**: Usa ngrok o IP dinámica (API_URL = `http://${window.location.hostname}:5000`). Backend photo relativo, frontend prepend.
- **CORS Error**: Backend app.use(cors({ origin: '*' }));.
- **MongoDB Conexión Falla**: Verifica URI en .env, Mongo corriendo.
- **Uploads 404**: Carpeta /uploads writable, app.use('/uploads', express.static('uploads')).
- **Ngrok ERR_334**: Mata procesos ngrok (Task Manager), espera 1 min, re-inicia tunnels.
- **Rate Limit Ngrok**: Free tier 360 req/min – usa local IP para test pesado.

## Contribuir

1. Fork el repo.
2. Crea branch (`git checkout -b feature/nueva-funcion`).
3. Commit cambios (`git commit -m 'Agrega X'`).
4. Push branch (`git push origin feature/nueva-funcion`).
5. Abre Pull Request.

¡Bienvenidas sugerencias/issues!

## Licencia

MIT License – libre uso/modificación (ver LICENSE).

## Contacto

Desarrollado por [Tu Nombre] – [tu-email@example.com]. Proyecto inspirado en adopción de mascotas. ¡Gracias por contribuir! 🐕❤️
