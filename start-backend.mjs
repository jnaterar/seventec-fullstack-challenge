import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const ENV_PATH = join(__dirname, 'apps/backend/.env');
const TSCONFIG_PATH = join(__dirname, 'apps/backend/tsconfig.json');
const ENTRY_POINT = join(__dirname, 'apps/backend/src/main.ts');
const PORT = process.env.PORT || 3000;

// Configurar el entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Configurar el comando para ejecutar con tsx y cargar dotenv
const command = 'node';
const args = [
  '--require', 'dotenv/config',
  '--require', 'tsx/cjs',
  ENTRY_POINT,
  `dotenv_config_path=${ENV_PATH}`,
  'dotenv_config_debug=false'
];

// Configuración del entorno para el proceso hijo
const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT
};

// Iniciar el servidor
console.log('Starting backend server...');
console.log(`Port: ${PORT}`);
console.log(`Entry point: ${ENTRY_POINT}`);
console.log(`Command: ${command} ${args.join(' ')}`);

const server = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: env
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

server.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Process exited with code ${code}`);
  } else if (signal) {
    console.log(`Process killed with signal ${signal}`);
  }
});

process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.kill('SIGINT');
  process.exit(0);
});
