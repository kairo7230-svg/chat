// 1. Force Node.js to use Google's Public DNS to bypass cellular/ISP blocking
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// 2. Load Environment Variables and Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 3. Connect to Database (Now running smoothly using Google DNS)
require('./Models/db.js');

const authRouter = require('./routes/authRoutes.js');
const friendRouter = require('./routes/friendRouter.js');
const app = express();
const PORT = process.env.PORT || 9000;

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Routes
app.use('/auth', authRouter);
app.use('/friends', friendRouter);

app.get('/', (req, res) => {
    res.send("yh");
});

// 6. Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`server started on ${PORT}`);
    });
}

module.exports = app;
