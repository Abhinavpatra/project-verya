## **1. User Management**

### **Routes**
- **File**: `backend/routes/userRoutes.js`
- **Endpoints**:
  - `POST /api/users` – Register a new user
  - `POST /api/users/login` – Authenticate user and get a JWT token
  - `GET /api/users` – Search for users (protected)
  - `GET /api/users/profile` – Fetch the logged-in user's profile (protected)
  - `PUT /api/users/status` – Update the user's status (protected)

### **Controller**
- **File**: `backend/controllers/userController.js`

#### **Register a New User**
- **Route**: `POST /api/users`
- **Operation**:
  1. Check if the user already exists using the email.
  2. If not, create a new user in the database.
  3. Generate a JWT token for the user.
  4. Return the user details and token.

#### **Authenticate User**
- **Route**: `POST /api/users/login`
- **Operation**:
  1. Validate the email and password.
  2. If valid, update the user's status to `online`.
  3. Generate a JWT token and return the user details.

#### **Get User Profile**
- **Route**: `GET /api/users/profile`
- **Operation**:
  1. Fetch the logged-in user's details using the `req.user` object (set by the `authMiddleware`).
  2. Return the user's details.

#### **Update User Status**
- **Route**: `PUT /api/users/status`
- **Operation**:
  1. Update the user's status (e.g., `online`, `offline`, `away`) and `lastSeen` timestamp.
  2. Save the updated user in the database.

#### **Search Users**
- **Route**: `GET /api/users`
- **Operation**:
  1. Search for users by `username` or `email` using a regex query.
  2. Exclude the logged-in user from the results.
  3. Return the list of matching users.

---

## **2. Chat Management**

### **Routes**
- **File**: `backend/routes/chatRoutes.js`
- **Endpoints**:
  - `POST /api/chats` – Create or access a one-to-one chat
  - `GET /api/chats` – Get all chats for the logged-in user
  - `POST /api/chats/group` – Create a group chat
  - `PUT /api/chats/group/rename` – Rename a group chat
  - `PUT /api/chats/group/add` – Add a user to a group chat
  - `PUT /api/chats/group/remove` – Remove a user from a group chat

### **Controller**
- **File**: `backend/controllers/chatController.js`

#### **Access or Create a One-to-One Chat**
- **Route**: `POST /api/chats`
- **Operation**:
  1. Check if a one-to-one chat already exists between the logged-in user and the target user.
  2. If it exists, return the chat.
  3. If not, create a new chat and return it.

#### **Get All Chats**
- **Route**: `GET /api/chats`
- **Operation**:
  1. Fetch all chats where the logged-in user is a participant.
  2. Populate the `users`, `groupAdmin`, and `latestMessage` fields.
  3. Sort the chats by the `updatedAt` field in descending order.
  4. Return the list of chats.

#### **Create a Group Chat**
- **Route**: `POST /api/chats/group`
- **Operation**:
  1. Validate the group name and users.
  2. Add the logged-in user to the group.
  3. Create a new group chat and return it.

#### **Rename a Group Chat**
- **Route**: `PUT /api/chats/group/rename`
- **Operation**:
  1. Update the `chatName` of the specified group chat.
  2. Return the updated chat.

#### **Add a User to a Group**
- **Route**: `PUT /api/chats/group/add`
- **Operation**:
  1. Add the specified user to the group's `users` array.
  2. Return the updated group chat.

#### **Remove a User from a Group**
- **Route**: `PUT /api/chats/group/remove`
- **Operation**:
  1. Remove the specified user from the group's `users` array.
  2. Return the updated group chat.

---

## **3. Messaging**

### **Routes**
- **File**: `backend/routes/messageRoutes.js`
- **Endpoints**:
  - `POST /api/messages` – Send a new message
  - `GET /api/messages/:chatId` – Get all messages for a chat
  - `PUT /api/messages/read/:chatId` – Mark messages as read

### **Controller**
- **File**: `backend/controllers/messageController.js`

#### **Send a New Message**
- **Route**: `POST /api/messages`
- **Operation**:
  1. Create a new message in the database.
  2. Populate the `sender` and `chatId` fields.
  3. Update the `latestMessage` field of the chat.
  4. Return the created message.

#### **Get All Messages for a Chat**
- **Route**: `GET /api/messages/:chatId`
- **Operation**:
  1. Fetch all messages for the specified chat.
  2. Populate the `sender` and `readBy` fields.
  3. Return the list of messages.

#### **Mark Messages as Read**
- **Route**: `PUT /api/messages/read/:chatId`
- **Operation**:
  1. Update all unread messages in the chat to include the logged-in user in the `readBy` array.
  2. Return the number of messages marked as read.

---

## **4. WebSocket Server**

### **File**
- **File**: `backend/websocket/wsServer.js`

### **Operations**
- **Authentication**:
  - Verify the JWT token sent by the client.
  - Mark the user as `online` and store the WebSocket connection.

- **Real-Time Messaging**:
  - Broadcast new messages to the recipients in the chat.

- **Typing Indicator**:
  - Notify chat participants when a user is typing.

- **Read Receipts**:
  - Notify the sender when their message is read.

- **User Status**:
  - Broadcast `online`/`offline` status changes to all connected users.

---

## **5. Middleware**

### **Authentication Middleware**
- **File**: `backend/middleware/authMiddleware.js`
- **Operation**:
  1. Extract the JWT token from the `Authorization` header.
  2. Verify the token and attach the user to the `req` object.
  3. If the token is invalid or missing, return a `401 Unauthorized` error.

---

## **6. Database Models**

### **User Model**
- **File**: `backend/models/userModel.js`
- **Fields**:
  - `username`, `email`, `password`, `avatar`, `status`, `lastSeen`

### **Chat Model**
- **File**: `backend/models/chatModel.js`
- **Fields**:
  - `chatName`, `isGroupChat`, `users`, `latestMessage`, `groupAdmin`

### **Message Model**
- **File**: `backend/models/messageModel.js`
- **Fields**:
  - `sender`, `content`, `chatId`, `readBy`

---
