import api from './api';
import { Court, Slot } from '../interfaces/types';

/**
 * Servicio para gestionar endpoints públicos relacionados con Canchas y Horarios
 */
export const courtService = {
  /**
   * Obtiene el listado de todas las canchas disponibles
   * GET /courts
   */
  getCourts: async (): Promise<Court[]> => {
    try {
      const response = await api.get<Court[]>('/courts');
      return response.data;
    } catch (error) {
      console.error('Error al obtener canchas:', error);
      throw error;
    }
  },

  /**
   * Obtiene el listado de horarios disponibles filtrado opcionalmente por cancha y fecha
   * GET /slots/available
   */
  getAvailableSlots: async (params?: { courtId?: number; date?: string }): Promise<Slot[]> => {
    try {
      const response = await api.get<Slot[]>('/slots/available/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  },

  /**
   * Obtiene la información detallada de una cancha específica
   * GET /courts/:id
   */
  getCourtDetails: async (id: number): Promise<Court> => {
    try {
      const response = await api.get<Court>(`/courts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalles de la cancha ${id}:`, error);
      throw error;
    }
  }
};
