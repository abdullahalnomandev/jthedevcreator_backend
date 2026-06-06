# GoNeighbour - Local Task Management Application

GoNeighbour is a local task management application that allows users to manage their tasks and locations. The application leverages live location tracking with Google Maps API, real-time communication via Socket.io, and email notifications via Nodemailer. This app is built with TypeScript, Node.js, and Docker for containerization.

## Features

- **Live Location Tracking**: Real-time location updates using Google Maps API.
- **Real-Time Communication**: Chat functionality with Socket.io.
- **Email Notifications**: Send notifications via Nodemailer.
- **Task Management**: Manage tasks effectively with simple and intuitive features.

## Prerequisites

Ensure you have the following tools installed before running the application:

- [Node.js](https://nodejs.org) (LTS version)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Google Maps API](https://developers.google.com/maps/documentation) for location tracking.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/go-neighbour.git
cd go-neighbour
````

### 2. Install Dependencies

Install the necessary Node.js dependencies:

```bash
npm install
```

### 3. Environment Variables

Copy the sample `.env.sample` file to a new `.env` file:

```bash
cp .env.sample .env
```

Update the `.env` file with the required variables for your project. This includes your **Google Maps API key**, **Nodemailer SMTP credentials**, and any other environment-specific configurations.

### 4. Running the Application

#### Development Mode (with Nodemon)

To run the application in development mode with live-reloading:

```bash
npm run dev
```

#### Production Mode

To build and start the application in production:

```bash
npm run build
npm start
```

### 5. Docker Setup

If you want to run the application using Docker, make sure you have Docker installed. You can build and run the Docker container as follows:

#### Build the Docker Image

```bash
docker compose up
```

This will run the application inside a container and map port from the container to port of `.env` on your machine.


### 5. Python Server for the Face verification
You must install the python and then setup the `uv` from pip
```bash
uv run ./src/python/server.py
```