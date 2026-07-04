# LuxBank - Online Banking System

A full-stack, premium online banking solution featuring a Next.js web application, a React Native mobile app, and a robust Node/Express backend.

## Features

- **Premium UI/UX**: Stunning landing page and dashboard designs with glassmorphism and smooth animations.
- **Advanced Auth**: Separate login flows for Users and Admins with JWT-based RBAC.
- **Unified Sync**: Seamless experience across Web and Mobile.
- **Card Management**: Apply for new cards, lock/unlock, and view details.
- **Fund Transfers**: Secure money transfers with transaction history.
- **Admin Portal**: System-wide oversight, user approvals, and audit logs.
- **Utilities**: Branch change requests and password recovery.

## Project Structure

- `/api`: Node.js/Express backend API.
- `/web`: Next.js web application.
- `/mobile`: React Native (Expo) mobile application.
- `/api/db`: PostgreSQL schema and migration scripts.

## Tech Stack

- **Backend**: Express, PostgreSQL, JWT, Bcrypt.
- **Web**: Next.js, Framer Motion, Lucide Icons, Vanilla CSS.
- **Mobile**: React Native, Expo, React Navigation.

## Getting Started

### Backend
1. `cd api`
2. `npm install`
3. Configure `.env` using `.env.example`
4. `npm run dev`

### Web
1. `cd web`
2. `npm install`
3. `npm run dev`

### Mobile
1. `cd mobile`
2. `npm install`
3. `npx expo start`

---
*Created with ❤️ for LuxBank Corporate.*
