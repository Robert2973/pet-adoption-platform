const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
const { body, validationResult } = require('express-validator');
const User = require('./models/User');
const Pet = require('./models/Pet');
const Adoption = require('./models/Adoption');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

// Middleware básico
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer para subidas
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Clarifai (opcional)
let clarifai = null;
if (process.env.CLARIFAI_API_KEY) {
  clarifai = new ClarifaiStub(grpc, process.env.CLARIFAI_API_KEY, 'https://api.clarifai.com');
}

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petdb')
  .then(() => console.log('MongoDB conectado exitosamente'))
  .catch(err => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  });

// Middleware Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Middleware Admin
const isAdmin = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Acceso admin requerido' });
      next();
    })
    .catch(err => res.status(500).json({ error: 'Error verificando admin' }));
};

// -------------------- RUTAS --------------------

// Registro de usuario
app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos inválidos' });

  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Usuario ya existe' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, points: 0, achievements: [], isAdmin: false });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, points: 0, achievements: [], isAdmin: false } });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ error: 'Error en registro' });
  }
});

// Login de usuario
app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos inválidos' });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, points: user.points, achievements: user.achievements, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Obtener mascotas
app.get('/pets', async (req, res) => {
  try {
    const { species, location, age } = req.query;
    let query = {};
    if (species) query.species = { $regex: new RegExp(`^${species}$`, 'i') };
    if (location) query.location = { $regex: new RegExp(location, 'i') };
    if (age) query.age = { $regex: new RegExp(`^${age}$`, 'i') };

    const pets = await Pet.find(query);
    res.json(pets);
  } catch (err) {
    console.error('Error en /pets GET:', err);
    res.status(500).json({ error: 'Error cargando pets' });
  }
});

// Crear mascota
app.post('/pets', upload.single('photo'), async (req, res) => {
  try {
    let tags = ['mascota', 'adoptable'];
    if (req.file && clarifai) {
      // Aquí se puede implementar Clarifai si tienes API Key
      // tags = ... extraer conceptos ...
    }
    const pet = new Pet({
      ...req.body,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      tags
    });
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error('Error en /pets POST:', err);
    res.status(500).json({ error: 'Error creando pet' });
  }
});

// Actualizar mascota
app.put('/pets/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photo = `/uploads/${req.file.filename}`;
    const pet = await Pet.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });
    res.json(pet);
  } catch (err) {
    console.error('Error en /pets PUT:', err);
    res.status(500).json({ error: 'Error actualizando mascota' });
  }
});

// Eliminar mascota
app.delete('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });
    res.json({ message: 'Mascota eliminada' });
  } catch (err) {
    console.error('Error en /pets DELETE:', err);
    res.status(500).json({ error: 'Error eliminando mascota' });
  }
});

// Crear adopción
app.post('/adoptions', authenticateToken, async (req, res) => {
  try {
    const { petId, message } = req.body;
    if (!petId || !message) return res.status(400).json({ error: 'Pet ID y mensaje requeridos' });

    const adoption = new Adoption({
      userId: req.user.id,
      ...req.body,
      status: 'pending'
    });
    await adoption.save();
    res.json({ message: 'Solicitud enviada' });
  } catch (err) {
    console.error('Error en /adoptions POST:', err);
    res.status(500).json({ error: 'Error en adopción' });
  }
});

// Admin: actualizar adopción
app.put('/adoptions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status inválido' });

    const adoption = await Adoption.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId petId');
    if (!adoption) return res.status(404).json({ error: 'Adopción no encontrada' });
    res.json(adoption);
  } catch (err) {
    console.error('Error en /adoptions PUT:', err);
    res.status(500).json({ error: 'Error actualizando adopción' });
  }
});

// Admin: listar adopciones pendientes
app.get('/admin/adoptions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const adoptions = await Adoption.find({ status: 'pending' }).populate('userId', 'email').populate('petId', 'name species photo');
    res.json(adoptions);
  } catch (err) {
    console.error('Error en /admin/adoptions:', err);
    res.status(500).json({ error: 'Error cargando adopciones' });
  }
});

// Obtener usuario
app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Acceso denegado' });
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error('Error en /users GET:', err);
    res.status(500).json({ error: 'Error cargando usuario' });
  }
});

// Actualizar puntos y logros
app.put('/users/points', authenticateToken, async (req, res) => {
  try {
    const { pointsToAdd, achievement, userId } = req.body;
    if (req.user.id !== userId) return res.status(403).json({ error: 'Acceso denegado' });
    if (pointsToAdd <= 0) return res.status(400).json({ error: 'Puntos deben ser positivos' });

    let newAchievements = achievement ? [achievement] : [];
    const user = await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: pointsToAdd },
      $addToSet: { achievements: { $each: newAchievements } }
    }, { new: true }).select('-password');

    if (user.points > 50 && !user.achievements.includes('Adoptador Novato')) {
      user.achievements.push('Adoptador Novato');
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error('Error en /users/points:', err);
    res.status(500).json({ error: 'Error actualizando puntos' });
  }
});

  // Nueva: Importa y usa las rutas de análisis
const analyzeRoutes = require('./routes/analyze');
app.use('/api', analyzeRoutes);  // Todas las rutas de analyze.js tendrán prefijo /api

// Servidor
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));