# NutriPulse Backend API

Production Express.js & Mongoose REST API built for standalone local execution and Vercel serverless functions.

## Commands
- `npm run dev`: Start local development server on port 5000.
- `npm run seed`: Run verified food database and demo history seeder.
- `npm start`: Production start.

## Structure
- `api/index.js`: Vercel serverless entry point.
- `server.js`: Local Express server.
- `config/`: MongoDB connection pooling and constants.
- `controllers/`: Request handling and data transformation.
- `models/`: Mongoose schemas.
- `middleware/`: JWT auth, error handling, validation, rate limiting.
- `routes/`: API endpoint mounting.
- `services/`: Mifflin-St Jeor BMR/TDEE and macro calculations.
- `validators/`: Zod schemas.
