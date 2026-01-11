# LogistiMa Backend API

This repository contains the backend API for the LogistiMa express delivery application. It provides services for delivery management, courier dispatching, and zone-based routing.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker & Docker Compose
*   PostgreSQL (if running locally without Docker)
*   Redis (if running locally without Docker)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd logtest
    ```

2.  Install dependencies:
    ```bash
    cd backend
    npm install
    ```

3.  Configure Environment Variables:
    Copy `.env.example` (if available) or create `.env` in `backend/` directory:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=logistima
    REDIS_HOST=localhost
    ```

## 🐳 Docker Setup

Run the entire stack (API, Worker, DB, Redis) using Docker Compose:

```bash
# Start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🛠️ Development

### Database Migration

To create the necessary tables:

```bash
cd backend
npm run migrate
```

To seed the database with initial data:

```bash
node src/database/seed.js
```

### Running Tests

Run the unit tests:

```bash
cd backend
npm test
```

## 📡 API Endpoints

### Health Check
*   `GET /` - Check API status

### Deliveries
*   `POST /api/deliveries` - Create a new delivery (with transaction)
    *   **Body:**
        ```json
        {
          "userId": "uuid-user",
          "courierId": "uuid-courier",
          "parcelData": {
            "weight": 5.5,
            "recipientName": "Jane Doe",
            "recipientPhone": "+212600000000",
            "recipientAddress": "Casablanca, Maarif",
            "zoneId": "uuid-zone"
          }
        }
        ```

### Zones
*   `GET /api/zones` - Get all active zones (Cached in Redis)

## 🏗️ Architecture

*   **API:** Express.js
*   **Database:** PostgreSQL (Sequelize ORM)
*   **Caching:** Redis
*   **Queue/Worker:** BullMQ (Redis-based)
*   **Transaction Isolation:** SERIALIZABLE (for concurrency control)

## 🧪 Testing

The project uses Jest for testing.
*   `npm test` runs all tests.
*   CI pipeline is configured in `.github/workflows/ci.yml`.
