# Daily Mission - AI-Powered Education Platform

A production-ready platform for BiPC EAPCET & NEET students.

## Tech Stack
* **Frontend:** React, Vite, TailwindCSS, Framer Motion, Zustand
* **Backend:** Node.js, Express, Prisma ORM, SQLite
* **Authentication:** JWT
* **AI:** LangChain + Ollama

## Quick Start

1. **Install Dependencies**
   Run from the root directory to install both frontend and backend dependencies:
   ```bash
   npm run install:all
   ```

2. **Setup Environment Variables**
   * Go to `backend/` and configure your `.env` file (Database URL, JWT Secret).

3. **Database Setup**
   Run from the `backend/` directory:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the Project**
   Run from the root directory to start both servers concurrently:
   ```bash
   npm run dev
   ```

## Folder Structure
* `frontend/`: React application.
* `backend/`: Express server and Prisma schema.
