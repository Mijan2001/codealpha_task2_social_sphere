﻿# SocialSphere - Full Stack Social Media App

A full-stack social media application built with React, Tailwind CSS, Express, and MongoDB.

![Project Image](/projectImages/1home.png)

## Features

-   User authentication (register, login, logout)
-   User profiles with followers and following
-   Create, like, and comment on posts
-   Upload images for posts and profile pictures
-   Search for users
-   Responsive design

## Tech Stack

### Frontend

-   React
-   TypeScript
-   React Router
-   Tailwind CSS
-   Shadcn UI Components
-   Axios

### Backend

-   Node.js
-   Express
-   MongoDB
-   JWT Authentication
-   Cloudinary (for image storage)

## Getting Started

### Prerequisites

-   Node.js
-   MongoDB Atlas account
-   Cloudinary account

### Installation

1. Clone the repository

```
git clone https://github.com/Mijan2001/codealpha_task2_social_sphere.git
cd socialsphere
```

2. Install frontend dependencies

```
npm install
```

3. Install backend dependencies

```
cd backend
npm install
```

4. Create a .env file in the backend directory with the following variables

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
SECRET_KEY=your_cloudinary_secret_key
```

5. Start the backend server

```
npm run dev
```

6. Start the frontend development server (in a new terminal window)

```
cd ..
npm run dev
```

7. Open your browser and navigate to http://localhost:5173

## Project Structure

```
socialsphere/
├── frontend/src/                     # Frontend source code
│   ├── components/          # Reusable components
│   ├── context/             # React context providers
│   ├── pages/               # Page components
│   ├── services/            # API services
├── backend/                 # Backend source code
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   └── server.js            # Express app
└── README.md
```

## API Endpoints

### Auth

-   POST /api/auth/register - Register a new user
-   POST /api/auth/login - Login a user

### Users

-   GET /api/users/:id - Get user profile
-   PUT /api/users/profile - Update user profile
-   PUT /api/users/follow/:id - Follow a user
-   PUT /api/users/unfollow/:id - Unfollow a user
-   GET /api/users/search - Search for users

### Posts

-   GET /api/posts - Get all posts
-   POST /api/posts - Create a new post
-   GET /api/posts/:id - Get a post by ID
-   DELETE /api/posts/:id - Delete a post
-   PUT /api/posts/like/:id - Like a post
-   PUT /api/posts/unlike/:id - Unlike a post
-   POST /api/posts/comment/:id - Comment on a post
-   GET /api/posts/user/:userId - Get user posts
