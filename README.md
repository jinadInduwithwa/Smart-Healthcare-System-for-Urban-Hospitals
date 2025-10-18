# Smart Healthcare System for Urban Hospitals

A comprehensive healthcare management system designed for urban hospitals to streamline patient appointments, medical consultations, reporting, and payment processing.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- **User Authentication**: Secure login and registration for patients, doctors, and administrators
- **Appointment Management**: Schedule, view, and manage patient appointments
- **Medical Consultations**: Digital consultation records with diagnosis and prescriptions
- **Payment Processing**: Integrated payment system for medical services
- **Reporting**: Comprehensive reporting for hospital administration
- **Medical History**: Patient medical history tracking
- **Settings Management**: System configuration and user settings

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token for authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email notifications
- **Cloudinary** - Image storage and management
- **Winston** - Logging

### Frontend
- **React** - JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing


## Architecture

The application follows a monorepo structure with a clear separation between frontend and backend:

```
Smart Healthcare System
├── Backend (Root)
│   ├── Controllers
│   ├── Models
│   ├── Routes
│   ├── Services
│   ├── Middleware
│   └── Utilities
└── Frontend (Client/)
    ├── Components
    ├── Pages
    ├── Context
    ├── Utils
    └── Types
```

## API Endpoints

### Authentication
- `POST /api/auth/register/patient` - Register a new patient
- `POST /api/auth/register/doctor` - Register a new doctor
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Appointments
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments` - Get all appointments (with filters)
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/doctor/:doctorId` - Get appointments for a doctor
- `GET /api/appointments/patient/:patientId` - Get appointments for a patient

### Consultations
- `POST /api/consult` - Create a new consultation
- `GET /api/consult` - Get all consultations (with filters)
- `GET /api/consult/:id` - Get consultation by ID
- `PUT /api/consult/:id` - Update consultation
- `DELETE /api/consult/:id` - Delete consultation
- `GET /api/consult/patient/:patientId` - Get consultations for a patient
- `GET /api/consult/doctor/:doctorId` - Get consultations for a doctor

### Reports
- `GET /api/reports/doctor-availability` - Get doctor availability report
- `GET /api/reports/patient-check-ins` - Get patient check-in report
- `GET /api/reports/financial` - Get financial report
- `GET /api/reports/overview` - Get overview statistics

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/webhook` - Stripe webhook endpoint
- `GET /api/payments/:id` - Get payment by ID

### Medical History
- `GET /api/medical-history/patient/:patientId` - Get medical history for a patient

### Settings
- `GET /api/settings/diagnosis-codes` - Get diagnosis codes
- `GET /api/settings/diagnosis-codes/search` - Search diagnosis codes
- `GET /api/settings/recommended-tests` - Get recommended tests
- `GET /api/settings/recommended-tests/search` - Search recommended tests

## Prerequisites

- Node.js >= 18.0.0
- MongoDB
- pnpm (package manager)
- Stripe account (for payment processing)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Smart-Healthcare-System-for-Urban-Hospitals
   ```

2. Install backend dependencies:
   ```bash
   pnpm install
   ```

3. Install frontend dependencies:
   ```bash
   cd Client
   pnpm install
   cd ..
   ```

   Or use the combined installation script:
   ```bash
   pnpm run install:all
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

## Running the Application

### Development Mode

Start both frontend and backend in development mode:
```bash
pnpm run dev
```

Start only the backend:
```bash
pnpm run dev:backend
```

Start only the frontend:
```bash
cd Client
pnpm run dev
```

### Production Mode

Build and start the application:
```bash
pnpm run start:prod
```

## Testing

### Backend Testing

Run all tests:
```bash
pnpm test
```

Run working tests (CommonJS compatible):
```bash
pnpm run test:working
```

Run specific working tests:
```bash
pnpm run test:working:appointments
pnpm run test:working:consultation
pnpm run test:working:payment
pnpm run test:working:report
```

### Frontend Testing

Run frontend tests:
```bash
cd Client
pnpm test
```

Run all tests (backend and frontend):
```bash
pnpm run test:all
```

## Project Structure

```
.
├── Client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── lib/            # Utility functions
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   └── index.html          # HTML template
├── controllers/            # Request handlers
├── models/                 # Database models
├── routes/                 # API routes
├── services/               # Business logic
├── middleware/             # Custom middleware
├── utils/                  # Utility functions
├── validation/             # Input validation
├── data/                   # Static data files
├── __tests__/              # Test files
├── scripts/                # Utility scripts
├── .env                    # Environment variables
├── server.js               # Application entry point
└── package.json            # Project dependencies and scripts
```

## License

This project is licensed under the ISC License.
