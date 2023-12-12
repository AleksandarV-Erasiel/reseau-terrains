const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const net = require('net');

const Users = require('./user.js');

////////////////////////////////
// INITIALIZATION //////////////
////////////////////////////////

loadUsersData();

// Start server
server.listen(port, () => {
    console.log('Server listening on port %d', port);
});

// Use body-parser middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Routing for client-side files
app.use(express.static(path.join(__dirname, 'public/pages')));

// Set the proper MIME type for JavaScript files
app.use('/clients', express.static(path.join(__dirname, 'public/clients'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.js') {
            res.setHeader('Content-Type', 'text/javascript');
        }
    },
}));

// Set the proper MIME type for CSS files
app.use('/styles', express.static(path.join(__dirname, 'public/styles'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.css') {
            res.setHeader('Content-Type', 'text/css');
        }
    },
}));

////////////////////////////////
// USEFUL FUNCTIONS ////////////
////////////////////////////////

/** Function to load users data from file
 */
function loadUsersData() {
    try {
        const data = fs.readFileSync('./persist/users.json', 'utf8');
        const userData = JSON.parse(data);

        for (const userObj of userData)
            Users.addUser(userObj);

        console.log('Users data loaded successfully.');
    } catch (err) {
        console.error('Error loading users data:', err);
    }
}

function updateUserPasswordInFile(username, newPassword) {
    try {
        const data = fs.readFileSync('./persist/users.json', 'utf8');
        const userData = JSON.parse(data);

        // Find the user in the array and update the password
        for (const userObj of userData) {
            if (userObj.username === username) {
                userObj.password = newPassword;
                break;
            }
        }

        // Write the updated data back to the file
        fs.writeFileSync('./persist/users.json', JSON.stringify(userData, null, 2), 'utf8');

        console.log(`Password for user ${username} updated in users.json file.`);
    } catch (err) {
        console.error('Error updating user password in users.json file:', err);
    }
}

/**
 * Sets the active state of a user and broadcasts the user state change to all connected sockets.
 *
 * @param {Socket} socket - The socket associated with the user.
 * @param {string} username - The username of the user.
 * @param {boolean} state - The active state of the user (true or false).
 */
function setUserActiveState(socket, username, state) {
    const user = Users.getUser(username);

    if (user)
        user.setActiveState(state);
}

////////////////////////////////
// IO SOCKET EXCHANGE //////////
////////////////////////////////

io.on('connection', (socket) => {
    let userLoggedIn = false;
    currentUsername = null;

    socket.on('verify-user-data', data => {
        const username = data.username;
        const password = data.password;
        const users = Users.getUsers();
        let doesExist = false;
        console.log(username + " " + password);

        for (const user of users)
            if (user.username === username && user.password === password)
                doesExist = true;

        if (doesExist) {
            console.log(username + " does exist");
            userLoggedIn = true;
            currentUsername = username;
            socket.emit('correct-user-data');
            const userConnectMessage = `User ${username} connected !`;
            sendToCServer(userConnectMessage);
        } else
            socket.emit('wrong-user-data');
    });

    socket.on('change-user-pwd', (data) => {
        const username = data.username;
        const oldPassword = data.oldPassword;
        const newPassword = data.newPassword;
        let userPassword = "";

        const users = Users.getUsers();
        for (const user of users) {
            if (user.username === username) {
                userPassword = user.password;
            }
        }
        if (userPassword === oldPassword) {
            userPassword = newPassword;
            console.log(`Password for user ${username} changed successfully.`);

            // Update the password in the users.json file
            updateUserPasswordInFile(username, newPassword);

            socket.emit('password-changed', { success: true });
        } else {
            console.log(`Failed to change password for user ${username}.`);
            socket.emit('password-changed', { success: false });
        }
    });

    socket.on('ask-for-video', (data) => {
        console.log("Btn ask for vid");
        sendBinaryData(["0", "1", "1"]);
    });

    socket.on('desactivate-alarm', (data) => {
        console.log("Btn ask for vid");
        sendBinaryData(["1", "1", "0"]);
    });

    socket.on('reconnect', () => {
        if (userLoggedIn) {
            setUserActiveState(socket, currentUsername, true);
        }
    });

    /////////////////
    // disconnects //
    /////////////////

    socket.on('disconnect', () => {
        if (userLoggedIn) {
            setUserActiveState(socket, currentUsername, false);
            io.emit('user-disconnected', { username: currentUsername });
        }
    });
});

////////////////////////////////
// Node.js Client //////////////
////////////////////////////////

const C_SERVER_PORT = 3000;
const C_SERVER_HOST = '192.168.6.110';

function sendToCServer(message) {
    cSocket.write(message);
}

function sendBinaryData(data) {
    const messageType = parseInt(data[0]);
    const messageSize = parseInt(data[1]);
    const binaryData = parseInt(data[2]);

    const buffer = Buffer.alloc(3);

    buffer.writeUInt8(messageType, 0);
    buffer.writeUInt8(messageSize, 1);
    buffer.writeUInt8(binaryData, 2);

    cSocket.write(buffer, () => {
        console.log('Binary data sent to C server');
    });
}

function handleCServerData(data) {
    const messageType = data.readUInt8(0);
    console.log('messageType :>> ', messageType);
    console.log('data.readUInt8(1) :>> ', data.readUInt8(1));
    console.log('data.readUInt8(2) :>> ', data.readUInt8(2));
    console.log('data.readUInt8(3) :>> ', data.readUInt8(3));
    console.log('data.readUInt8(4) :>> ', data.readUInt8(4));
    console.log('data.readUInt8(5) :>> ', data.readUInt8(5));
    console.log('data.readUInt8(6) :>> ', data.readUInt8(6));
    console.log('data.readUInt8(7) :>> ', data.readUInt8(7));
    console.log('data.readUInt8(8) :>> ', data.readUInt8(8));
    console.log('data.readUInt8(9) :>> ', data.readUInt8(9));
    console.log('data.readUInt8(10) :>> ', data.readUInt8(10));

    switch (messageType) {
        case 1:
            console.log('Received demande d\'image from C server');
            break;
        case 2:
            console.log('Received demande de désactivation from C server');
            break;
        case 3:
            console.log('Received etat de l\'appareil from C server');
            const ipAddress = data.slice(1, 5).join('.');
            const objectByte = data.readUInt8(5);
            const messageSize = data.readUInt8(6);
            
            if (data.length >= 7 + messageSize) {
                const messageData = data.slice(7, 7 + messageSize);
                console.log('IP Address:', ipAddress);
                console.log('Object Byte:', objectByte);
                console.log('Message Size:', messageSize);
                console.log('Message Data:', messageData.toString());
            } else
                console.log('Incomplete message received for etat de l\'appareil');
            break;
        default:
            console.log('Unknown message type received from C server');
    }
}

const cSocket = net.connect(C_SERVER_PORT, C_SERVER_HOST, () => {
    console.log('Connected to C server');
    sendToCServer('Hello from Node.js');
    // cSocket.end(); // Close the connection after sending the message
});



cSocket.on('data', (data) => {
    console.log('Received data from C server:', data.toString());
    handleCServerData(data);
});

cSocket.on('end', () => {
    console.log('Disconnected from C server');
});

cSocket.on('error', (err) => {
    console.error('Socket error:', err);
});

cSocket.on('close', () => {
    console.log('Connection closed');
});