import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de origen y destino
const srcPath = path.resolve(__dirname, '../../../firebase-web-keys.json');
const destPathBuild = path.resolve(__dirname, '../../../dist/apps/frontend/firebase-web-keys.json');
const destPathPublic = path.resolve(__dirname, '../public/firebase-web-keys.json');

// Crear directorio de destino si no existe
[destPathBuild, destPathPublic].forEach(p => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copiar el archivo
try {
  [destPathBuild, destPathPublic].forEach(p => {
  fs.copyFileSync(srcPath, p);
});
  console.log('Configuración de Firebase copiada exitosamente');
} catch (error) {
  console.error('Error al copiar la configuración de Firebase:', error);
  process.exit(1);
}
