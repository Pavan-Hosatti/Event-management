# System Architecture

The Event Management platform follows a modernized robust MERN stack architecture suitable for high-scalability configurations typical in Hackathons and production environments.

## High-Level Architecture

```mermaid
graph TD
    Client[Frontend: React + Vite] --> |HTTPS/REST API| Gateway[API Gateway / Proxies]
    Gateway --> Auth[Authentication Middleware : JWT]
    
    Auth --> EventService[Event Management API]
    Auth --> UserService[User Management API]
    Auth --> AdminService[Admin & Analytics API]
    Auth --> NotifyService[Notification Services]
    
    EventService --> DB[(MongoDB Atlas)]
    UserService --> DB
    AdminService --> DB
    NotifyService --> DB

    Client -.-> |Voice bot Queries| VoiceService[VoiceBot Component]
```

## Core Components
- **Frontend**: React-based UI integrated with Vite for fast HMR. It includes role-based dashboards (Admin, Student), event cataloging, analytics rendering, and a voice-powered bot component. Uses `axios` and native `fetch` combined with `VITE_API_URL` injected proxying.
- **Backend Node**: Express.js server providing routing for `events`, `users`, `auth`, `admin` capabilities. Includes secure JWT parsing and standardizing API structures.
- **Database Layer**: Maintained on MongoDB Atlas holding scalable collections of documents covering Event Registrations, Club Analytics, Notification queues, etc.
