/**
 * Utilidades para el manejo de fechas con zona horaria específica
 */

/**
 * Crea una fecha en la zona horaria de Lima, Perú (America/Lima)
 * @returns Date objeto Date ajustado a la zona horaria de Lima
 */
export function createDateWithLimaTimezone(): Date {
  // Obtenemos la fecha actual
  const now = new Date();
  
  // Lima, Perú está en UTC-5
  // Ajustamos a la zona horaria de Lima (UTC-5)
  const limaOffsetHours = -5;
  const userOffset = now.getTimezoneOffset() / 60; // Convertir minutos a horas
  const hoursDifference = userOffset + limaOffsetHours;
  
  // Ajustar la hora según la diferencia entre la zona horaria local y Lima
  now.setHours(now.getHours() + hoursDifference);
  
  return now;
}

/**
 * Convierte una fecha existente a la zona horaria de Lima, Perú
 * @param date Fecha a convertir
 * @returns Date objeto Date ajustado a la zona horaria de Lima
 */
export function convertToLimaTimezone(date: Date): Date {
  const limaDate = new Date(date);
  
  // Lima, Perú está en UTC-5
  // Ajustamos a la zona horaria de Lima (UTC-5)
  const limaOffsetHours = -5;
  const userOffset = date.getTimezoneOffset() / 60; // Convertir minutos a horas
  const hoursDifference = userOffset + limaOffsetHours;
  
  // Ajustar la hora según la diferencia entre la zona horaria local y Lima
  limaDate.setHours(limaDate.getHours() + hoursDifference);
  
  return limaDate;
}
