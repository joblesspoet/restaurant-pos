# Restaurant POS System

A modern Point of Sale (POS) system for restaurants with separate frontend and backend applications.

## Project Structure

The project is divided into two main directories:

- `frontend/`: Contains the React.js application (client-side)
- `backend/`: Contains the Node.js/Express application (server-side)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.0.0 or higher)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/pos_system
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on http://localhost:3000

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will start on http://localhost:5174

## Features

- User authentication and authorization
- Menu management
- Order processing
- Table management
- Payment processing
- Receipt generation
- Real-time order updates
- Inventory management
- Sales reporting

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Tailwind CSS for styling
- Vite as build tool
- TypeScript for type safety

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time features

## License

This project is licensed under the ISC License.