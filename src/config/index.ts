import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Application configuration object
 * Loads all environment variables and provides type-safe access
 */
export default {
  ip_address: process.env.IP_ADDRESS,
  database_port: process.env.MONGODB_PORT,
  database_name: process.env.DATABASE_NAME,
  database_user_name: process.env.MONGODB_ADMINUSERNAME,
  databse_user_password: process.env.MONGODB_ADMINPASSWORD,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  python_port: process.env.PYTHON_PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN!
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  azure: {
    key: process.env.AZURE_API_KEY,
    endpoint: process.env.AZURE_URL, 
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
    public_key: process.env.STRIPE_PUBLIC_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  paystack: {
    secret_key: process.env.PAYSTACK_SECRET_KEY,
    public_key: process.env.PAYSTACK_PUBLIC_KEY,
  }
};
