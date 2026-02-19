const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

async function getAll(req, res) {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getById(req, res) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function create(req, res) {
  try {
    const { email, password, first_name, last_name, role, specialty, license_number } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'El email ya esta registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email, password_hash, first_name, last_name, role,
      specialty: specialty || null,
      license_number: license_number || null,
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function update(req, res) {
  try {
    const { password, ...fields } = req.body;
    if (password) {
      fields.password_hash = await bcrypt.hash(password, 10);
    }
    const user = await userModel.update(req.params.id, fields);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function deactivate(req, res) {
  try {
    const result = await userModel.deactivate(req.params.id);
    if (!result) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (err) {
    console.error('Deactivate user error:', err.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { getAll, getById, create, update, deactivate };
