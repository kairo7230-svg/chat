require('dotenv').config();
const express = require('express');
const cors = require('cors');
// require('body-parser') is no longer strictly necessary, but perfectly fine if kept!

require('./Models/db.js');
const authRouter = require('./routes/authRoutes.js');
const productRouter = require('./routes/productRouter.js');
const app = express();
const PORT = process.env.PORT || 9000; // Cleaned up the double semicolon

// 1. Middleware
app.use(cors());
app.use(express.json()); // Built-in alternative to bodyParser.json()

// 2. Routes
app.use('/auth', authRouter);
app.use('/product', productRouter);

app.get('/', (req, res) => {
    res.send("yh");
});

// 3. Start Server
app.listen(PORT, () => {
    console.log(`server started on ${PORT}`);
});
