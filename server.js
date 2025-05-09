const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userDataDir = path.join(__dirname, 'user-data');
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir);
}

const ipToPseudonym = new Map();
const pseudonymToSocket = new Map();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  const ip = socket.handshake.headers['x-forwarded-for']?.split(',')[0] || socket.handshake.address;
  console.log('Connection from IP:', ip);

  socket.on('register', (pseudonym) => {
    if (ipToPseudonym.has(ip)) {
      socket.emit('error', 'Only one pseudonym per IP is allowed.');
      return;
    }

    if (pseudonymToSocket.has(pseudonym)) {
      socket.emit('error', 'This pseudonym is already in use.');
      return;
    }

    ipToPseudonym.set(ip, pseudonym);
    pseudonymToSocket.set(pseudonym, socket);
    socket.pseudonym = pseudonym;
    socket.ip = ip;

    socket.emit('registered');
    io.emit('user-connected', pseudonym);
    console.log(`Registered: ${pseudonym} from ${ip}`);
  });

  socket.on('send-file', ({ to, filename, filedata }) => {
    const sender = socket.pseudonym;
    if (!sender || !pseudonymToSocket.has(to)) {
      socket.emit('error', 'Recipient not available.');
      return;
    }

    const recipientSocket = pseudonymToSocket.get(to);
    if (recipientSocket && recipientSocket.connected) {
      recipientSocket.emit('receive-file', {
        from: sender,
        filename,
        filedata
      });

      const safeFilename = filename.replace(/[^a-z0-9_.-]/gi, '_');
      const filepath = path.join(userDataDir, `${Date.now()}_${sender}_TO_${to}_${safeFilename}`);
      fs.writeFile(filepath, Buffer.from(filedata, 'base64'), (err) => {
        if (err) {
          console.error('Error saving file:', err);
        } else {
          console.log(`Saved file from ${sender} to ${to}: ${filename}`);
        }
      });
    } else {
      socket.emit('error', 'Recipient socket is not connected.');
    }
  });

  socket.on('disconnect', () => {
    const { pseudonym, ip } = socket;
    if (pseudonym) {
      pseudonymToSocket.delete(pseudonym);
      ipToPseudonym.delete(ip);
      io.emit('user-disconnected', pseudonym);
      console.log(`Disconnected: ${pseudonym} (${ip})`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`QuantumShare running at http://localhost:${PORT}`);
});
