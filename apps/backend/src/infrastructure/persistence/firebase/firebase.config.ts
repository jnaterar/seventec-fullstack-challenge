import * as fs from 'fs';
import * as path from 'path';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';

// Cargar las credenciales desde el archivo JSON (ubicado en la raiz del proyecto)
const serviceAccountPath = path.join(process.cwd(), 'firebase-keys.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

/**
 * Clase para manejar la configuración de Firebase Admin
 */
export class FirebaseAdmin {
    private static instance : FirebaseAdmin;
    private _app            : admin.app.App;
    private _firestore      : FirebaseFirestore.Firestore;
    private _auth           : admin.auth.Auth;

    private constructor() {
        // Validar que el archivo de credenciales exista
        if (!fs.existsSync(serviceAccountPath)) {
            throw new Error(`No se encontró el archivo de credenciales de Firebase en: ${serviceAccountPath}`);
        }

        // Inicializar la aplicación de Firebase Admin con las credenciales del archivo
        this._app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as ServiceAccount)
        });
        this._firestore = getFirestore(this._app);
        this._auth = admin.auth();

        /**
         * Inicializar Firestore
         */
        this._firestore.settings({
            ignoreUndefinedProperties: true,
        });
    }

    /**
     * Obtener la instancia de Firebase Admin
     */
    public static getInstance(): FirebaseAdmin {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
            console.log('Administrador Firebase inicializado');
        }

        return FirebaseAdmin.instance;
    }

    /**
     * Obtener la instancia de Firestore
     */
    public get firestore(): FirebaseFirestore.Firestore {
        if (!this._firestore) {
            throw new Error('Firestore no ha sido inicializado');
        }

        return this._firestore;
    }

    /**
     * Obtener una instancia de Firebase Authentication
     */
    public get auth(): Auth {
        if (!this._auth) {
            throw new Error('Firebase Authentication no ha sido inicializado');
        }

        return this._auth;
    }

    /**
     * Cerrar la conexión con Firebase
     */
    public async close(): Promise<void> {
        if (this._app) {
            await this._app.delete();
            FirebaseAdmin.instance = null as unknown as FirebaseAdmin;
        }
    }
}

/**
 * Inicializa Firebase Admin con las credenciales del archivo
 * @throws {Error} Si falta el archivo de credenciales o hay un error al cargarlo
 */
export function initializeFirebase(): FirebaseAdmin {
    try {
        const instance = FirebaseAdmin.getInstance();        
        return instance;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al inicializar administrador de firebase';
        console.error('Error al inicializar administrador de firebase:', errorMessage);
        throw error;
    }
}

/**
 * Obtener una instancia de Firestore
 */
export function getFirestoreInstance(): FirebaseFirestore.Firestore {
    try {
        return initializeFirebase().firestore;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener instancia de firestore';
        console.error('Error al obtener instancia de firestore:', errorMessage);
        throw error;
    }
}
