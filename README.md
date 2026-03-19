# Multi-player Trivia Tournament - Project 2 (CS 343)

## Group Members

| Name               | SU Number | 
|--------------------|-----------|
| Thaakir Fernandez  | 26479443  |
| Tashreeq Hartogh   | 27163245  |
| Leesan Moodley     | 26186152  |
| Gideon Botha       | 26894319  |
| Raeez Peters       | 27445623  |


## Summary
This is a web-based multiplayer trivia application with authenticated users who can create or join trivia matches in categories including:

- General Knowledge
- Science
- Entertainment
- Geography
- Sports
- Politics

Matches consist of up to 4 rounds, each with a maximum of 7 questions. Scores are updated live and match history is stored. Users can create profiles, login/logout, and view leaderboards. An admin interface allows question management.

## Features

### User Features
- Signup and login with JWT authentication
- Profile editing (avatar URL, username, password)
- View match history, high score, and statistics
- Create, join, and participate in matches
- Real-time updates: question countdown, live scores, and player presence

### Admin Features
- View, search, filter, edit, and delete questions

### Gameplay Rules
- Each question: 20 seconds to answer
- Correct answers score points
- No points for incorrect answers

---

## Technical Requirements

- **Frontend**: React (Vite) + TypeScript + CSS
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL (3NF) using Prisma ORM
- **Authentication**: JWT access + refresh, passwords hashed with bcrypt
- **Real-time communication**: WebSockets
- **Scraping**: Automated web scraper/API to populate question database

---

## Prerequisites

- Node.js v24+
- npm v11+
- PostgreSQL

---

## Setup Instructions

### 1. Clone repository
```bash
git clone git@git.cs.sun.ac.za:Computer-Science/rw334/2025/projects/project-2-groups/group-6-rw343-project-2.git

cd group-6-rw343-project-2
```

### 2. Install dependencies

# Backend
```bash
    cd server
    npm install
```
# Frontend
```bash
    cd ..
    npm install
```

### 3. Configure environment variables
Create a .env in server

```bash
    DATABASE_URL="postgresql://group6db_user:YGDSEtxVVE3kTh1c463xhfgf24CoweQb@dpg-d3e11vidbo4c738vjpg0-a.oregon-postgres.render.com/group6db"
    JWT_SECRET="masterbaited"
    JWT_REFRESH_SECRET="masterbaiter"

```

### 4. Setup Schema

```bash
    cd server
    npx prisma generate
```

---

## Running the project
These commands needs to be run in different terminals.

#Backend
```bash
    cd server
    npm run dev
```
##Database
```bash
    psql "postgresql://group6db_user:YGDSEtxVVE3kTh1c463xhfgf24CoweQb@dpg-d3e11vidbo4c738vjpg0-a.oregon-postgres.render.com/group6db"
```

#Frontend
```bash
    cd ..
    npm run dev
```



##Project Structure

## Project Structure

```
343-Project-2-Code/
├── node_modules/
├── public/
│   ├── browser-icon.png
│   └── vite.svg
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── BackendMethods/
│   │   ├── middleware/
│   │   ├── routes.ts
│   │   ├── server.ts
│   │   ├── testApi.ts
│   │   ├── testScrape.ts
│   │   └── webscrape.ts
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── assets/
│   ├── Backend/
│   ├── Components/
│   ├── Context/
│   ├── Pages/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
