const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  message: { type: String, required: true },
  phone: { type: String },  // Nuevo: Opcional, para contacto telefónico
  email: { type: String },  // Nuevo: Opcional, para contacto email (puede ser redundante con User.email)
  experience: { type: String }, // Nuevo
  housingType: { type: String }, // Nuevo
  hasOtherPets: { type: Boolean }, // Nuevo
  otherPetsDescription: { type: String }, // Opcional
  availability: { type: String }, // Nuevo
  healthCommitment: { type: Boolean }, // Nuevo
  status: { type: String, default: 'pending' }  // pending, approved, rejected
});

// Opcional: Índices para consultas rápidas (ej: por user o pet)
adoptionSchema.index({ userId: 1 });
adoptionSchema.index({ petId: 1 });
adoptionSchema.index({ status: 1 });

module.exports = mongoose.model('Adoption', adoptionSchema);
