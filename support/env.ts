import fs from 'fs';
import path from 'path';
type PropertiesReader = {
  get(key: string): string | number | boolean | undefined;
};

const propertiesReader = require('properties-reader') as (filePath: string) => PropertiesReader;

const configDirectory = path.resolve(process.cwd(), 'config');
const environmentFile = path.join(configDirectory, 'env.properties');
const selectedEnvironment = propertiesReader(environmentFile).get('env')?.toString() || 'staging';
const environmentPath = path.join(configDirectory, 'environments', `${selectedEnvironment}.properties`);

if (!fs.existsSync(environmentPath)) throw new Error(`Environment file not found: ${environmentPath}`);
const values = propertiesReader(environmentPath);
const normalizeBaseUrl = (value: string) => `${value.replace(/\/$/, '')}/`;

export const ENV_CONFIG = {
  env: selectedEnvironment,
  baseApiUrl: normalizeBaseUrl(values.get('BASE_API_URL')?.toString() || ''),
  altApiUrl: normalizeBaseUrl(values.get('ALT_API_URL')?.toString() || ''),
  apiKey: values.get('API_KEY')?.toString() || '',
  feClientKey: values.get('FE_CLIENT_KEY')?.toString() || '',
  customerEmail: values.get('CUSTOMER_EMAIL')?.toString() || '',
  customerPassword: values.get('CUSTOMER_PASSWORD')?.toString() || '',
  timeout: Number(values.get('TIMEOUT') || 40000)
};
