# Smart Centralized Event Management System

A comprehensive, full-stack event management platform designed to streamline event creation, registration, payments, and participant engagement. Built with modern technologies and featuring real-time updates, AI-powered chatbot support, and advanced analytics.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Key Features Documentation](#key-features-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Event Management
- **Create & Manage Events**: Full CRUD operations for events with detailed configurations
- **Sub-Events**: Organize events into multiple sessions or tracks
- **Event Analytics**: Real-time insights into event performance and participant engagement
- **Event Scheduling**: Comprehensive scheduling capabilities with date/time management

### User Management & Authentication
- **Secure Authentication**: JWT-based authentication with role-based access control
- **User Profiles**: Participant and admin profiles with detailed information
- **Password Security**: Bcrypt-based password hashing and validation
- **Email Validation**: Built-in email verification

### Registration & Ticketing
- **Event Registration**: Seamless registration process for participants
- **Ticket Generation**: Automatic ticket creation with QR codes
- **Ticket Verification**: Scan and verify participant tickets at events

### Payment Integration
- **Razorpay Integration**: Secure payment processing with Razorpay
- **Payment Tracking**: Complete payment history and transaction management
- **Multiple Payment Support**: Handle various payment scenarios

### QR Code Management
- **QR Code Generation**: Auto-generate QR codes for tickets
- **QR Code Scanning**: Scanner functionality for event check-ins
- **Scan History**: Track all participant scans and check-ins

### Food Plan Management
- **Menu Planning**: Create and manage food plans for events
- **Dietary Options**: Support multiple dietary preferences
- **Participant Preferences**: Track food preferences during registration

### Feedback System
- **Post-Event Feedback**: Collect participant feedback after events
- **Rating System**: Comprehensive feedback collection with ratings
- **Analytics Integration**: Aggregate feedback for insights

### AI-Powered Chatbot
- **Intelligent Support**: AI-powered chatbot for event-related queries
- **Real-time Responses**: Using Ollama and TextBlob for NLP
- **Event Information**: Provide automatic responses about events

### Admin Dashboard
- **Real-time Dashboard**: WebSocket-powered live updates
- **Event Monitoring**: Monitor all events and their status
- **User Management**: Manage participants and staff
- **Analytics & Reports**: Comprehensive reporting capabilities

### Advanced Features
- **Rate Limiting**: API protection with SlowAPI
- **Real-time Updates**: WebSocket support for live data
- **PDF Generation**: Generate tickets and reports in PDF format
- **Machine Learning**: Event recommendation engine using scikit-learn

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.110.0
- **Server**: Uvicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose), Bcrypt
- **Payment**: Razorpay API
- **QR Code**: qrcode, PIL
- **PDF Generation**: ReportLab
- **Rate Limiting**: SlowAPI
- **AI/ML**: Ollama, TextBlob, Scikit-learn, Pandas, NumPy
- **Email**: Email-validator
- **Database Migration**: Alembic
- **Environment**: Python-dotenv, Pydantic-settings

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router DOM 7.13.1
- **HTTP Client**: Axios 1.13.6
- **QR Scanning**: html5-qrcode 2.3.8
- **Charts**: Recharts 3.7.0
- **Code Quality**: ESLint 9.39.1

---

## 📁 Project Structure

