import api from './api';

/**
 * Servicio para consumir endpoints del administrador
 * TODO: Backend necesita implementar estos endpoints
 */
export const adminService = {
  /**
   * Obtener todas las canchas para el panel admin
   */
  getCourts: async () => {
    return await api.get('/courts');
  },

  /**
   * Crear una nueva cancha
   */
  createCourt: async (payload: any) => {
    return await api.post('/courts', payload);
  },

  /**
   * Editar una cancha existente
   */
  updateCourt: async (id: number, payload: any) => {
    return await api.put(`/courts/${id}`, payload);
  },

  /**
   * Obtener todas las reservas del sistema (requiere rol ADMIN)
   */
  getAllReservations: async () => {
    return await api.get('/reservations');
  },

  /**
   * Generar horarios (slots) para una cancha y fecha
   */
  createSlots: async (courtId: number, date: string, startTime: string, endTime: string, slotDuration: number, price: number) => {
    return await api.post('/admin/slots', {
      courtId,
      date,
      startTime,
      endTime,
      slotDuration,
      price
    });
  },

  /**
   * Dar permisos de administrador a un usuario
   */
  makeAdmin: async (email: string) => {
    // Note: this calls /users/admin/roles because it's handled by users microservice
    return await api.post('/users/admin/roles', { email });
  }
};
