const userModel = require('../Models/user.js');
const { encrypt, decrypt } = require('../utils/encryption.js');


// 1. Get Friends
const getFriends = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('friends.friendId', 'name email');
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        
        // Map friends list to a clean, simplified list
        const friendsList = user.friends.map(f => {
            if (!f.friendId) return null; // safety check in case a friend user was deleted from db
            return {
                id: f.friendId._id,
                name: f.friendId.name,
                email: f.friendId.email
            };
        }).filter(Boolean);

        return res.status(200).json({
            success: true,
            friends: friendsList
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 2. Get Friend Requests
const getFriendRequests = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate('friendRequests', 'name email');
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const requests = user.friendRequests.map(r => ({
            id: r._id,
            name: r.name,
            email: r.email
        }));

        return res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 3. Send Friend Request
const sendFriendRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false });
        }

        const currentUser = await userModel.findById(req.user._id);
        const targetUser = await userModel.findOne({ email });

        if (!targetUser) {
            return res.status(404).json({ message: "User with this email not found", success: false });
        }

        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({ message: "You cannot add yourself as a friend", success: false });
        }

        // Check if already friends
        const isAlreadyFriend = currentUser.friends.some(f => f.friendId.toString() === targetUser._id.toString());
        if (isAlreadyFriend) {
            return res.status(400).json({ message: "You are already friends with this user", success: false });
        }

        // Check if request is already sent
        const isRequestSent = targetUser.friendRequests.includes(currentUser._id);
        if (isRequestSent) {
            return res.status(400).json({ message: "Friend request already sent", success: false });
        }

        // Check if target has already sent current user a request (auto-accept or notify)
        const hasIncomingRequest = currentUser.friendRequests.includes(targetUser._id);
        if (hasIncomingRequest) {
            return res.status(400).json({ message: "This user has already sent you a friend request. Please accept it.", success: false });
        }

        // Send request
        targetUser.friendRequests.push(currentUser._id);
        currentUser.sentRequests.push(targetUser._id);

        await targetUser.save();
        await currentUser.save();

        return res.status(200).json({
            message: "Friend request sent successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 4. Accept Friend Request
const acceptFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.body;
        if (!senderId) {
            return res.status(400).json({ message: "Sender ID is required", success: false });
        }

        const currentUser = await userModel.findById(req.user._id);
        const senderUser = await userModel.findById(senderId);

        if (!senderUser) {
            return res.status(404).json({ message: "Sender not found", success: false });
        }

        // Check if request actually exists
        const requestIndex = currentUser.friendRequests.indexOf(senderId);
        if (requestIndex === -1) {
            return res.status(400).json({ message: "No pending friend request from this user", success: false });
        }

        // Remove from pending lists
        currentUser.friendRequests.splice(requestIndex, 1);
        
        const sentRequestIndex = senderUser.sentRequests.indexOf(currentUser._id);
        if (sentRequestIndex !== -1) {
            senderUser.sentRequests.splice(sentRequestIndex, 1);
        }

        // Add to both users' friends arrays
        currentUser.friends.push({ friendId: senderUser._id, chatHistory: [] });
        senderUser.friends.push({ friendId: currentUser._id, chatHistory: [] });

        await currentUser.save();
        await senderUser.save();

        return res.status(200).json({
            message: "Friend request accepted",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 5. Decline Friend Request
const declineFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.body;
        if (!senderId) {
            return res.status(400).json({ message: "Sender ID is required", success: false });
        }

        const currentUser = await userModel.findById(req.user._id);
        const senderUser = await userModel.findById(senderId);

        // Remove from current user's incoming friendRequests
        const requestIndex = currentUser.friendRequests.indexOf(senderId);
        if (requestIndex !== -1) {
            currentUser.friendRequests.splice(requestIndex, 1);
        }

        // Remove from sender's outgoing sentRequests
        if (senderUser) {
            const sentRequestIndex = senderUser.sentRequests.indexOf(currentUser._id);
            if (sentRequestIndex !== -1) {
                senderUser.sentRequests.splice(sentRequestIndex, 1);
            }
            await senderUser.save();
        }

        await currentUser.save();

        return res.status(200).json({
            message: "Friend request declined",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 6. Get Chat History
const getChatHistory = async (req, res) => {
    try {
        const { friendId } = req.params;
        const currentUser = await userModel.findById(req.user._id);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const friendEntry = currentUser.friends.find(f => f.friendId.toString() === friendId);
        if (!friendEntry) {
            return res.status(404).json({ message: "You are not friends with this user", success: false });
        }

        // Decrypt the messages before returning to the user
        const decryptedHistory = friendEntry.chatHistory.map(m => {
            const mObj = m.toObject();
            mObj.message = decrypt(mObj.message);
            return mObj;
        });

        return res.status(200).json({
            success: true,
            chatHistory: decryptedHistory
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

// 7. Send Message
const sendMessage = async (req, res) => {
    try {
        const { friendId, message } = req.body;
        if (!friendId || !message || message.trim() === '') {
            return res.status(400).json({ message: "Friend ID and message content are required", success: false });
        }

        const currentUser = await userModel.findById(req.user._id);
        const friendUser = await userModel.findById(friendId);

        if (!currentUser || !friendUser) {
            return res.status(404).json({ message: "User(s) not found", success: false });
        }

        const meToFriend = currentUser.friends.find(f => f.friendId.toString() === friendId);
        const friendToMe = friendUser.friends.find(f => f.friendId.toString() === currentUser._id.toString());

        if (!meToFriend || !friendToMe) {
            return res.status(400).json({ message: "You are not friends with this user", success: false });
        }

        // Encrypt the message text
        const encryptedText = encrypt(message.trim());

        const newMessage = {
            sender: currentUser._id,
            message: encryptedText,
            timestamp: new Date()
        };

        // Push message to both chat histories
        meToFriend.chatHistory.push(newMessage);
        friendToMe.chatHistory.push(newMessage);

        await currentUser.save();
        await friendUser.save();

        // Return the plain text message to the sender client so it's transparent
        const clientMessage = {
            sender: currentUser._id,
            message: message.trim(),
            timestamp: newMessage.timestamp
        };

        return res.status(201).json({
            success: true,
            message: clientMessage
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
    }
};

module.exports = {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getChatHistory,
    sendMessage
};
