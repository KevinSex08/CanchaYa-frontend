/**
 * Tipos de datos para el dominio de CanchaYA
 */

export interface Court {
  id: number;
  name: string;
  location?: string;
  imageUrl?: string;
  type?: 'indoor' | 'outdoor';
  surface?: 'glass' | 'wall' | 'panoramic';
  description?: string;
  pricePerHour: number;
}

export interface Slot {
  id: number;
  courtId: number;
  startTime: string; // Formato ISO o HH:mm (ej. "2026-08-03T10:00:00Z" o "10:00")
  endTime: string;
  price: number;
  isAvailable: boolean;
}

export type GameType = 'SINGLES' | 'DOUBLES';

export interface Reservation {
  id: number;
  slotId: number;
  userId: string;
  gameType: GameType;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  slot?: Slot;
  court?: Court;
}

export interface CreateReservationPayload {
  slotIds: number[];
  gameType: string; // Ej. "DOUBLES" o "SINGLES" o "SUPER_8"
}

export interface GameRecord {
  id: number;
  reservationId: number;
  status: 'STARTED' | 'FINISHED';
  scoreTeam1?: number;
  scoreTeam2?: number;
  startTime: string;
  endTime?: string;
  additionalStats?: string;
}

export interface StartGamePayload {
  reservationId: number;
}

export interface FinishGamePayload {
  teamAScore?: number;
  teamBScore?: number;
  winnerTeam?: string;
  additionalStats?: string; // JSON con los resultados de Super 8 u otros
}

/**
 * Tipos de datos para la autenticación
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CognitoAuthResult {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string;
}

export interface CognitoLoginResponse {
  AuthenticationResult?: CognitoAuthResult;
  ChallengeName?: string;
  ChallengeParameters?: Record<string, string>;
  Session?: string;
}

// Extensión global para admitir variables de entorno de Vite y Webpack sin errores de tipo
declare global {
  interface ImportMeta {
    readonly env: {
      readonly [key: string]: string | undefined;
    };
  }
}
