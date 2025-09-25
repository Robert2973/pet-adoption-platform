     const mongoose = require('mongoose');
     const adoptionSchema = new mongoose.Schema({
       userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
       petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
       message: { type: String, required: true },
       status: { type: String, default: 'pending' }
     });
     module.exports = mongoose.model('Adoption', adoptionSchema);
