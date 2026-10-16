import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  dataGovInApiKey: process.env.DATA_GOV_IN_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'agripulse-super-secret-key-2026',
  environment: process.env.NODE_ENV || 'development'
};
