import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Student, { COMPANY_NAMES } from './models/Student.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/students', async (request, response, next) => {
  try {
    const { company } = request.query;
    if (company && !COMPANY_NAMES.includes(company)) {
      return response.status(400).json({ message: 'Unknown company filter.' });
    }

    const filter = company ? { companies: company } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();
    return response.json(students);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/students', async (request, response, next) => {
  try {
    const { arrears, companies } = request.body;
    if (!(arrears === 0 || arrears === '0')) {
      return response.status(403).json({ message: 'Students must have zero standing arrears to register.' });
    }
    if (!Array.isArray(companies) || companies.length !== 4 || new Set(companies).size !== 4 || companies.some((company) => !COMPANY_NAMES.includes(company))) {
      return response.status(400).json({ message: 'Choose exactly four different listed companies.' });
    }

    const student = await Student.create({ ...request.body, arrears: 0 });
    return response.status(201).json(student.toObject());
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error.code === 11000) {
    return response.status(409).json({ message: 'That student ID is already registered.' });
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof SyntaxError) {
    return response.status(400).json({ message: 'Some student details are missing or invalid.' });
  }

  console.error(error);
  return response.status(500).json({ message: 'The placement service could not complete the request.' });
});

if (!mongoUri) {
  console.error('MONGODB_URI is missing. Add it to server/.env.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  app.listen(port, () => {
    console.log(`Placement API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Could not connect to MongoDB: ${error.message}`);
  process.exit(1);
}
