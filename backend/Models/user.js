const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const friendSchema = new mongoose.Schema({
    friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    chatHistory: [messageSchema]
});

const userSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    friends: [friendSchema]
});

const userModel= mongoose.model('user',userSchema);
module.exports=userModel;