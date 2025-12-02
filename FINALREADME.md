# InsureOne Project Setup

## Overview
InsureOne is a modern insurance client servicing platform that enables users to view and manage their insurance policies and claims digitally:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: ASP.NET Core Web API (.NET 8) with JWT authentication
- **Database**: Oracle XE

Supports running **with Docker** or **without Docker**.

---

## Prerequisites
- Node.js 18+ and npm (for frontend)
- .NET 8 SDK (for backend)
- Oracle DB (or use Docker image)
- Docker & Docker Compose (for containerized setup)

---

## 1. Setup Without Docker

### Frontend
```bash
cd React-frontend
npm install
# Configure API URL in .env
VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```
App runs at: **http://localhost:5173**

### Backend
```bash
cd .NET-backend
# Update appsettings.json with DB connection & JWT settings
dotnet restore
dotnet build
dotnet run
```
API runs at: **http://localhost:8080**

Ensure Oracle DB is running and accessible. 

---

## 2. Setup With Docker

### Steps
```bash
docker-compose up --build
```
Services:
- **Oracle DB**: `localhost:1521`
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:3000`

### Docker Compose Summary
- Oracle XE: `gvenzl/oracle-xe:21-slim`
- Backend: ASP.NET Core (.NET 8)
- Frontend: React served via Nginx

---

## Environment Variables
Frontend (`.env`):
```
VITE_API_BASE_URL=http://localhost:8080/api
```
Backend (`appsettings.json`):
```
{
 "Jwt": {
     "Key": "supersecretkey12345678901234567890",
     "Issuer": "MyAPI",
     "Audience": "MyAPIUser",
     "ExpiresMinutes": "1440"

 },
 "AllowedHosts": "*",
 "ConnectionStrings": {
     "DefaultConnection": "User Id=system;Password=pass123;Data Source=//localhost:1521/xe;"
 }
}
```

---

## Useful Commands
- Stop containers: `docker-compose down`
- Rebuild: `docker-compose up --build`
- Backend migrations: `dotnet ef database update`

---

## Project Structure
```
React-frontend/
  src/
    components/
    pages/
    services/
    config/
  Dockerfile
.NET-backend/
  Controllers/
  Models/
  Services/
  Repositories/
  Data/
  DTOs/
  Middlewares/
  Tests/
  Dockerfile
docker-compose.yml
```

---

## Ports
- Frontend: **3000**
- Backend: **8080**
- Oracle DB: **1521**

---

## Notes
- Update CORS in backend for frontend origin.
- Do NOT commit secrets; use environment variables in production.

