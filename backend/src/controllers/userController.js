const { User, Role } = require('../models');
const { validateEmail } = require('../utils/validateEmail');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
        const { username, password, rol_id, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        const user = await User.create({ username, email, password: hashedPassword, rol_id });
        res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user: ' + error.message, error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: Role
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, rol_id, isActive, email } = req.body;
        // Password update should be separate or handled carefully (hash it if present)

        const updateData = { username, email, rol_id, isActive };
        if (req.body.password) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        const [updated] = await User.update(updateData, { where: { id } });
        if (updated) {
            const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user: ' + error.message, error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
