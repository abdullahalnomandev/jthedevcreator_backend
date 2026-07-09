# GoNeighbour - Local Task Management Application

GoNeighbour is a comprehensive local task management application that connects users with nearby service providers. The application leverages real-time communication, face verification, payment processing, and location-based services. Built with TypeScript, Node.js, Express, MongoDB, and Docker for containerization.

## Features

- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control (User, Admin)
- **Post Management**: Create, view, and manage task posts with location-based filtering
- **Bidding System**: Users can bid on task posts
- **Real-Time Chat**: Instant messaging between users using Socket.io
- **Face Verification**: Azure Face API integration for user verification
- **Payment Processing**: Stripe integration for secure payments
- **Email Notifications**: Nodemailer for sending emails (OTP, password reset, etc.)
- **Cluster Mode**: Multi-core CPU utilization for better performance
- **Logging**: Winston logger with daily log rotation
- **Docker Support**: Containerized deployment with Docker Compose
- **File Upload**: Multer for handling file uploads

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Email**: Nodemailer
- **Payments**: Stripe
- **Face Verification**: Azure Cognitive Services Face API
- **Logging**: Winston + morgan
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## Project Structure

```
go-neighbour/
├── Docker/                   # Docker configuration files
│   ├── Dockerfile
│   └── Dockerfile.nginx
├── conf/                     # Configuration files
│   ├── bash/
│   └── nginx/
├── github/
│   └── workflows/            # GitHub Actions workflows
│       └── pipeline.yml
├── src/
│   ├── DB/                   # Database seed scripts
│   │   └── seedAdmin.ts
│   ├── app/
│   │   ├── builder/          # Query builder utilities
│   │   ├── middlewares/      # Express middlewares
│   │   ├── modules/          # Feature modules
│   │   │   ├── admin/        # Admin module
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── bid/          # Bidding module
│   │   │   ├── chat/         # Chat module
│   │   │   ├── keywords/     # Keywords/search module
│   │   │   ├── message/      # Messaging module
│   │   │   ├── payments/     # Payment module
│   │   │   ├── post/         # Post module
│   │   │   ├── user/         # User module
│   │   │   └── validation/   # Validation module
│   │   └── config/           # App configuration
│   ├── enums/                # TypeScript enums
│   ├── errors/               # Error handling utilities
│   ├── helpers/              # Helper functions
│   ├── python/               # Python server for face verification
│   ├── routes/               # Route definitions
│   ├── script/               # Utility scripts
│   ├── shared/               # Shared utilities
│   ├── types/                # TypeScript type definitions
│   ├── util/                 # Utility functions
│   ├── app.ts                # Express app setup
│   ├── cluster.ts            # Cluster mode setup
│   ├── server.dev.ts         # Dev server entry
│   ├── server.ts             # Production server entry
│   └── server.worker.ts      # Worker server
├── .env.sample               # Sample environment variables
├── compose.yml               # Docker Compose configuration
├── package.json
└── tsconfig.json
```

## Prerequisites

Ensure you have the following tools installed before running the application:

- [Node.js](https://nodejs.org) (LTS version)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose
- [Python 3.8+](https://www.python.org/) (for face verification server)
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- [MongoDB](https://www.mongodb.com/) (local installation or Docker container)
- Azure account with Face API resource
- Stripe account for payment processing
- Gmail or other SMTP provider for email notifications

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/go-neighbour.git
cd go-neighbour
```

### 2. Install Dependencies

Install Node.js dependencies:

```bash
npm install
```

### 3. Environment Variables

Copy the sample `.env.sample` file to a new `.env` file:

```bash
cp .env.sample .env
```

Update the `.env` file with your actual credentials:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port |
| `PYTHON_PORT` | Python face verification server port |
| `MONGODB_PORT` | MongoDB port |
| `DATABASE_NAME` | MongoDB database name |
| `MONGODB_ADMINUSERNAME` | MongoDB admin username |
| `MONGODB_ADMINPASSWORD` | MongoDB admin password |
| `SUPER_ADMIN_EMAIL` | Super admin email |
| `SUPER_ADMIN_PASSWORD` | Super admin password |
| `NODE_ENV` | Environment (development/production) |
| `IP_ADDRESS` | Server IP address |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds |
| `AZURE_URL` | Azure Face API endpoint |
| `AZURE_API_KEY` | Azure Face API key |
| `JWT_SECRET` | JWT secret key |
| `JWT_EXPIRE_IN` | JWT expiration time |
| `JWT_REFRESH_EXPIRE_IN` | JWT refresh token expiration |
| `EMAIL_FROM` | Sender email address |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PASS` | SMTP password |
| `STRIPE_SECRET_KEY` | Stripe secret key |

### 4. Running the Application

#### Development Mode

Run the application with live-reloading (nodemon):

```bash
npm run dev
```

#### Production Mode

Build and start the application:

```bash
npm run build
npm start
```

#### Docker Setup

Build and run all services using Docker Compose:

```bash
docker compose up -d
```

This will start:
- Node.js backend server
- MongoDB database
- MongoDB Express web interface
- Nginx reverse proxy

### 5. Python Face Verification Server

Install Python dependencies using uv:

```bash
cd src/python
uv sync
```

Start the Python server:

```bash
uv run server.py
```

Or from the project root:

```bash
uv run ./src/python/server.py
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Users
- `GET /api/v1/user` - Get all users
- `GET /api/v1/user/:id` - Get user by ID
- `PATCH /api/v1/user/:id` - Update user
- `DELETE /api/v1/user/:id` - Delete user

### Posts
- `GET /api/v1/post` - Get all posts
- `POST /api/v1/post` - Create new post
- `GET /api/v1/post/:id` - Get post by ID
- `PATCH /api/v1/post/:id` - Update post
- `DELETE /api/v1/post/:id` - Delete post

### Bids
- `GET /api/v1/bid` - Get all bids
- `POST /api/v1/bid` - Create new bid
- `GET /api/v1/bid/:id` - Get bid by ID

### Chat
- `GET /api/v1/chat` - Get all chats
- `POST /api/v1/chat` - Create new chat
- `GET /api/v1/chat/:id` - Get chat by ID

### Messages
- `GET /api/v1/message` - Get all messages
- `POST /api/v1/message` - Send new message

### Payments
- `POST /api/v1/payment/create-payment-intent` - Create payment intent
- `POST /api/v1/payment/webhook` - Stripe webhook

### Admin
- `GET /api/v1/admin` - Get admin dashboard
- `POST /api/v1/admin/create-admin` - Create new admin

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run create-modules` | Create new module using script |
| `npm run lint:check` | Check ESLint issues |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run prettier:check` | Check Prettier formatting |
| `npm run prettier:fix` | Fix Prettier formatting |

## Environment Variables

See `.env.sample` for all required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.