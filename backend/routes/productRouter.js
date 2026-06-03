const ensureAuthenticated = require('../Middleware/auth.js');
const router = require('express').Router();

router.get('/', ensureAuthenticated, (req, res) => {
    const products = [
        { id: 1, name: 'Wireless Headphones', price: 129.99, description: 'Comfortable noise-cancelling headphones.' },
        { id: 2, name: 'Running Shoes', price: 89.99, description: 'Lightweight shoes built for all-day comfort.' },
        { id: 3, name: 'Smart Watch', price: 199.99, description: 'Track fitness, messages, and sleep in one device.' }
    ];

    res.status(200).json({
        success: true,
        products,
        user: req.user
    });
});

module.exports = router;