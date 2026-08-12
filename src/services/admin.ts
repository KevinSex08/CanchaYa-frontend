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
    // Si la ruta /admin/courts existiera:
    // return await api.get('/admin/courts');
    // Por ahora usamos la pública para que no se rompa la UI
    return await api.get('/courts');
  },

  /**
   * Crear una nueva cancha
   */
  createCourt: async (payload: any) => {
    // Stub
    console.log('Stub: Crear Cancha', payload);
    return Promise.resolve({ data: { id: Date.now(), ...payload } });
  },

  /**
   * Generar horarios (slots) para una cancha y fecha
   */
  createSlots: async (courtId: number, date: string, startTime: string, endTime: string, slotDuration: number, price: number) => {
    // Stub
    console.log('Stub: Generar Horarios', { courtId, date, startTime, endTime, slotDuration, price });
    return Promise.resolve({ data: { message: 'Horarios generados' } });
  },

  /**
   * Dar permisos de administrador a un usuario
   */
  makeAdmin: async (email: string) => {
    // Stub
    console.log('Stub: Hacer Admin a', email);
    return Promise.resolve({ data: { message: 'Permisos actualizados' } });
  }
};
