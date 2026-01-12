import {config} from 'dotenv';

config({path : `.env.${process.env.NODE_ENV || "development"}`});

export const {
 PORT, 
 SERVER_URL,
 MONGO_URI, 
 NODE_ENV,
 JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
} = process.env