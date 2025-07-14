import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta al archivo de configuración de Firebase (desde la raíz del proyecto)
const sourcePath = join(process.cwd(), 'firebase-web-keys.json');
// Ruta de destino en el directorio público
const destPath = join(process.cwd(), 'apps', 'frontend', 'public', 'firebase-web-keys.json');

try {
  // Verificar si el archivo fuente existe
  if (!existsSync(sourcePath)) {
    throw new Error(`El archivo de configuración no existe en: ${sourcePath}`);
  }

  // Crear el directorio de destino si no existe
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  // Copiar el archivo
  copyFileSync(sourcePath, destPath);
  console.log(`✅ Archivo de configuración copiado a: ${destPath}`);
} catch (error) {
  console.error('❌ Error al copiar el archivo de configuración de Firebase:');
  console.error(error.message);
  console.error('\nAsegúrate de que el archivo firebase-web-keys.json existe en la raíz del proyecto.');
  process.exit(1);
}
