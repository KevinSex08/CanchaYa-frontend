import api from './api';
import { CreateReservationPayload, Reservation } from '../interfaces/types';

/**
 * Servicio para gestionar las reservas del jugador (requiere token de autenticación)
 */
export const reservationService = {
  /**
   * Crea una nueva reserva para un horario específico
   * POST /reservations
   * Payload: { slotId: number, gameType: string }
   */
  createReservation: async (payload: CreateReservationPayload): Promise<Reservation> => {
    try {
      const response = await api.post<Reservation>('/reservations/', payload);
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de reservas asociadas al usuario autenticado
   * GET /reservations/my
   */
  getMyReservations: async (): Promise<Reservation[]> => {
    try {
      const response = await api.get<Reservation[]>('/reservations/my');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis reservas:', error);
      throw error;
    }
  },

  /**
   * Cancela una reserva específica mediante su ID
   * PATCH /reservations/:id/cancel
   */
  cancelReservation: async (id: number): Promise<Reservation> => {
    try {
      const response = await api.patch<Reservation>(`/reservations/${id}/cancel/`);
      return response.data;
    } catch (error) {
      console.error(`Error al cancelar la reserva ${id}:`, error);
      throw error;
    }
  }
};
