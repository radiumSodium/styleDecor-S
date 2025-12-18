# ⚙️ StyleDecor Backend API

## 🔗 Live API URL  
👉 https://style-decor-s.vercel.app

---

## 📌 Project Name  
**StyleDecor – Backend Server**

---

## 🎯 Purpose  
This backend server powers the **StyleDecor** decoration booking platform.  
It provides secure REST APIs for authentication, service management, bookings, payments, and role-based dashboards for users, decorators, and administrators.

The server is built as a **serverless Express API** and deployed on **Vercel**, with MongoDB Atlas as the database and Stripe for payment processing.

---

## ✨ Key Features  

### 🔐 Authentication & Security
- JWT-based authentication  
- Role-based access control (User, Decorator, Admin)  
- Secure protected routes using middleware  
- CORS configuration for production & development  

### 🛎️ Booking Management
- Create and manage bookings  
- Cancel unpaid bookings  
- Booking status lifecycle tracking  
- Assign decorators and teams (Admin)  
- Decorators can update booking status  

### 💳 Payment System
- Stripe Payment Intent integration  
- Secure payment verification  
- Payment status tracking  
- Transaction history storage  

### 🧑‍🎨 User & Decorator Management
- User profile support  
- Decorator assignment & tracking  
- Role-based API access  

---

## 🧩 API Endpoints (Core)

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

### Services
- `GET /api/services`
- `GET /api/services/:id`

### Decorators
- `GET /api/decorators`

### Bookings
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/pay`
- `PATCH /api/bookings/:id/cancel`
- `PATCH /api/bookings/:id/status`
- `PATCH /api/bookings/:id/assign`
- `GET /api/bookings/all` (Admin)
- `GET /api/bookings/assigned` (Decorator)

### Payments
- `POST /api/payments/create-payment-intent`

---

## 🧱 Technologies Used  

### Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT  
- Stripe  
- dotenv  
- cors  

### Deployment
- Vercel (Serverless Functions)  
- MongoDB Atlas  

---

## 📦 NPM Packages Used

- express  
- mongoose  
- jsonwebtoken  
- stripe  
- dotenv  
- cors  

---
