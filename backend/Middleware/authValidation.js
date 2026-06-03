const joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(3).max(20).required(),      // Fixed: string() is a function
        email: joi.string().email().required(),            // Fixed: string() and email() are functions
        password: joi.string().min(4).required()           // Fixed: string() is a function
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        // Changed status to 400 Bad Request and simplified error output
        return res.status(400).json({ message: "Bad Request", error: error.details[0].message });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),            // Fixed: string() and email() are functions
        password: joi.string().min(4).required()           // Fixed: string() is a function
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad Request", error: error.details[0].message });
    }
    next();
};

module.exports = {
    loginValidation,
    signupValidation
};