const express = require('express');
const router = express.Router();
const Adoption = require('../models/Adoption');
const User = require('../models/User');
const auth = require('../middleware/auth');  // Comenta si no tienes auth temporal: /* auth, */

// POST /adoptions: Crear solicitud (pending, sin points)
router.post('/', /* auth, */ async (req, res) => {
  try {
    const { petId, message, experience, housingType, hasOtherPets, otherPetsDescription, availability, healthCommitment, phone, email } = req.body;
    const userId = req.body.userId || 'test_user_id';  // Usa body si sin auth

    if (!petId || !message) return res.status(400).json({ error: 'petId y message requeridos' });

    const adoption = new Adoption({
      userId,
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
    });

    await adoption.save();
    console.log('Solicitud creada (pending):', adoption._id);  // Log debug
    await adoption.populate('petId', 'name species age photo');

    res.status(201).json(adoption);
  } catch (err) {
    console.error('Error creando adopción:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /adoptions/user/:userId: Lista para stats (requestsSent, adoptedPets)
router.get('/user/:userId', /* auth, */ async (req, res) => {
  try {
    const userId = req.params.userId;
    const adoptions = await Adoption.find({ userId })
      .populate('petId', 'name species age photo')
      .sort({ createdAt: -1 });

    const approved = adoptions.filter(a => a.status === 'approved').length;
    const total = adoptions.length;

    console.log(`Stats para user ${userId}: Total solicitudes ${total}, Adoptadas ${approved}`);  // Log debug

    res.json(adoptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /adoptions/:id: Aprobar (¡+100 POINTS + MASCOTA A ADOPTADAS!)
router.put('/:id', /* auth, */ async (req, res) => {
  try {
    // Temporal: Sin check admin para test (agrega if (!req.user.isAdmin) en producción)
    const { status } = req.body;  // 'approved' o 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status inválido' });

    const adoption = await Adoption.findById(req.params.id).populate('userId petId');
    if (!adoption) return res.status(404).json({ error: 'Adopción no encontrada' });

    adoption.status = status;
    await adoption.save();

    // ← +100 POINTS AL APROBAR (tu idea: sube points cuando se agrega mascota adoptada)
    if (status === 'approved') {
      const user = adoption.userId;
      const oldPoints = user.points || 0;
      user.points = (user.points || 0) + 100;  // +100 (empieza 0, sube 100 por mascota)
      await user.save();

      console.log(`✅ APROBADA: +100 points a ${user.email} (de ${oldPoints} a ${user.points}). Mascota: ${adoption.petId.name}`);  // Log debug

      // Opcional: Badge por level (si points >=100, etc.)
      const newLevel = Math.floor(user.points / 100) + 1;
      if (newLevel >= 1 && !user.achievements.includes('Adoptador Novato')) {
        user.achievements.push('Adoptador Novato');
        await user.save();
        console.log('Badge unlocked: Adoptador Novato');
      }
    } else {
      console.log(`❌ Rechazada: ${adoption._id} para user ${adoption.userId.email}`);
    }

    await adoption.populate('petId', 'name species age photo');
    res.json(adoption);
  } catch (err) {
    console.error('Error actualizando adopción:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /adoptions/admin: Lista todas para aprobar (usa Postman para test)
router.get('/admin', /* auth, */ async (req, res) => {
  try {
    const adoptions = await Adoption.find()
      .populate('userId', 'email username')
      .populate('petId', 'name species age photo')
      .sort({ createdAt: -1 });

    console.log('Lista admin: Total adoptions', adoptions.length);  // Log debug
    res.json(adoptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
