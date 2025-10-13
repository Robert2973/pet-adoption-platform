const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false, unique: true },
  avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },  // NUEVO
  bio: { type: String, default: '' },  // NUEVO
  interests: [{ type: String }],  // NUEVO: Array de intereses
  points: { type: Number, default: 0 },  // Ya existe
  achievements: [{ type: String }],  // Ya existe (badges)
  isAdmin: { type: Boolean, default: false },  // Ya existe
  role: { type: String, default: 'Usuario' },  // NUEVO: role
  joinedAt: { type: Date, default: Date.now },  // NUEVO: Fecha unión
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],  // NUEVO: Array de mascotas adoptadas (IDs)
  activities: [{  // NUEVO: Actividades recientes
    title: String,
    date: { type: Date, default: Date.now }
  }],
  sharesCount: { type: Number, default: 0 }
});

// Middleware para poblar pets (mascotas adoptadas)
userSchema.pre(/^find/, function(next) {
  this.populate('pets', 'name species age photo');  // Pobla detalles de Pet
  next();
});

module.exports = mongoose.model('User', userSchema);
