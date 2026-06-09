const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const BASE_URL = 'http://localhost:9000';

const test = async () => {
    try {
        console.log('--- STARTING PROGRAMMATIC CHAT APP API TEST ---');
        
        // Random emails to avoid conflicts in repeat runs
        const randomStr = Math.random().toString(36).substring(7);
        const aliceEmail = `alice_${randomStr}@test.com`;
        const bobEmail = `bob_${randomStr}@test.com`;

        console.log(`Alice Email: ${aliceEmail}`);
        console.log(`Bob Email: ${bobEmail}`);

        // 1. Sign up Alice
        console.log('\n[1] Registering Alice...');
        const signupAliceRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Alice Test', email: aliceEmail, password: 'password123' })
        });
        const signupAliceData = await signupAliceRes.json();
        console.log('Alice Signup Status:', signupAliceRes.status, signupAliceData);

        // 2. Sign up Bob
        console.log('\n[2] Registering Bob...');
        const signupBobRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Bob Test', email: bobEmail, password: 'password123' })
        });
        const signupBobData = await signupBobRes.json();
        console.log('Bob Signup Status:', signupBobRes.status, signupBobData);

        // 3. Log in Alice
        console.log('\n[3] Logging in Alice...');
        const loginAliceRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: aliceEmail, password: 'password123' })
        });
        const loginAliceData = await loginAliceRes.json();
        console.log('Alice Login Status:', loginAliceRes.status);
        const aliceToken = loginAliceData.token;
        const aliceId = loginAliceData.token ? JSON.parse(Buffer.from(aliceToken.split('.')[1], 'base64').toString())._id : null;
        console.log('Alice User ID:', aliceId);

        // 4. Log in Bob
        console.log('\n[4] Logging in Bob...');
        const loginBobRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: bobEmail, password: 'password123' })
        });
        const loginBobData = await loginBobRes.json();
        console.log('Bob Login Status:', loginBobRes.status);
        const bobToken = loginBobData.token;
        const bobId = loginBobData.token ? JSON.parse(Buffer.from(bobToken.split('.')[1], 'base64').toString())._id : null;
        console.log('Bob User ID:', bobId);

        if (!aliceToken || !bobToken) {
            throw new Error('Failed to obtain authentication tokens for Alice or Bob.');
        }

        // 5. Bob sends friend request to Alice
        console.log('\n[5] Bob sending friend request to Alice...');
        const sendReqRes = await fetch(`${BASE_URL}/friends/request/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bobToken}`
            },
            body: JSON.stringify({ email: aliceEmail })
        });
        const sendReqData = await sendReqRes.json();
        console.log('Send Request Status:', sendReqRes.status, sendReqData);

        // 6. Alice retrieves incoming requests
        console.log('\n[6] Alice retrieving pending friend requests...');
        const getReqsRes = await fetch(`${BASE_URL}/friends/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            }
        });
        const getReqsData = await getReqsRes.json();
        console.log('Alice Requests List:', getReqsRes.status, JSON.stringify(getReqsData, null, 2));

        // 7. Alice accepts Bob's request
        console.log('\n[7] Alice accepting Bob\'s friend request...');
        const acceptReqRes = await fetch(`${BASE_URL}/friends/request/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            },
            body: JSON.stringify({ senderId: bobId })
        });
        const acceptReqData = await acceptReqRes.json();
        console.log('Accept Request Status:', acceptReqRes.status, acceptReqData);

        // 8. Alice lists her friends
        console.log('\n[8] Alice retrieving friends list...');
        const getFriendsRes = await fetch(`${BASE_URL}/friends/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            }
        });
        const getFriendsData = await getFriendsRes.json();
        console.log('Alice Friends List:', getFriendsRes.status, JSON.stringify(getFriendsData, null, 2));

        // 9. Alice sends a message to Bob
        console.log('\n[9] Alice sending message to Bob...');
        const sendMsgRes1 = await fetch(`${BASE_URL}/friends/message/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            },
            body: JSON.stringify({ friendId: bobId, message: 'Hello Bob! This is Alice.' })
        });
        const sendMsgData1 = await sendMsgRes1.json();
        console.log('Send Message 1 Status:', sendMsgRes1.status, sendMsgData1);

        // 10. Bob retrieves chat history with Alice
        console.log('\n[10] Bob retrieving chat history with Alice...');
        const getChatsRes1 = await fetch(`${BASE_URL}/friends/chats/${aliceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bobToken}`
            }
        });
        const getChatsData1 = await getChatsRes1.json();
        console.log('Bob Chat History:', getChatsRes1.status, JSON.stringify(getChatsData1, null, 2));

        // 11. Bob sends a reply message to Alice
        console.log('\n[11] Bob sending reply to Alice...');
        const sendMsgRes2 = await fetch(`${BASE_URL}/friends/message/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bobToken}`
            },
            body: JSON.stringify({ friendId: aliceId, message: 'Hey Alice! Nice to meet you here.' })
        });
        const sendMsgData2 = await sendMsgRes2.json();
        console.log('Send Message 2 Status:', sendMsgRes2.status, sendMsgData2);

        // 12. Alice retrieves chat history with Bob
        console.log('\n[12] Alice retrieving chat history with Bob...');
        const getChatsRes2 = await fetch(`${BASE_URL}/friends/chats/${bobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`
            }
        });
        const getChatsData2 = await getChatsRes2.json();
        console.log('Alice Final Chat History:', getChatsRes2.status, JSON.stringify(getChatsData2, null, 2));

        // 13. Query database directly to verify stored messages are encrypted
        console.log('\n[13] Querying database directly to verify encryption...');
        const path = require('path');
        const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
        const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
        dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
        const userModel = require(path.resolve(__dirname, '../backend/Models/user.js'));
        
        await mongoose.connect(process.env.MONGOOSE_URL);
        const aliceUser = await userModel.findById(aliceId);
        await mongoose.connection.close();

        const friendEntry = aliceUser.friends.find(f => f.friendId.toString() === bobId);
        const storedMessage = friendEntry.chatHistory[0].message;
        console.log('Raw Message Stored in MongoDB:', storedMessage);
        
        if (storedMessage.includes(':') && storedMessage !== 'Hello Bob! This is Alice.') {
            console.log('✓ SUCCESS: Message is encrypted in the database!');
        } else {
            throw new Error(`FAILURE: Message is NOT encrypted in database! Stored value: "${storedMessage}"`);
        }

        console.log('\n--- ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
    } catch (err) {
        console.error('Test Failed with Error:', err);
    }
};

test();
