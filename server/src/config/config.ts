import * as dotenv from 'dotenv'

dotenv.config();

interface Config {
  port: number;
  jwtSecretKey: string;
  pepper: string;
  emailSecretKey: string;
  nodeEnviroment: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecretKey: process.env.NODE_ENV || 'development',
  pepper: process.env.PEPPER || 'asdfk',
  emailSecretKey: process.env.EMAIL_SECRET || 'asfasf',
  nodeEnviroment: process.env.NODE_ENV || "development"
};

export default config;