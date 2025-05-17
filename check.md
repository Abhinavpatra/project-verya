

## **1. User Management**

### **Routes**
- **File**: userRoutes.js

### **Endpoints**

#### **Register a New User**
- **Route**: `POST /api/users`
- **Request Payload**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "_id": "userId",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "avatar": "",
      "status": "offline",
      "token": "jwt_token"
    }
    ```
  - **Error (400)**: `{"message": "User already exists"}`

---

#### **Authenticate User**
- **Route**: `POST /api/users/login`
- **Request Payload**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "userId",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "avatar": "",
      "status": "online",
      "token": "jwt_token"
    }
    ```
  - **Error (401)**: `{"message": "Invalid email or password"}`

---

#### **Get User Profile**
- **Route**: `GET /api/users/profile`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "userId",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "avatar": "",
      "status": "online"
    }
    ```
  - **Error (401)**: `{"message": "Not authorized, token failed"}`

---

#### **Update User Status**
- **Route**: `PUT /api/users/status`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "status": "away"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "userId",
      "status": "away",
      "lastSeen": "2025-05-07T12:00:00.000Z"
    }
    ```
  - **Error (404)**: `{"message": "User not found"}`

---

#### **Search Users**
- **Route**: `GET /api/users?search=john`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    [
      {
        "_id": "userId",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "avatar": "",
        "status": "online"
      }
    ]
    ```
  - **Error (500)**: `{"message": "Server Error"}`

---

## **2. Chat Management**

### **Routes**
- **File**: chatRoutes.js

### **Endpoints**

#### **Access or Create a One-to-One Chat**
- **Route**: `POST /api/chats`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "userId": "targetUserId"
  }
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "_id": "chatId",
      "chatName": "sender",
      "isGroupChat": false,
      "users": [
        { "_id": "userId", "username": "johndoe", "email": "johndoe@example.com" },
        { "_id": "targetUserId", "username": "janedoe", "email": "janedoe@example.com" }
      ]
    }
    ```
  - **Error (400)**: `{"message": "UserId param not sent with request"}`

---

#### **Get All Chats**
- **Route**: `GET /api/chats`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    [
      {
        "_id": "chatId",
        "chatName": "Group Chat",
        "isGroupChat": true,
        "users": [
          { "_id": "userId", "username": "johndoe" },
          { "_id": "targetUserId", "username": "janedoe" }
        ],
        "latestMessage": {
          "_id": "messageId",
          "content": "Hello!",
          "sender": { "_id": "userId", "username": "johndoe" }
        }
      }
    ]
    ```
  - **Error (500)**: `{"message": "Server Error"}`

---

#### **Create a Group Chat**
- **Route**: `POST /api/chats/group`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "name": "Group Chat",
    "users": ["userId1", "userId2"]
  }
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "_id": "chatId",
      "chatName": "Group Chat",
      "isGroupChat": true,
      "users": [
        { "_id": "userId", "username": "johndoe" },
        { "_id": "userId1", "username": "janedoe" },
        { "_id": "userId2", "username": "alexdoe" }
      ],
      "groupAdmin": { "_id": "userId", "username": "johndoe" }
    }
    ```
  - **Error (400)**: `{"message": "More than 2 users are required to form a group chat"}`

---

#### **Rename a Group Chat**
- **Route**: `PUT /api/chats/group/rename`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "chatId": "chatId",
    "chatName": "New Group Name"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "chatId",
      "chatName": "New Group Name",
      "isGroupChat": true
    }
    ```
  - **Error (404)**: `{"message": "Chat not found"}`

---

#### **Add a User to a Group**
- **Route**: `PUT /api/chats/group/add`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "chatId": "chatId",
    "userId": "newUserId"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "chatId",
      "users": [
        { "_id": "userId", "username": "johndoe" },
        { "_id": "newUserId", "username": "alexdoe" }
      ]
    }
    ```
  - **Error (404)**: `{"message": "Chat not found"}`

---

#### **Remove a User from a Group**
- **Route**: `PUT /api/chats/group/remove`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "chatId": "chatId",
    "userId": "userIdToRemove"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "_id": "chatId",
      "users": [
        { "_id": "userId", "username": "johndoe" }
      ]
    }
    ```
  - **Error (404)**: `{"message": "Chat not found"}`

---

## **3. Messaging**

### **Routes**
- **File**: messageRoutes.js

### **Endpoints**

#### **Send a New Message**
- **Route**: `POST /api/messages`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Request Payload**:
  ```json
  {
    "content": "Hello!",
    "chatId": "chatId"
  }
  ```
- **Response**:
  - **Success (201)**:
    ```json
    {
      "_id": "messageId",
      "content": "Hello!",
      "sender": { "_id": "userId", "username": "johndoe" },
      "chatId": "chatId",
      "readBy": ["userId"]
    }
    ```
  - **Error (400)**: `{"message": "Please provide content and chatId"}`

---

#### **Get All Messages for a Chat**
- **Route**: `GET /api/messages/:chatId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    [
      {
        "_id": "messageId",
        "content": "Hello!",
        "sender": { "_id": "userId", "username": "johndoe" },
        "readBy": ["userId"]
      }
    ]
    ```
  - **Error (500)**: `{"message": "Server Error"}`

---

#### **Mark Messages as Read**
- **Route**: `PUT /api/messages/read/:chatId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer jwt_token"
  }
  ```
- **Response**:
  - **Success (200)**:
    ```json
    {
      "success": true,
      "count": 5
    }
    ```
  - **Error (500)**: `{"message": "Server Error"}`

---

This detailed breakdown includes the expected request payloads, headers, and responses for each backend operation.