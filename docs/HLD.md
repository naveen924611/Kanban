# High-Level Design (HLD)

## 🎯 Objective
Design a real-time Kanban board that enables multiple users to collaborate and organize tasks efficiently using the MERN stack.

---

## 🏗️ Architecture Overview

```
Frontend (React.js + Tailwind)
        |
        |  REST API + WebSockets
        |
Backend (Express.js + Node.js + Socket.io)
        |
        |  MongoDB Driver
        |
Database (MongoDB)
```

- **Frontend:** Manages UI, drag-and-drop, and real-time board updates.  
- **Backend:** Provides APIs and manages Socket.io events for real-time communication.  
- **Database:** Stores boards, lists, cards, users, and activity logs.

---

## 🧩 Major Components

1. **Authentication**
   - Handles login, signup, and token verification using JWT.

2. **Workspace & Board Management**
   - Users can create boards, add members, and assign tasks.

3. **List & Card Management**
   - CRUD operations for lists and cards, supports drag-and-drop reordering.

4. **Real-time Sync**
   - Socket.io for broadcasting changes to connected clients instantly.

5. **Activity Tracking**
   - Logs all actions such as creating, updating, or deleting items.

---

## 🔁 Data Flow

1. User logs in → JWT issued.  
2. User creates/updates tasks → Saved in MongoDB.  
3. Real-time events are sent via Socket.io → All clients update instantly.  
4. Activity log records changes asynchronously.

---

## 🧠 Technology Choices

| Layer | Technology | Reason |
|-------|-------------|--------|
| Frontend | React.js | Efficient rendering, modular components |
| Backend | Express.js | Lightweight and flexible REST API handling |
| Database | MongoDB | Ideal for unstructured and nested data |
| Real-Time | Socket.io | Handles bi-directional communication easily |
| Auth | JWT | Simple and secure authentication |

---

## 💡 Future Enhancements

- Add Redis for caching and WebSocket scaling  
- Implement file uploads and email alerts  
- Deploy backend on cloud (Render/AWS) and MongoDB Atlas  
- Add analytics for board usage

---

**Current Stage:** Running locally with real-time collaboration and full CRUD operations.
