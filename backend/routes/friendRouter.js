const ensureAuthenticated = require('../Middleware/auth.js');
const router = require('express').Router();
const {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getChatHistory,
    sendMessage
} = require('../Controllers/friendController.js');

router.get('/list', ensureAuthenticated, getFriends);
router.get('/requests', ensureAuthenticated, getFriendRequests);
router.post('/request/send', ensureAuthenticated, sendFriendRequest);
router.post('/request/accept', ensureAuthenticated, acceptFriendRequest);
router.post('/request/decline', ensureAuthenticated, declineFriendRequest);
router.get('/chats/:friendId', ensureAuthenticated, getChatHistory);
router.post('/message/send', ensureAuthenticated, sendMessage);

module.exports = router;
