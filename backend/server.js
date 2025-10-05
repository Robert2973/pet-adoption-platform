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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Sirve fotos

// Multer para subidas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Clarifai (comenta si no tienes key)
const clarifai = new ClarifaiStub(grpc, process.env.CLARIFAI_API_KEY, 'https://api.clarifai.com');

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petdb')
  .then(() => {
    console.log('MongoDB conectado exitosamente');
  })
  .catch(err => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);  // Sale si no conecta
  });

// Middleware de Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;  // { id: userId }
    next();
  });
};

// Middleware para Admin
const isAdmin = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user || !user.isAdmin) return res.status(403).json({ error: 'Acceso admin requerido' });
      next();
    })
    .catch(err => res.status(500).json({ error: 'Error verificando admin' }));
};

// Rutas Públicas: Register y Login (con validación y logs)
app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  console.log('POST /register recibido:', req.body);  // Log request

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores validación:', errors.array());  // Log errores
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const { email, password } = req.body;
    console.log('Buscando user existente:', email);  // Log query

    const existingUser  = await User.findOne({ email });
    if (existingUser ) {
      console.log('User  ya existe:', existingUser .email);  // Log duplicado
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    console.log('Hashing password...');  // Log progreso
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, points: 0, achievements: [], isAdmin: false });
    await user.save();
    console.log('User  creado:', user.email, 'ID:', user._id);  // Log éxito

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, points: 0, achievements: [], isAdmin: false } });
  } catch (err) {
    console.error('Error en /register:', err);  // Log detallado
    res.status(500).json({ error: 'Error en registro' });
  }
});

app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  console.log('POST /login recibido:', req.body);  // Log request

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores validación login:', errors.array());
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const { email, password } = req.body;
    console.log('Buscando user para login:', email);

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      console.log('Credenciales inválidas para:', email);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('Login exitoso para:', user.email);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, points: user.points, achievements: user.achievements, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Error en /login:', err);
    res.status(500).json({ error: 'Error en login' });
  }
});

// Rutas Públicas: Pets
app.get('/pets', async (req, res) => {
  try {
    console.log('GET /pets filtros recibidos:', req.query);  // Log completo de todos los filtros

    const { species, location, age } = req.query;  // Cambiado: tags -> age
    let query = {};

    if (species) {
      query.species = { $regex: new RegExp(`^${species}$`, 'i') };  // Case-insensitive y exacto
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };  // Parcial, case-insensitive
    }

    if (age) {
      // Filtro para age: exacto y case-insensitive (ajusta si age es array)
      query.age = { $regex: new RegExp(`^${age}$`, 'i') };
      console.log('Filtro age aplicado:', query.age);  // Log específico para depuración
    }

    const pets = await Pet.find(query);
    console.log('Pets encontrados con filtro:', pets.length, 'Query usada:', query);

    res.json(pets);
  } catch (err) {
    console.error('Error en /pets GET:', err);
    res.status(500).json({ error: 'Error cargando pets' });
  }
});


app.post('/pets', upload.single('photo'), async (req, res) => {
  try {
    console.log('POST /pets recibido:', req.body);  // Log body
    let tags = [];
    if (req.file && process.env.CLARIFAI_API_KEY) {
      console.log('Analizando foto con Clarifai...');
      const metadata = await clarifai.PostModelOutputs(
        'aaa03c23b3724a16a56b629203edc62c',  // General model ID
        { base64: req.file.buffer.toString('base64') }
      );
      tags = metadata.data.outputs[0].data.concepts.slice(0, 3).map(c => c.name);
      console.log('Tags de Clarifai:', tags);
    } else {
      tags = ['mascota', 'adoptable'];  // Manual si no hay Clarifai
      console.log('Tags manuales:', tags);
    }
    const pet = new Pet({
      ...req.body,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      tags
    });
    await pet.save();
    console.log('Pet creado:', pet.name, 'ID:', pet._id);
    res.json(pet);
  } catch (err) {
    console.error('Error en /pets POST:', err);
    res.status(500).json({ error: 'Error creando pet' });
  }
});

// Rutas Protegidas: Adoptions
app.post('/adoptions', authenticateToken, async (req, res) => {
  try {
    console.log('POST /adoptions por user:', req.user.id);
    const { petId, message, experience, housingType, hasOtherPets, otherPetsDescription, availability, healthCommitment, phone, email } = req.body;
    if (!petId || !message) return res.status(400).json({ error: 'Pet ID y mensaje requeridos' });
const adoption = new Adoption({
  userId: req.user.id,
  petId,
  message,
  experience,
  housingType,
  hasOtherPets,
  otherPetsDescription,
  availability,
  healthCommitment,
  phone,
  email,
  status: 'pending'
});    await adoption.save();
    console.log('Adopción creada:', adoption._id);
    res.json({ message: 'Solicitud enviada' });
  } catch (err) {
    console.error('Error en /adoptions POST:', err);
    res.status(500).json({ error: 'Error en adopción' });
  }
});

app.put('/adoptions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('PUT /adoptions/:id por admin:', req.user.id, 'Status:', req.body.status);
    const { status } = req.body;  // 'approved' o 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
    const adoption = await Adoption.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId petId');
    if (!adoption) return res.status(404).json({ error: 'Adopción no encontrada' });
    console.log('Adopción actualizada:', adoption._id, 'Nuevo status:', status);
    res.json(adoption);
  } catch (err) {
    console.error('Error en /adoptions PUT:', err);
    res.status(500).json({ error: 'Error actualizando adopción' });
  }
});

app.get('/admin/adoptions', authenticateToken, isAdmin, async (req, res) => {
  try {
    console.log('GET /admin/adoptions por admin:', req.user.id);
    const adoptions = await Adoption.find({ status: 'pending' }).populate('userId', 'email').populate('petId', 'name species photo');
    console.log('Adoptions pendientes:', adoptions.length);
    res.json(adoptions);
  } catch (err) {
    console.error('Error en /admin/adoptions:', err);
    res.status(500).json({ error: 'Error cargando adoptions' });
  }
});

// Rutas Protegidas: Users
app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    console.log('GET /users/:id por user:', req.user.id, 'Solicitado:', req.params.id);
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Acceso denegado' });
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    console.log('User  cargado:', user.email, 'Points:', user.points);
    res.json(user);
  } catch (err) {
    console.error('Error en /users GET:', err);
    res.status(500).json({ error: 'Error cargando usuario' });
  }
});

app.put('/users/points', authenticateToken, async (req, res) => {
  try {
    console.log('PUT /users/points por user:', req.user.id, 'Agregar:', req.body.pointsToAdd);
    const { pointsToAdd, achievement, userId } = req.body;
    if (req.user.id !== userId) return res.status(403).json({ error: 'Acceso denegado' });
    if (pointsToAdd <= 0) return res.status(400).json({ error: 'Puntos deben ser positivos' });

    let newAchievements = achievement ? [achievement] : [];
    const user = await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: pointsToAdd },
      $addToSet: { achievements: { $each: newAchievements } }
    }, { new: true }).select('-password');

    // Lógica extra: Logro si points > 50
    if (user.points > 50 && !user.achievements.includes('Adoptador Novato')) {
      user.achievements.push('Adoptador Novato');
      await user.save();
      console.log('Logro desbloqueado: Adoptador Novato para', user.email);
    }

    console.log('Points actualizados:', user.points, 'Achievements:', user.achievements);
    res.json(user);
  } catch (err) {
    console.error('Error en /users/points:', err);
    res.status(500).json({ error: 'Error actualizando puntos' });
  }
});

// Servidor
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
