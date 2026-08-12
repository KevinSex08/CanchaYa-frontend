import api from './api';
import { StartGamePayload, FinishGamePayload, GameRecord } from '../interfaces/types';

/**
 * Servicio para gestionar el registro de partidos (requiere token de administrador)
 */
export const gameService = {
  /**
   * Registra el inicio de un partido basado en una reserva existente
   * POST /game-records
   * Payload: { reservationId: number }
   */
  startGameRecord: async (payload: StartGamePayload): Promise<GameRecord> => {
    try {
      const response = await api.post<GameRecord>('/game-records', payload);
      return response.data;
    } catch (error) {
      console.error('Error al iniciar registro del partido:', error);
      throw error;
    }
  },

  /**
   * Finaliza el partido y registra el marcador (score) dinámico
   * PUT /game-records/:id/score
   */
  finishGameRecord: async (id: number, payload: FinishGamePayload): Promise<GameRecord> => {
    try {
      const response = await api.put<GameRecord>(`/game-records/${id}/score`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error al finalizar el partido ${id}:`, error);
      throw error;
    }
  }
};
