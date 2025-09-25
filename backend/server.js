   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const multer = require('multer');
   const Clarifai = require('clarifai');

   dotenv.config();
   const app = express();
   app.use(cors());
   app.use(express.json());

   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('MongoDB conectado'))
     .catch(err => console.error(err));

   const upload = multer({ dest: 'uploads/' });  // Carpeta para fotos temporales
   const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_API_KEY });

   // Importa modelos
   const Pet = require('./models/Pet');
   const User = require('./models/User');
   const Adoption = require('./models/Adoption');
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');

   // Ruta de registro (simplificada)
   app.post('/register', async (req, res) => {
     try {
       const { email, password } = req.body;
       const hashed = await bcrypt.hash(password, 10);
       const user = new User({ email, password: hashed });
       await user.save();
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
       res.json({ token });
     } catch (err) { res.status(400).json({ error: err.message }); }
   });

   // Ruta de login
   app.post('/login', async (req, res) => {
     try {
       const { email, password } = req.body;
       const user = await User.findOne({ email });
       if (!user || !await bcrypt.compare(password, user.password)) {
         return res.status(401).json({ error: 'Credenciales inválidas' });
       }
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
       res.json({ token, user: { id: user._id, points: user.points, achievements: user.achievements } });
     } catch (err) { res.status(400).json({ error: err.message }); }
   });

   // Ruta para catálogo de mascotas con filtros
   app.get('/pets', async (req, res) => {
     try {
       let query = Pet.find();
       if (req.query.species) query = query.where('species', req.query.species);
       if (req.query.age) query = query.where('age', req.query.age);
       if (req.query.location) query = query.where('location', req.query.location);
       const pets = await query;
       res.json(pets);
     } catch (err) { res.status(500).json({ error: err.message }); }
   });

   // Ruta para subir mascota con análisis de foto
   app.post('/pets', upload.single('photo'), async (req, res) => {
     try {
       const { name, species, age, location } = req.body;
       let tags = [];
       if (req.file) {
         // Análisis con Clarifai (simplificado; usa buffer de imagen)
         const response = await clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, req.file.path);
         tags = response.outputs[0].data.concepts.slice(0, 5).map(c => c.name);  // Top 5 tags
       }
       const pet = new Pet({ name, species, age, location, photo: req.file ? req.file.path : '', tags });
       await pet.save();
       res.json(pet);
     } catch (err) { res.status(500).json({ error: err.message }); }
   });

   // Ruta para solicitud de adopción
   app.post('/adoptions', async (req, res) => {
     try {
       const { userId, petId, message } = req.body;
       const adoption = new Adoption({ userId, petId, message });
       await adoption.save();
       // Aquí puedes agregar email a admin con Nodemailer si quieres
       res.json({ message: 'Solicitud enviada' });
     } catch (err) { res.status(500).json({ error: err.message }); }
   });

   // Ruta para actualizar puntos (gamificación)
   app.put('/users/points', async (req, res) => {
     try {
       const { userId, pointsToAdd, achievement } = req.body;
       const user = await User.findById(userId);
       user.points += pointsToAdd;
       if (achievement) user.achievements.push(achievement);
       await user.save();
       res.json(user);
     } catch (err) { res.status(500).json({ error: err.message }); }
   });

   // Panel admin: Ejemplo para listar solicitudes
   app.get('/admin/adoptions', async (req, res) => {
     // Agrega middleware de auth para isAdmin aquí
     const adoptions = await Adoption.find().populate('userId petId');
     res.json(adoptions);
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
