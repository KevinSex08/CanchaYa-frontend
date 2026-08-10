// Exportación de la instancia base de Axios
export { default as api } from './api';

// Exportación del servicio de autenticación Cognito
export { authService } from './auth';

// Exportación de los servicios específicos por dominio
export { courtService } from './courts';
export { reservationService } from './reservations';
export { gameService } from './games';

// Exportación de todos los tipos TypeScript reubicados
export * from '../interfaces/types';
