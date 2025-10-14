# NFL Pool System

A comprehensive NFL Pool management system with admin functionality, user management, and MySQL integration.

## Features

### User Features
- **User Registration**: New users can register (requires admin approval)
- **User Authentication**: Secure login system with JWT tokens
- **Pool Participation**: Join active NFL pools and make picks
- **Pick Submission**: Select winning teams with confidence points
- **Leaderboard**: View rankings and scores

### Admin Features
- **User Management**: Approve, suspend, or manage user accounts
- **Pool Creation**: Create weekly NFL pools with multiple games
- **Results Tracking**: View all user picks and results
- **Full Administrative Control**: Complete oversight of the system

### Technical Features
- **MySQL Database**: Complete database schema with relationships
- **JWT Authentication**: Secure token-based authentication
- **React Frontend**: Modern, responsive user interface
- **Express Backend**: RESTful API with proper error handling
- **Role-Based Access**: User and admin role separation

## Setup Instructions

### Prerequisites
- Node.js 16+
- MySQL 5.7+ or 8.0+
- Git

### Database Setup
1. Create a MySQL database named `nfl_pool`
2. Copy `.env.example` to `.env`
3. Update the database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=nfl_pool
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

### Installation
1. Install dependencies: `pnpm install`
2. Start the backend server: `node server/server.js`
3. In a new terminal, start the frontend: `npm run dev`

### Default Admin Account
- Username: `admin`
- Password: `admin123`

## Database Schema

### Tables
- **users**: User accounts with roles and status
- **pools**: Weekly NFL pools with dates and status
- **games**: Individual games within each pool
- **picks**: User selections for each game
- **user_scores**: Calculated scores and statistics

### Key Features
- Row Level Security (RLS) on all tables
- Foreign key relationships for data integrity
- Automatic timestamp tracking
- User approval workflow
- Comprehensive scoring system

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin Routes
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `POST /api/admin/pools` - Create new pool
- `GET /api/admin/pools/:id/picks` - View all picks for a pool

### User Routes
- `GET /api/pools` - List active pools
- `GET /api/pools/:id/games` - Get games for a pool
- `POST /api/picks` - Submit picks
- `GET /api/picks/:poolId` - Get user's picks
- `GET /api/pools/:id/leaderboard` - View leaderboard

## Usage

### For Users
1. Register an account (requires admin approval)
2. Login after approval
3. Browse available pools
4. Make picks for each game
5. View leaderboards and results

### For Admins
1. Login with admin credentials
2. Approve/manage user accounts
3. Create weekly pools with NFL games
4. Monitor all picks and results
5. Manage system operations

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Protected admin routes
- Database connection security

## Technology Stack
- **Frontend**: React 18, React Router, Tailwind CSS, Relume UI
- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React
- **Build Tool**: Vite

This system provides a complete NFL pool management solution with professional-grade security, scalability, and user experience.
"# NFLPool" 
"" 
