# Kanban Board Application

A collaborative **Kanban board** application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.  
It helps teams organize tasks, manage projects, and collaborate efficiently — similar to Trello.

---

## 🧩 Tech Stack

**Frontend:** React.js, React Hooks, Tailwind CSS, react-beautiful-dnd  
**Backend:** Node.js, Express.js, MongoDB, Socket.io  
**Authentication:** JWT (JSON Web Token)

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14 or above)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file (based on `.env.example`):
```env
MONGO_URI=mongodb://localhost:27017/kanban
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```
Start the backend:
```bash
node seedData.js
npm start
```
Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```
Start frontend:
```bash
npm run dev
```
App opens at: `http://localhost:5173`

---

## 👥 Default Login Credentials

- **john@example.com** / password: `password123`  
- **jane@example.com** / password: `password123`

---

## 🗄️ Database Overview

The application uses MongoDB collections for users, workspaces, boards, lists, cards, comments, and activity logs.  
Each collection is related using ObjectIds to maintain data relationships cleanly.

Detailed schema: [docs/LLD.md](docs/LLD.md)

---

## 🚀 Features Implemented

- User authentication (JWT)
- Create and manage multiple boards
- Drag and drop cards between lists
- Real-time updates using Socket.io
- Card details with comments and labels
- Activity logging for boards
- Search and filter cards
- Board color customization
- Add/remove members from boards

---

## 🔄 Real-Time Collaboration

- Socket.io enables instant updates.
- Each board acts as its own real-time room.
- Moving or creating a card updates all active users instantly.

More details: [docs/HLD.md](docs/HLD.md)

---

## 🧠 About This Project

This project was created as a **learning project** to explore how real-world collaborative tools like Trello work.  
Currently, everything runs locally — future versions will include **cloud deployment, email notifications, and file handling**.

---

**License:** MIT  
Built with curiosity and ☕.
