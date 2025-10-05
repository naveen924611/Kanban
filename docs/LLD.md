#  Low-Level Design (LLD)

## Database Schema Overview

### User
- name: String  
- email: String (unique)  
- password: String (hashed)  
- avatar: String (URL)

### Workspace
- name: String  
- owner: ObjectId (User)  
- members: [ObjectId]

### Board
- title: String  
- workspace: ObjectId (Workspace)  
- color: String  
- visibility: String ('private' / 'workspace' / 'public')  
- members: [ObjectId]

### List
- title: String  
- board: ObjectId  
- position: Number

### Card
- title: String  
- description: String  
- list: ObjectId  
- board: ObjectId  
- labels: [{ text, color }]  
- assignees: [ObjectId]  
- dueDate: Date

### Comment
- card: ObjectId  
- user: ObjectId  
- text: String

### Activity
- board: ObjectId  
- user: ObjectId  
- action: String  
- metadata: Object

---

##  API Endpoints (Summary)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/workspaces | Get all user workspaces |
| POST | /api/workspaces | Create new workspace |
| GET | /api/boards/:id | Get board details |
| POST | /api/boards | Create new board |
| PUT | /api/cards/:id | Update a card |
| DELETE | /api/cards/:id | Delete card |

---

##  Socket.io Events

| Event | Trigger | Action |
|--------|----------|--------|
| `card:created` | When new card is added | Broadcast to all users in board |
| `card:moved` | On drag and drop | Update positions in DB and UI |
| `comment:added` | New comment posted | Notify users in the same board |
| `user:joined` | User opens board | Add to Socket.io room |

---

##  Backend Logic Summary

- **Auth Middleware:** Verifies JWT and attaches `req.user`  
- **Error Handling:** Global try/catch + Express middleware  
- **DB Operations:** All models use Mongoose ORM  
- **Positioning:** Fractional indexes to avoid full reorder updates  

---

##  Frontend Component Hierarchy

```
App
 ├── Login / Signup
 ├── Dashboard
 │    └── BoardList
 └── BoardPage
      ├── ListColumn
      │    └── CardItem
      └── CardModal
```

---

##  Future Enhancements

- Add file attachments for cards  
- Implement notification system  
- Add offline mode with local caching  
- Introduce role-based access (Admin, Editor, Viewer)

---
