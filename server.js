"use strict";

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('./public'));
app.use(cookieParser());

// Storage for application state
const sessions = {};
const messagesList = [];
const directMessagesList = [];
const usersSessionMap = {};
const userLastSeen = {};

function generateUUID() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]+$/.test(username) && username.length <= 20;
}

function getUniqueLoggedInUsers() {
  const uniqueUsers = new Set();
  Object.values(sessions).forEach(session => {
    uniqueUsers.add(session.username);
  });
  return Array.from(uniqueUsers);
}

app.get('/api/v1/session', (req, res) => {
  const sid = req.cookies.sid;
  if (sid && sessions[sid]) {
    return res.json({ username: sessions[sid].username });
  }
  return res.status(401).json({ error: 'Not logged in' });
});

app.post('/api/v1/session', (req, res) => {
  const { username } = req.body;
  
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  if (username === 'dog') {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  const sid = generateUUID();
  sessions[sid] = { username };
  
  if (!usersSessionMap[username]) {
    usersSessionMap[username] = new Set();
  }
  usersSessionMap[username].add(sid);

  if (!userLastSeen[username]) {
    userLastSeen[username] = 0;
  }
  
  res.cookie('sid', sid, { 
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'strict',
    httpOnly: true
  });
  
  res.json({ username });
});

// Logout
app.delete('/api/v1/session', (req, res) => {
  const sid = req.cookies.sid;
  if (sid && sessions[sid]) {
    const username = sessions[sid].username;
    
    delete sessions[sid];
    
    if (usersSessionMap[username]) {
      usersSessionMap[username].delete(sid);
      
      if (usersSessionMap[username].size === 0) {
        delete usersSessionMap[username];
      }
    }
    
    res.clearCookie('sid');
    return res.json({ success: true });
  }
  
  return res.status(401).json({ error: 'Not logged in' });
});

app.get('/api/v1/chat', (req, res) => {
  const sid = req.cookies.sid;
  if (!sid || !sessions[sid]) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  const username = sessions[sid].username;
  const users = getUniqueLoggedInUsers();
  const since = req.query.since ? parseInt(req.query.since, 10) : 0;
  
  const messages = since ? 
    messagesList.filter(msg => msg.timestamp > since) : 
    messagesList;
  
  userLastSeen[username] = Date.now();
  
  res.json({
    messages: messages,
    users: users,
    timestamp: Date.now()
  });
});

app.post('/api/v1/messages', (req, res) => {
  const sid = req.cookies.sid;
  if (!sid || !sessions[sid]) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  const { text } = req.body;
  const username = sessions[sid].username;
  
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Empty message not allowed' });
  }
  
  const message = {
    id: messagesList.length + 1,
    username,
    text,
    timestamp: Date.now(),
    isDM: false
  };
  
  messagesList.push(message);
  
  res.json(message);
});

app.post('/api/v1/direct-messages', (req, res) => {
  const sid = req.cookies.sid;
  if (!sid || !sessions[sid]) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  const { text, recipient } = req.body;
  const sender = sessions[sid].username;
  
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Empty message not allowed' });
  }
  
  if (!recipient || typeof recipient !== 'string') {
    return res.status(400).json({ error: 'Invalid recipient' });
  }
  
  const users = getUniqueLoggedInUsers();
  if (!users.includes(recipient)) {
    return res.status(400).json({ error: 'Recipient not found or not online' });
  }
  
  const message = {
    id: directMessagesList.length + 1,
    username: sender,
    recipient: recipient,
    text,
    timestamp: Date.now(),
    isDM: true
  };
  
  directMessagesList.push(message);
  
  res.json(message);
});

app.get('/api/v1/direct-messages', (req, res) => {
  const sid = req.cookies.sid;
  if (!sid || !sessions[sid]) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  const username = sessions[sid].username;
  const since = req.query.since ? parseInt(req.query.since, 10) : 0;
  
  const messages = directMessagesList.filter(msg => 
    (msg.username === username || msg.recipient === username) &&
    (since === 0 || msg.timestamp > since)
  );
  
  res.json({
    messages: messages,
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
}); 