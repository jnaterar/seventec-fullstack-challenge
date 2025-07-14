# Convention App

Aplicación fullstack para gestión de convenciones desarrollada con React, TypeScript, Express y Firebase, siguiendo principios de arquitectura hexagonal y clean architecture.

## Características

### Frontend (React + TypeScript + Vite)
- **Autenticación**: Login, registro y recuperación de contraseña
- **Rutas Protegidas**: Acceso restringido basado en autenticación
- **UI Moderna**: Diseño responsivo con Material-UI
- **Gestión de Estado**: Context API para autenticación
- **Enrutamiento**: React Router v6
- **Variables de Entorno**: Configuración segura con Vite

### Backend (Express + TypeScript)
- **Arquitectura Hexagonal**: Separación clara de responsabilidades
- **Autenticación JWT**: Seguridad robusta con tokens
- **Firebase Admin**: Integración con servicios de Firebase
- **Validación de Datos**: Usando class-validator
- **Manejo de Errores**: Middleware centralizado
- **Testing**: Configuración para pruebas unitarias y de integración

### Infraestructura
- **Firebase Functions**: Backend serverless
- **Firestore**: Base de datos NoSQL
- **Firebase Auth**: Gestión de usuarios
- **Firebase Storage**: Almacenamiento de archivos
- **Emuladores Locales**: Desarrollo y pruebas locales

## 🛠️ Estructura del Proyecto

```
seventec-fullstack-challenge/
├── apps/
│   ├── frontend/           # Aplicación React
│   │   ├── src/
│   │   │   ├── app/       # Componentes principales
│   │   │   ├── features/   # Características (auth, posts, etc.)
│   │   │   ├── shared/     # Componentes y utilidades compartidas
│   │   │   └── firebase/   # Configuración de Firebase
│   │   └── ...
│   └── backend/            # API REST con Express
│       └── src/
│           ├── config/     # Configuraciones
│           ├── core/       # Lógica de negocio
│           │   ├── application/
│           │   └── domain/
│           └── infrastructure/
│               ├── http/   # Controladores y rutas
│               └── persistence/ # Acceso a datos
├── functions/              # Firebase Functions
└── ...
```

## Empezando

### Requisitos Previos

- Node.js 18+
- npm 9+
- Firebase CLI
- Cuenta de Firebase

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd seventec-fullstack-challenge
   ```

2. Instalar dependencias:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en el directorio raíz
   - Configurar las variables de Firebase y otras configuraciones

### Desarrollo

#### Frontend
```bash
# Iniciar servidor de desarrollo
npm run start:front

# Construir para producción
npm run build:front
```

#### Backend
```bash
# Iniciar servidor de desarrollo
npm run start:back

# Construir para producción
npm run build:back
```

#### Firebase
```bash
# Iniciar emuladores
npm run serve:functions

# Desplegar funciones
npm run deploy:functions
```

## Testing

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Verificar cobertura de código
npm run test:cov
```

## 🛡️ Seguridad

- Autenticación JWT con expiración
- Validación de entrada en todos los endpoints
- Protección contra inyección SQL/NoSQL
- Headers de seguridad HTTP
- Variables de entorno para datos sensibles

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestras [guías de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## 📧 Contacto

[Jhonder Natera] - [jhonder.natera@email.com]

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MUI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=mui&logoColor=white)](https://mui.com/)
