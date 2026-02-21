# Odoo Hackathon Backend

A basic Express.js backend with MySQL database integration.

## Project Structure

```
backend/
├── config/           # Configuration files (database connection)
├── controllers/      # Business logic
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── public/          # Static files
├── server.js        # Main server file
├── package.json     # Dependencies
├── .env.example     # Environment variables template
└── .gitignore       # Git ignore rules
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=odoo_hackathon
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:3000` (or the port specified in `.env`)

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API root endpoint

## Dependencies

- **express** - Web framework
- **mysql2** - MySQL database driver
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **body-parser** - Request body parser
- **joi** - Data validation
- **nodemon** - Development auto-reload (dev only)

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE odoo_hackathon;
```

2. Create tables as needed in your database and reference them in the models

## File Structure Details

### config/
- `database.js` - MySQL connection pool setup

### controllers/
- Contains business logic for different API endpoints
- Example: `sampleController.js`

### models/
- Database models with CRUD operations
- Example: `Sample.js`

### routes/
- API route definitions
- Example: `index.js`

### middleware/
- Custom middleware functions
- Example: `auth.js`

## Environment Variables

See `.env.example` for all available environment variables.

## Adding New Routes

1. Create a route file in `routes/`
2. Create a controller in `controllers/`
3. Create a model in `models/`
4. Import and use in `routes/index.js`

## Error Handling

The server includes basic error handling middleware that catches and logs errors, returning a 500 status with error message.

## CORS

CORS is enabled by default. Modify in `server.js` if you need specific origin restrictions.
