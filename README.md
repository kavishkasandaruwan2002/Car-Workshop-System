# 🚗 Car Workshop Management System

A full-stack **Car Workshop Management System** designed to help manage workshop operations efficiently through a web-based platform.

The system provides a centralized solution for handling workshop-related activities such as customers, vehicles, services, repairs, appointments, and other day-to-day workshop operations.

---

## 📌 About the Project

The **Car Workshop Management System** was developed to simplify and digitalize the management process of an automobile workshop.

Instead of maintaining workshop information manually, the system allows users to manage important information through an easy-to-use web application.

The project contains separate **frontend** and **backend** applications.

---

## ✨ Features

* 👤 Customer management
* 🚘 Vehicle information management
* 🔧 Workshop service management
* 📅 Service / repair scheduling
* 📝 Repair and maintenance record management
* 🔍 View and manage workshop-related information
* ✏️ Add, update, and delete records
* 📱 User-friendly and responsive interface
* 🔗 Frontend and backend integration

---

## 🛠️ Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Vite
* Axios

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB
* Mongoose

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Postman

---

## 📂 Project Structure

```text
Car-Workshop-System/
│
├── frontend/          # Frontend application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Backend application and APIs
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── package.json
│
├── .gitignore
│
└── README.md
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kavishkasandaruwan2002/Car-Workshop-System.git
```

Then navigate to the project directory:

```bash
cd Car-Workshop-System
```

---

## 🖥️ Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory and configure the required environment variables.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Start the backend server:

```bash
npm start
```

or, if the project uses Nodemon:

```bash
npm run dev
```

---

## 💻 Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The terminal will display the local URL that can be opened in your browser.

Example:

```text
http://localhost:5173
```

---

## 🔄 System Workflow

```text
User
  │
  ▼
Frontend Application
  │
  ▼
REST API Requests
  │
  ▼
Node.js / Express Backend
  │
  ▼
MongoDB Database
```

The frontend sends requests to the backend API, and the backend communicates with the database to store, retrieve, update, and delete workshop-related information.

---

## 🎯 Objectives

The main objectives of this project are:

* Digitalize traditional workshop management processes.
* Reduce manual record keeping.
* Maintain customer and vehicle information efficiently.
* Organize vehicle repair and maintenance details.
* Improve accessibility to workshop information.
* Provide a simple and user-friendly management system.

---

## 🚀 Future Improvements

Possible future enhancements include:

* Role-based authentication for Admin, Staff, and Customers
* Online service appointment booking
* Vehicle service history tracking
* Inventory and spare-parts management
* Invoice and payment management
* Email/SMS notifications
* Reports and analytics dashboard
* Online payment integration

---

## 👨‍💻 Author

**Kavishka Sandaruwan**

GitHub:
https://github.com/kavishkasandaruwan2002

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push the branch.
6. Create a Pull Request.

---

## ⭐ Support

If you find this project useful, consider giving the repository a **star ⭐**.

---

### 🚗 Car Workshop Management System

**A simple and efficient web-based solution for managing automobile workshop operations.**
