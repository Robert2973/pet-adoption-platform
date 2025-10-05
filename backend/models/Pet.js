     const mongoose = require('mongoose');
     const petSchema = new mongoose.Schema({
       name: { type: String, required: true },
       species: { type: String, required: true },  // ej: 'dog', 'cat'
       age: { type: String, required: true },      // ej: 'young', 'adult'
       location: { type: String, required: true },
       photo: { type: String },                   // URL de la foto
       tags: [String]                             // De análisis: ['Golden Retriever', 'Adult']
     });
     module.exports = mongoose.model('Pet', petSchema);


