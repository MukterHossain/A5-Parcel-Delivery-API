# Parcel Delivery API

### **✅ Project Overview**

Parcel Delivery API is a backend service for managing parcel delivery operations. It support roles like Admin, Sender and Receiver, enabling parcel creation, traking, status update, and delivery managemant. The API includes features like role-based action, status logs, and authentication (Google and credentials) 

---

### **✅ Funtional Implimentation**
- ✡️ JWT-based loging system with three roles: `admin`, `sender`, `receiver`
- ✡️ Password secure with hashed
- ✡️ Senders can:
    - Create parcel delivery request
    - Cancel parcel (if not dispatched)
    - View all their parcels and status logs
- ✡️ Receivrs can:
    - View incoming parcels
    - Confirm parcel delivery
    - Delivery history
- ✡️ Admin can:
    - View and manage all users and parcels
    - Block or unblock users and parcels 
    - Update delevery status
- ✡️ All parcel and their status changes **stored and trackable**
- ✡️ Role based route
  
---

## **🧩 All API endpoinds**

### **💼 Auth API endpoinds**
  🔹`POST(/api/auth/login)`  for all users credential login
  🔹`POST(/api/auth/refresh-token)`  Fefresh token generate
  🔹`POST(/api/auth/logout)`  Logout user
  🔹`get(/api/auth/google)`  Google login
  🔹`get(/api/auth/google/callback)` 
   Google callback

### **💼 User API endpoinds**
  🔹`POST(/api/user/register)`  create user (any user)
  🔹`GET(/api/user/all-users)`  get all users (admin and supper admin)
  🔹`PATCH(/api/user/:id)`  upadte user
  🔹`PATCH(/api/user/block/:id)`  User block (by admin)
  🔹`PATCH(/api/user/unblock/:id)`  User unblock or active (by admin)

### **💼 Parcel API endpoinds**
  **Sender**
  🔹`POST(/api/parcels/)`  create parcel
  🔹`GET(/api/parcels/me)`  get all parcels
  🔹`PATCH(/api/parcels/cancel:id)`  cancel parcels
    **Sender and Receiver**
  🔹`GET(/api/parcels/:id/status-log)`  get Parcel status log
    **Receiver**
  🔹`GET(/api/parcels/incoming)`  get incoming parcel
  🔹`PATCH(/api/parcels/confirm-delivery/:id)`  confirm delivery
  🔹`GET(/api/parcels/delivery-history)`  get delivery history
    **Admin**
  🔹`GET(/api/parcels/)`  get all parcels
  🔹`PATCH(/api/parcels/status-update/:id)`  update status
  🔹`PATCH(/api/parcels/block/:id)`  Block parcel
  **All user**
  🔹`PATCH(/api/parcels/track/:trackingId)`  Block parcel
  
---

### **✅ Project setup and environment**
- To set up the Parcel Delivery API, `Typescript`, `express`, `mongoose`, `zod`, `jsonwebtoken`, `cors`, `dotenv`, `bcryptsjs`, `cookie-parser`, `passport-local and passport-google-oauth20`, `express-session` install and use. Configure `.env` with MongoDB URL, JWT secrets, OAuth credentials, and so on. Start the server using `npm run dev`. MongoDB is running locally and in the clout. Use Postman for testing API endpoints securely.