```
Event Management System/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration & settings
│   │   ├── database.py             # Database connection setup
│   │   ├── auth/
│   │   │   ├── dependencies.py     # Authentication dependencies
│   │   │   └── security.py         # Security utilities
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── event.py
│   │   │   ├── registration.py
│   │   │   ├── payment.py
│   │   │   ├── food_plan.py
│   │   │   ├── feedback.py
│   │   │   ├── sub_event.py
│   │   │   └── scan_log.py
│   │   ├── schemas/                # Pydantic validation schemas
│   │   │   ├── user.py
│   │   │   ├── event.py
│   │   │   ├── registration.py
│   │   │   ├── feedback.py
│   │   │   ├── food_plan.py
│   │   │   └── sub_event.py
│   │   ├── routers/                # API route handlers
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── event.py            # Event management endpoints
│   │   │   ├── registration.py     # Registration endpoints
│   │   │   ├── payment.py          # Payment processing
│   │   │   ├── qr.py               # QR code generation
│   │   │   ├── ticket.py           # Ticket management
│   │   │   ├── verification.py     # Ticket verification
│   │   │   ├── food_plan.py        # Food plan endpoints
│   │   │   ├── feedback.py         # Feedback collection
│   │   │   ├── sub_event.py        # Sub-event management
│   │   │   ├── dashboard.py        # Dashboard endpoints
│   │   │   ├── ws_dashboard.py     # WebSocket dashboard
│   │   │   ├── admin.py            # Admin operations
│   │   │   ├── chatbot.py          # AI chatbot endpoints
│   │   │   └── analytics.py        # Analytics endpoints
│   │   ├── services/               # Business logic services
│   │   │   ├── payment_service.py
│   │   │   ├── qr_service.py
│   │   │   ├── pdf_service.py
│   │   │   └── event_ml.py
│   │   └── websocket/
│   │       └── manager.py          # WebSocket connection manager
│   ├── alembic.ini                 # Database migration config
│   ├── alembic/                    # Database migrations
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Main App component
│   │   ├── App.css                 # Global styles
│   │   ├── assets/                 # Static assets
│   │   ├── components/             # Reusable React components
│   │   │   ├── AdminNavbar.jsx
│   │   │   ├── CreateEventForm.jsx
│   │   │   ├── EventChatbot.jsx
│   │   │   ├── FoodPlanManager.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── PayButton.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   └── SubEventManager.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ManageEvents.jsx
│   │   │   ├── CreateEventForm.jsx
│   │   │   ├── EventDashboard.jsx
│   │   │   ├── EventOverview.jsx
│   │   │   ├── EventAnalytics.jsx
│   │   │   ├── ParticipantEvents.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── Scanner.jsx
│   │   │   ├── ScannerPage.jsx
│   │   │   ├── ScanHistory.jsx
│   │   │   └── AdminFeedback.jsx
│   │   ├── services/               # API service functions
│   │   │   ├── api.js              # Axios API instance & endpoints
│   │   │   └── auth.js             # Authentication services
│   │   └── styles/                 # Component-specific styles
│   │       ├── auth.css
│   │       ├── dashboard.css
│   │       ├── home.css
│   │       ├── scanner.css
│   │       ├── payment.css
│   │       ├── chatbot.css
│   │       └── [other component styles]
│   ├── public/                     # Static public files
│   ├── package.json                # Node dependencies
│   ├── vite.config.js              # Vite configuration
│   └── index.html                  # HTML entry point
│
├── README.md                        # This file
├── requirements.txt                # Project requirements
└── commands.txt                    # Important commands reference
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** for backend development
- **Node.js 18+** and **npm 9+** for frontend
- **PostgreSQL 12+** database
- **Git** for version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Project/project ems/Event Management System/abhilash-main"
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/event_management_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay Payment
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

**Important**: Never commit the `.env` file to version control. Use `.env.example` as a template.

### Frontend Configuration

The frontend connects to the backend API. The API base URL is configured in `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:8000/api';
```

Adjust the URL based on your backend deployment.

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
# Activate virtual environment first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs` (Swagger UI)

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### Build Frontend for Production

```bash
cd frontend
npm run build
```

The optimized production build will be in `frontend/dist/`

---

## 📚 API Documentation

### Interactive API Documentation

When the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

#### Events
- `GET /events` - List all events
- `POST /events` - Create new event (Admin)
- `GET /events/{event_id}` - Get event details
- `PUT /events/{event_id}` - Update event (Admin)
- `DELETE /events/{event_id}` - Delete event (Admin)

#### Registration
- `POST /registration/register` - Register for event
- `GET /registration/my-registrations` - Get user's registrations
- `GET /registration/{registration_id}` - Get registration details

#### Payments
- `POST /payment/create-order` - Create payment order
- `POST /payment/verify` - Verify payment
- `GET /payment/history` - Get payment history

#### Tickets & QR Codes
- `GET /ticket/{registration_id}` - Get ticket details
- `POST /qr/generate` - Generate QR code
- `POST /verification/verify-qr` - Verify QR code at event

#### Feedback
- `POST /feedback/submit` - Submit event feedback
- `GET /feedback/{event_id}` - Get event feedback

#### Analytics
- `GET /analytics/events` - Event analytics
- `GET /analytics/registrations` - Registration analytics
- `GET /analytics/revenue` - Revenue analytics

#### Admin
- `GET /admin/dashboard` - Admin dashboard data
- `GET /admin/users` - Manage users
- `GET /admin/all-events` - View all events

