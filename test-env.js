import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, './.env') });

console.log('🧪 GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
