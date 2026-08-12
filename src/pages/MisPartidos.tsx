import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonBadge,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  RefresherEventDetail
} from '@ionic/react';
import {
  calendarOutline,
  timeOutline,
  locationOutline,
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  layersOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import { Reservation } from '../interfaces/types';

export const MisPartidos: React.FC = () => {
  const history = useHistory();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<'actives' | 'history'>('actives');

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Reservation[]>('/reservations/my');
      
      // Ordenar por fecha del slot (más reciente primero)
      const sorted = response.data.sort((a, b) => {
        const timeA = a.slot?.startTime ? new Date(a.slot.startTime).getTime() : 0;
        const timeB = b.slot?.startTime ? new Date(b.slot.startTime).getTime() : 0;
        return timeB - timeA;
      });
      setReservations(sorted);
    } catch (err: any) {
      console.error('Error al cargar reservas:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o no autorizada. Redirigiendo...');
      } else {
        setError('No se pudieron obtener tus partidos. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchReservations();
    event.detail.complete();
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      try {
        await api.patch(`/reservations/${id}/cancel/`);
        alert('Reserva cancelada con éxito');
        fetchReservations();
      } catch (err: any) {
        console.error('Error al cancelar la reserva:', err);
        alert('Error al cancelar la reserva. Por favor intenta más tarde.');
      }
    }
  };

  // Filtrar reservas según el segmento
  const filteredReservations = reservations.filter(res => {
    const isPast = res.slot?.startTime ? new Date(res.slot.startTime).getTime() < Date.now() : false;
    const isCancelled = res.status === 'CANCELLED';

    if (segment === 'actives') {
      return !isPast && !isCancelled;
    } else {
      return isPast || isCancelled;
    }
  });

  // Formatear Fecha legible
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatear Hora legible
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' hs';
  };

  return (
    <IonPage id="mis-partidos-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800' }}>Mis Partidos</IonTitle>
        </IonToolbar>
        
        {/* Barra de Segmentos Estilizada */}
        <IonToolbar color="primary" style={{ padding: '0 4px' }}>
          <IonSegment 
            value={segment} 
            onIonChange={(e) => setSegment(e.detail.value as 'actives' | 'history')}
            style={{ '--background': 'rgba(255,255,255,0.1)', '--color': '#ffffff', '--color-checked': 'var(--ion-color-primary)' }}
          >
            <IonSegmentButton value="actives" style={{ '--color-focused': '#fff', fontSize: '13px', fontWeight: 'bold' }}>
              Próximos
            </IonSegmentButton>
            <IonSegmentButton value="history" style={{ '--color-focused': '#fff', fontSize: '13px', fontWeight: 'bold' }}>
              Historial
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Soporte para Pull-to-Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent 
            pullingIcon={refreshOutline}
            pullingText="Tira para actualizar..."
            refreshingSpinner="crescent"
            refreshingText="Cargando tus partidos..."
          />
        </IonRefresher>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.3)', marginBottom: '16px' }} />
            <IonText color="medium">Cargando partidos...</IonText>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', padding: '24px' }}>
            <IonText color="danger">
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>¡Ups! Algo salió mal</h3>
            </IonText>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px', fontSize: '15px' }}>{error}</p>
            <IonButton color="primary" onClick={fetchReservations} style={{ '--border-radius': '8px', fontWeight: '600' }}>
              Reintentar
            </IonButton>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', padding: '24px' }}>
            <IonIcon icon={calendarOutline} color="medium" style={{ fontSize: '72px', opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0', color: 'var(--ion-text-color)' }}>
              No tienes partidos {segment === 'actives' ? 'programados' : 'en el historial'}
            </h3>
            <p style={{ color: 'var(--ion-color-medium)', fontSize: '14px', margin: '8px 24px 20px 24px' }}>
              {segment === 'actives' 
                ? 'Reserva una cancha hoy mismo para empezar a jugar y competir.' 
                : 'Las reservas canceladas o pasadas aparecerán aquí.'}
            </p>
            {segment === 'actives' && (
              <IonButton color="primary" onClick={() => history.push('/app/courts')} style={{ '--border-radius': '8px', fontWeight: '600' }}>
                Explorar Canchas
              </IonButton>
            )}
          </div>
        ) : (
          <IonList style={{ background: 'transparent' }}>
            {filteredReservations.map((reservation) => {
              const statusColor = reservation.status === 'CONFIRMED' ? 'success' : 'danger';
              const statusLabel = reservation.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado';
              const statusIcon = reservation.status === 'CONFIRMED' ? checkmarkCircleOutline : closeCircleOutline;
              const isIndoor = reservation.court?.type === 'indoor';

              return (
                <IonItem 
                  key={reservation.id}
                  style={{
                    '--background': 'var(--ion-card-background, #ffffff)',
                    '--border-color': 'rgba(0,0,0,0.06)',
                    '--padding-start': '0px',
                    '--inner-padding-end': '0px',
                    borderRadius: '12px',
                    margin: '12px 0px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                  lines="none"
                >
                  <div style={{ width: '100%', padding: '16px' }}>
                    {/* Fila 1: Título de Cancha y Badge de Estado */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: 'var(--ion-text-color)' }}>
                          {reservation.court?.name || 'Cancha CanchaYA'}
                        </h3>
                        <IonText color="medium" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                          <IonIcon icon={locationOutline} style={{ marginRight: '4px' }} />
                          {reservation.court?.location || 'Sede Club'}
                        </IonText>
                      </div>
                      <IonBadge color={statusColor} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                        <IonIcon icon={statusIcon} style={{ marginRight: '4px', fontSize: '13px' }} />
                        {statusLabel}
                      </IonBadge>
                    </div>

                    {/* Fila 2: Separador visual delgado */}
                    <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '12px 0' }} />

                    {/* Fila 3: Detalles de Fecha, Hora y Modalidad */}
                    <IonGrid style={{ padding: '0' }}>
                      <IonRow>
                        <IonCol size="6" style={{ padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IonIcon icon={calendarOutline} color="primary" style={{ fontSize: '16px', marginRight: '6px' }} />
                            <div>
                              <IonText color="medium" style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Fecha</IonText>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ion-text-color)' }}>
                                {formatDate(reservation.slot?.startTime)}
                              </span>
                            </div>
                          </div>
                        </IonCol>
                        <IonCol size="6" style={{ padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IonIcon icon={timeOutline} color="primary" style={{ fontSize: '16px', marginRight: '6px' }} />
                            <div>
                              <IonText color="medium" style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Horario</IonText>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ion-text-color)' }}>
                                {formatTime(reservation.slot?.startTime)}
                              </span>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                      <IonRow style={{ marginTop: '8px' }}>
                        <IonCol size="6" style={{ padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IonIcon icon={peopleOutline} color="secondary" style={{ fontSize: '16px', marginRight: '6px' }} />
                            <div>
                              <IonText color="medium" style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Modalidad</IonText>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ion-text-color)' }}>
                                {reservation.gameType === 'DOUBLES' ? 'Dobles (4 jugadores)' : 'Individuales (2 jugadores)'}
                              </span>
                            </div>
                          </div>
                        </IonCol>
                        <IonCol size="6" style={{ padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <IonIcon icon={layersOutline} color="tertiary" style={{ fontSize: '16px', marginRight: '6px' }} />
                            <div>
                              <IonText color="medium" style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Tipo de Pista</IonText>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ion-text-color)' }}>
                                {isIndoor ? 'Techada' : 'Al aire libre'} - {reservation.court?.surface ? reservation.court.surface.toUpperCase() : 'ESTÁNDAR'}
                              </span>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    {/* Botones de acción contextual según el estado de la reserva */}
                    {segment === 'actives' && reservation.status === 'CONFIRMED' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                        <IonButton 
                          fill="outline" 
                          color="danger" 
                          size="small"
                          style={{ '--border-radius': '6px', fontSize: '12px', fontWeight: '600', margin: '0' }}
                          onClick={() => handleCancel(reservation.id)}
                        >
                          Cancelar Turno
                        </IonButton>
                        <IonButton 
                          color="secondary" 
                          size="small"
                          style={{ '--border-radius': '6px', fontSize: '12px', fontWeight: '600', margin: '0' }}
                          onClick={() => {
                            window.location.href = `/admin/scoreboard/${reservation.id}`;
                          }}
                        >
                          Anotar Score
                        </IonButton>
                      </div>
                    )}
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
