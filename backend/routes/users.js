const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Ajusta path
const Adoption = require('../models/Adoption');  // Asume model Adoption existe; si no, crea abajo
const bcrypt = require('bcrypt');

// GET /users/:id (ya lo tienes, pero expande para poblar)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');  // Excluye password
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO: GET /users/:id/adoptions (para mascotas adoptadas y stats)
router.get('/:id/adoptions', async (req, res) => {
  try {
    const userId = req.params.id;
    const adoptions = await Adoption.find({ userId, status: 'approved' })  // Solo aprobadas
      .populate('petId', 'name species age photo');  // Pobla mascota
    res.json(adoptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NUEVO: GET /users/:id/activities (actividades recientes)
router.get('/:id/activities', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('activities achievements points');
    // Deriva actividades de achievements/points si no hay
    let activities = user.activities;
    if (activities.length === 0) {
      activities = user.achievements.map(ach => ({
        title: `Lograste: ${ach}`,
        date: new Date()
      }));
      // Agrega actividad de puntos si >0
      if (user.points > 0) {
        activities.push({ title: `Ganaste ${user.points} puntos`, date: new Date() });
      }
    }
    res.json(activities.slice(0, 5));  // Top 5
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowedFields = ['username', 'avatar', 'bio', 'interests'];
    const updates = {};

    // Filtra solo campos permitidos
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    console.error('Error actualizando usuario:', err);
    res.status(500).json({ error: err.message });
  }
});


// PUT /users/:id/change-password: Cambiar contraseña (SIN AUTH – solo bcrypt para old/new)
router.put('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    // Validaciones básicas
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'oldPassword y newPassword son requeridos' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    // Busca user con password (select +password si schema oculta)
    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Verifica oldPassword con bcrypt (400 si wrong)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });  // 400 Bad Request
    }
    // Hash newPassword
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log(`✅ Contraseña cambiada para user ${user.email} (ID: ${id})`);  // Log backend
    // Respuesta segura (sin password)
    const { password, ...userSafe } = user.toObject();
    res.status(200).json({ message: 'Contraseña cambiada exitosamente', user: userSafe });
  } catch (err) {
    console.error('Error interno cambiando contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ... routes existentes ...

// POST /users/:id/share: +1 sharesCount (+50 puntos implícito en frontend)
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.sharesCount += 1;  // +1 por share
    await user.save();

    console.log(`✅ +1 share para user ${user.email} (total shares: ${user.sharesCount})`);  // Log

    // Retorna user sin password (para frontend total points)
    const { password, ...userSafe } = user.toObject();
    res.json({ message: 'Compartición registrada! +50 puntos', user: userSafe });
  } catch (err) {
    console.error('Error en share:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});



module.exports = router;
