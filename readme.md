# Peafowl — Real-Time Scalable Chat Application

Peafowl is a full-stack real-time chat application inspired by modern messaging platforms like WhatsApp.

Built using the MERN stack with Socket.IO and Redis, the project focuses on scalable real-time communication, presence tracking, and modular backend architecture.

## Tech Stack

### Frontend
- React
- Vite
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- Redis
- MongoDB
- JWT Authentication

---

# Features

- Real-time one-to-one messaging
- Socket.IO powered bidirectional communication
- Redis Pub/Sub for scalable socket event distribution
- Online/offline user presence
- Typing indicators
- Persistent chat storage with MongoDB
- JWT-based authentication
- Modular backend architecture
- Rate limiting and middleware support
- Responsive React UI

---

# Architecture Overview

```text
React Client
     │
Socket.IO + REST APIs
     │
Express + Socket.IO Server
     │
Redis Pub/Sub Adapter
     │
MongoDB
```

---

# Project Structure

```text
peafowl/
│
├── client/        # React frontend
├── server/        # Express + Socket.IO backend
│
├── README.md
└── .env.example
```

---

# Environment Variables

Create a `.env` file inside the `server/` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379
```

---

# Getting Started

## 1. Clone Repository

```bash
git clone <repo-url>
cd peafowl
```

---

## 2. Start Backend Server

```bash
cd server
npm install
npm run dev
```

---

## 3. Start Frontend Client

```bash
cd client
npm install
npm run dev
```

---

# Upcoming Features

- Group chats
- Message seen/delivery status
- Media/file sharing
- Voice/video calling
- End-to-end encryption
- Push notifications

---

# Learning Goals

This project is primarily focused on learning and implementing:

- Real-time system design
- WebSocket communication
- Redis Pub/Sub architecture
- Scalable socket handling
- Full-stack application structure
- Authentication and session handling