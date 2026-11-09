# Sweety – Smart Blood Glucose Tracker

A premium full-stack healthcare SaaS application for tracking blood glucose readings and viewing personal health analytics.

## Project Overview

Sweety enables users to securely record, manage, and analyze their daily blood glucose readings.

This application is designed as a tracking and reporting platform, not a medical diagnostic system.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript ES6+
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database
- PostgreSQL 18
- node-postgres (pg)

### Quality and Developer Tools
- Git and GitHub
- VS Code
- Postman
- Jest / Vitest
- Supertest
- ESLint and Prettier

## Architecture

The project follows a modular monorepo architecture.

- client/: React frontend
- server/: Express backend
- database/: SQL migrations and seed data
- tests/: Automated tests
- docs/: Technical documentation
- screenshots/: Application screenshots

Backend layers:
- Routes
- Controllers
- Services
- Repositories
- Validators
- Middleware

## Project Status

Development phase: Phase 1 – Planning and Setup.

## Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL 18
- Git
- Visual Studio Code

## Installation

Clone the repository:

    git clone YOUR_GITHUB_REPOSITORY_URL
    cd Sweety

Install dependencies:

    npm install

Additional database and environment setup instructions will be documented as implementation progresses.

## Environment Configuration

Create environment files using .env.example as the reference.

Never commit actual environment files or credentials.

## Features

Planned features:

- Secure user registration and login
- JWT authentication
- Glucose reading management
- Four daily reading slots
- Daily glucose statistics
- Month-to-date reports
- Previous-month reports
- Interactive analytics
- Responsive dashboard

## Security

- Password hashing
- JWT authentication
- Parameterized SQL queries
- Input validation
- User-specific data authorization
- Environment-based secrets

## Testing

Automated backend and frontend testing will be configured during development.

## Medical Disclaimer

Sweety is intended for health tracking and reporting only. It does not provide medical diagnosis or treatment recommendations. Consult qualified healthcare professionals for medical decisions.

## License

Private development project for the Kenpath Junior Full Stack Developer assignment.
