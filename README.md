---
# XRay IoT Data Consumer

A NestJS application that consumes IoT data from X-ray sensors, stores the signals in MongoDB, and uses RabbitMQ as a message broker. The project includes Docker and Docker Compose configurations for easy setup.
---

## Features

- **NestJS** backend for processing IoT signals.
- **MongoDB** for storing signal data.
- **RabbitMQ** for message brokering between devices and the service.
- Dockerized environment for easy deployment.
- Supports environment configuration via `.env` file.

---

## Prerequisites

- Docker & Docker Compose installed.
- Node.js >= 18 (for local development if not using Docker).
- [pnpm](https://pnpm.io/) installed (for local development).

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to configure your environment variables:

```env
MONGO_URI=mongodb://root:example@mongo:27017/pantohealth?authSource=admin
RABBITMQ_URI=amqp://user:password@rabbitmq:5672
```

---

### 3. Run with Docker Compose

```bash
docker compose pull
docker compose up -d rabbitmq
docker compose up -d mongo
```

Services will start:

- **MongoDB**: `localhost:27017`
- **RabbitMQ Management UI**: `http://localhost:15672` (user/password from `.env`)

---

### 4. Available Scripts (inside container or locally)

- **Development mode**:

```bash
pnpm run start:dev
```

- **Production mode**:

```bash
pnpm run start:prod
```

---

### 5. API Documentation

Swagger is available at:

```
http://localhost:3000/docs
```

It provides details of all endpoints, including creating and fetching signals.

---

### 6. Project Structure

```
src/
├── rabbitmq/
│   ├── rabbitmq.module.ts        # Connects to RabbitMQ and asserts queues
│   └── rabbitmq.service.ts       # Provides RabbitMQ client for other modules
│
├── signals/
│   ├── signals.controller.ts     # Exposes REST CRUD API for signals
│   ├── signals.service.ts        # Consumes messages from xray_queue and processes them
│   ├── signals.dto.ts            # DTOs for validation & Swagger
│   └── schemas/signal.ts         # Mongoose schema for Signal
│
├── app.module.ts                 # Root module, imports RabbitMQModule and SignalsModule
└── main.ts                       # Application bootstrap
```

---

### 6.1 Responsibilities of Each Module

#### RabbitMQ Module

- Connects to RabbitMQ using the URI from `.env`.
- Asserts necessary queues (e.g., `xray_queue`).
- Provides a shared client that other modules (like `SignalsModule`) can use to subscribe or publish messages.

#### Signals Module

- Consumes messages from the `xray_queue`.
- Processes incoming X-ray sensor data.
- Stores signals in MongoDB (`Signal` schema).
- Exposes REST CRUD endpoints so other services can query or manage signals.
- Uses DTOs and Swagger for validation and API documentation.

---

### 8. Notes

- Ensure RabbitMQ messages are JSON formatted so the consumer can parse them.
- `dataLength` and `dataVolume` are automatically computed from the `data` array.
- Swagger auto-generates documentation from DTOs using `@nestjs/swagger`.

---

### 9. License

MIT © \[Your Name]
