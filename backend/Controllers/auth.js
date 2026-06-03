const bcrypt = require('bcrypt');
const userModel = require('../Models/user.js');
const JWT = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_TOKEN || 'default_jwt_secret';

// === SIGNUP CONTROLLER ===
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(409).json({ 
                message: "User already exists", 
                success: false 
            });
        }

        const newUser = new userModel({ name, email, password });
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();

        return res.status(201).json({ 
            message: "Sign up success", 
            success: true 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: error.message || "Internal server error", 
            success: false 
        });
    }
};

// === LOGIN CONTROLLER ===
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ 
                message: "Invalid email or password",
                success: false 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({ 
                message: "Invalid email or password", 
                success: false 
            });
        }

        const token = JWT.sign(
            { email: user.email, _id: user._id, name: user.name }, 
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ 
            message: "Login success", 
            success: true,
            user: { name: user.name, email: user.email },
            token
        });
    } catch (error) {
        return res.status(500).json({ 
            message: error.message || "Internal server error", 
            success: false 
        });
    }
};

module.exports = {
    signup,
    login
};