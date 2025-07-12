
/**
 * Interfaz para el repositorio de notificaciones
 */
export interface NotificationPort {
  /**
   * Envía una notificación push a múltiples tokens FCM.
   * @param tokens Array de tokens de dispositivos (máximo 500 por lote según los límites de FCM)
   * @param title  Título de la notificación
   * @param body   Texto del cuerpo de la notificación
   * @param data   Carga útil de datos personalizados (opcional)
   */
  sendMulticast(
    tokens : string[],
    title  : string,
    body   : string,
    data   ?: Record<string, string>
  ): Promise<void>;
}