#### Chatbot
- `POST /chatbot/query` - Ask event-related questions

---

## 🗄️ Database Setup

### Initialize Database

```bash
cd backend

# Create database (if not exists)
createdb event_management_db

# Run migrations with Alembic
alembic upgrade head
```

### Create Initial Admin User (Optional)

```bash
python -c "from app.models.user import User; from app.database import SessionLocal; 
# Create admin user logic here"
```

### Database Models

The system includes the following database models:

- **User**: System users (participants, admins, staff)
- **Event**: Main event information
- **SubEvent**: Event sessions or tracks
- **Registration**: User event registrations
- **Payment**: Payment transactions
- **FoodPlan**: Food menu for events
- **Feedback**: Event feedback from participants
- **ScanLog**: QR code scan records
- **Ticket**: Event tickets

---

## 📖 Key Features Documentation

### 1. Event Management
- Create and configure events with multiple sub-events
- Set capacity, pricing, and scheduling
- Manage event details and updates
- Track event status and participant count

### 2. Registration System
- Seamless user registration process
- Automatic ticket generation
- QR code assignment for check-in
- Food preference selection during registration

### 3. Payment Processing
- Razorpay integration for secure payments
- Multiple payment verification options
- Payment history tracking
- Automated invoice generation

### 4. QR Code & Verification
- Automatic QR generation for each ticket
- Real-time QR code scanning at events
- Duplicate check-in prevention
- Attendance tracking via scan logs

### 5. Analytics Dashboard
- Real-time event statistics
- Participant analytics
- Revenue insights
- Feedback analysis

### 6. AI Chatbot
- Powered by Ollama for local inference
- Natural language processing with TextBlob
- Event query responses
- User support automation

### 7. WebSocket Real-time Updates
- Live dashboard updates
- Real-time participant count
- Instant scan notifications
- Live feedback aggregation

---

## 🔐 Security Considerations

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt for password security
- **CORS Protection**: Restricted to localhost for development
- **Rate Limiting**: SlowAPI for API protection
- **Email Validation**: Built-in email validation
- **Database Security**: SQL injection prevention via ORM
- **Environment Variables**: Sensitive data in .env files

---

## 📦 Deployment

### Backend Deployment (Production)

```bash
# Use production ASGI server
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app

# Or with Uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment (Production)

```bash
# Build optimized production bundle
npm run build

# Deploy dist/ folder to static hosting (Netlify, Vercel, etc.)
```

---

## 🐛 Troubleshooting

### Common Issues

**PostgreSQL Connection Error**
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env
- Check username and password

**API CORS Error**
- Update allowed origins in backend/app/main.py
- Ensure frontend runs on correct port (5173)

**Frontend Cannot Connect to Backend**
- Verify backend is running on port 8000
- Check API_URL in frontend/src/services/api.js
- Check network connectivity

**Missing Dependencies**
- Run `pip install -r requirements.txt` for backend
- Run `npm install` for frontend
- Clear cache: `pip cache purge` or `npm cache clean --force`

---

## 📝 Development Workflow

### Backend Development
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes in `backend/app/`
3. Test with `pytest` or manual testing
4. Run linting and code quality checks
5. Commit and push: `git commit -m "feat: add new feature"`

### Frontend Development
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes in `frontend/src/`
3. Run linting: `npm run lint`
4. Test components in dev server
5. Build to verify: `npm run build`
6. Commit and push

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Create an GitHub issue
- Contact the development team
- Check existing documentation

---

## 📄 License

This project is licensed under the [Your License Here] - see LICENSE file for details.

---

## 🙏 Acknowledgments

- FastAPI documentation and community
- React and Vite communities
- Razorpay for payment integration
- All contributors and developers

---

**Last Updated**: May 2026

**Version**: 1.0.0

---

### Quick Reference Commands

```bash
# Backend
cd backend && venv\Scripts\activate  # Windows
cd backend && source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
npm run build

# Database
alembic upgrade head
createdb event_management_db
```
## Copyright Notice

Copyright © 2026 Abhilash. All Rights Reserved.

This repository is provided for portfolio, educational, and evaluation purposes only.

No permission is granted to copy, modify, redistribute, sublicense, sell, or commercially use any part of this codebase without prior written permission from the author.

Recruiters and hiring teams are welcome to review the source code for evaluation purposes.
