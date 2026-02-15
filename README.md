


# 🔐 LinkVault

LinkVault is a secure, full-stack file and text sharing application that allows users to upload files or text and generate a unique, temporary sharing link.

It includes enterprise-grade security features such as **Password Protection**, **One-Time Views**, **Access Limits**, and **Automatic Expiry** making it ideal for private, temporary content sharing.

---

## 🚀 Features

### 🧩 Core Features

- **Dual Upload Modes**  
  Upload **Files** (Images, PDFs, etc.) or share **Rich Text**.

- **Smart Expiry**  
  Choose automatic expiration:
  - 10 Minutes  
  - 1 Hour  
  - 1 Day  

- **Secure Access**  
  Content is accessible only via a cryptographically generated short ID.

- **Cleanup Automation**  
  Background cron jobs ensure expired content is permanently deleted.

---

### 🌟 Advanced (Bonus) Features

- 🔒 **Password Protection**  
  Lock links with a custom password (securely hashed using `bcrypt`).

- 🔥 **One-Time View (Burn After Reading)**  
  Automatically destroys content immediately after a single successful view.

- 🛑 **Access Limits**  
  Set a maximum number of downloads before the link expires.

- 🗑️ **Manual Deletion (Admin Token)**  
  Each upload generates a secret token that allows the creator to manually delete content before expiry.

---

## 🛠️ Tech Stack

### 🌐 Frontend

- **React (Vite)** – Fast and modern SPA
- **Tailwind CSS** – Clean, responsive UI
- **Axios** – API communication
- **Lucide React** – Icon system

### ⚙️ Backend

- **Node.js & Express.js** – REST API & server logic
- **MongoDB (Mongoose)** – Stores metadata and security settings
- **Cloudinary** – Object storage for file hosting
- **Bcrypt.js** – Secure password hashing
- **Node-Cron** – Scheduled cleanup jobs

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/DigvijayPatil12/LinkVault.git
cd LinkVault
````

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/linkvault

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
node index.js
```

---

### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Application runs at:

```
http://localhost:5173
```

---

## 📡 API Overview

| Method   | Endpoint        | Description                                                          |
| -------- | --------------- | -------------------------------------------------------------------- |
| **POST** | `/api/upload`   | Uploads content. Supports `password`, `oneTimeView`, `maxDownloads`. |
| **GET**  | `/api/:shortId` | Retrieves content. Performs password validation if enabled.          |
| **POST** | `/api/delete`   | Deletes content manually using the secret admin token.               |

---

## 💡 Design Decisions

### 🔐 Security First

* Passwords are never stored in plain text.
* `bcrypt` hashing with salting ensures secure credential storage.
* Short IDs are cryptographically generated to prevent enumeration.

---

### ⚡ Concurrency Handling

The **One-Time View** logic is handled atomically at the controller level to prevent race conditions where multiple users attempt to access a single-view file simultaneously.

---

### ☁️ Storage Strategy

Cloudinary is used as an object store (similar to S3) instead of local disk storage.

Benefits:

* Stateless backend
* Scalable architecture
* Deployment-friendly (Heroku/Vercel compatible)

---

## ⚠️ Assumptions

* Requires stable internet connection for Cloudinary uploads.
* One-Time View deletes the file *after* the client successfully receives the response.
* Designed strictly for temporary content sharing deleted content is unrecoverable.

---

## ⚠️ Technical & Design Limitations

* File Size Restrictions: Since we are using the Cloudinary free tier, uploads are typically limited to ~10MB per file. Large files will fail.
* Atomic One-Time Views: While we set the expiry to "now" after a one-time view, if a user opens the link and keeps the tab open without refreshing, they can still see the content. The "burn" happens on the next request.
* Memory vs. Scalability: The current background cleanup (cron job) runs within the Node.js process. In a massive production app, this would be moved to a separate worker service so it doesn't slow down the main API.
* No "Edit" Feature: Once a link is generated, the content is immutable. If you made a typo in your secret text, you have to delete the link using the Admin Token and create a new one.
---



