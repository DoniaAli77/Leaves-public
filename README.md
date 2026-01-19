# Leaves Subsystem - HR Management System


## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

.env file content :
# Server
NODE_ENV=development
PORT=3001

# MongoDB Atlas
MONGO_URI=your_mongodb_connection_string_here
DATABASE_NAME=hr_system

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

Server runs on: `http://localhost:3000/api/v1`


for frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001






## 📋 Milestone 1 :

###  Member 1 (Hanin) - 
-  Leave Types Module
-  Vacation Packages Module
-  Organization Calendar Module

###  Member 2 (Jana) - 
-  Employee Leave Balance Module
-  Leave Requests Module
-  Leave Adjustments Module

###  Member 3 (Reem) - 
-  Leave Policies Module
-  Integration Module
-  Common Utilities



## 🗄️ Database

- **MongoDB Atlas Cluster:** hr-system-cluster
- **Database Name:** hr_leaves_db


## 👥 Team Members

| Member | Role | Modules |
|--------|------|---------|
| **Hanin** | Policy & Configuration | Leave Types, Vacation Packages, Calendar |
| **Jana** | Requests & Workflow | Balance, Requests, Adjustments |
| **Reem** | Integration & Utilities | Policies, Integration, Utils |

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [API Endpoints](./backend/README.md#api-endpoints)

## 🔗 Repository

https://github.com/haninelnajar/Leaves-Subsystem
```

---

