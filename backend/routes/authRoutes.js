const express = require('express');
const {signupValidation, loginValidation }=require('../Middleware/authValidation');
const { signup } = require('../Controllers/auth');
const { login } = require('../Controllers/auth');
// Option A: Make sure there are parentheses () at the end!
const router = express.Router(); 

// ... OR Option B (Does the exact same thing):
// const { Router } = require('express');
// const router = Router();

router.post('/login', loginValidation, login);

router.post('/signup', signupValidation, signup)
// CRITICAL: Make sure you are exporting the router instance, not something else!
module.exports = router;