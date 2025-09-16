# Project Architecture 🏗️

This document describes the technical architecture of **Cartas Sem Humanidade**.  
The goal is to provide a clear overview of the system’s structure, technologies, and data flow.

---

## 🖼️ Overview

1. **Frontend (Angular + TypeScript)**  
   - User interface (game board, card selection, scoreboard).  
   - Handles routing, state management, and user interactions.  
   - Communicates with the backend via REST API / WebSocket.  
---

## ⚙️ Technologies
- **Frontend**
  - Angular 18.2.12+  
  - TypeScript  
  - Angular Material (UI components) 
---

## 🔄 Data Flow
1. A player interacts with the Angular app (e.g., selects a card).  
2. Angular sends a request to the backend API (e.g., `POST /play-card`).  
3. The backend processes the action, updates the game state in the database, and notifies all players via WebSocket.  
4. The frontend updates the UI based on the new game state received.  
---

## 🗂️ Project Structure

### Frontend (Angular)
```plaintext
src/
├── app/
│   ├── app-main/          # Main components (card, scoreboard, deck, etc.)
│   ├── auth/              # Authentication components (login, register, etc.)
│   ├── core/              # Core components (guards, models, services)
│   ├── shared/            # Shared components (chat, loader, navbar)
│   ├── app.module.ts      # Main Angular module
│   └── app-routing.module.ts # Routes
├── assets/                # Images, icons, card designs
└── environments/          # Environment configs (dev, prod)