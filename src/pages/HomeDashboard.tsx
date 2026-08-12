import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonBadge,
  IonButtons,
  IonMenuButton,
  IonSpinner
} from '@ionic/react';
import {
  calendarOutline,
  trophyOutline,
  personCircleOutline,
  arrowForwardOutline,
  tennisballOutline,
  shieldCheckmarkOutline,
  starOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import { Court, Reservation } from '../interfaces/types';

export const HomeDashboard: React.FC = () => {
  const history = useHistory();
  const [courts, setCourts] = useState<Court[]>([]);
  const [activeReservationsCount, setActiveReservationsCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>('Jugador');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courtsRes, reservationsRes, profileRes] = await Promise.all([
        api.get<Court[]>('/courts'),
        api.get<Reservation[]>('/reservations/my'),
        api.get<any>('/users/me')
      ]);

      setCourts(courtsRes.data.slice(0, 2));

      // Calcular reservas activas (no canceladas y con fecha futura)
      const now = Date.now();
      const activeCount = reservationsRes.data.filter((res) => {
        const startTime = res.slot?.startTime ? new Date(res.slot.startTime).getTime() : 0;
        return startTime >= now && res.status !== 'CANCELLED';
      }).length;

      setActiveReservationsCount(activeCount);
      setUserName(profileRes.data.name || 'Jugador');
    } catch (err: any) {
      console.error('Error al cargar datos del Dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o no autorizada. Redirigiendo...');
      } else {
        setError('No se pudo conectar al servidor. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <IonPage id="home-dashboard-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800', letterSpacing: '0.5px' }}>CanchaYA</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/app/perfil')} title="Mi Perfil">
              <IonIcon slot="icon-only" icon={personCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.3)', marginBottom: '16px' }} />
            <IonText color="medium">Cargando tu panel de control...</IonText>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '24px' }}>
            <IonText color="danger">
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>¡Ups! Algo salió mal</h3>
            </IonText>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px', fontSize: '15px' }}>{error}</p>
            <IonButton color="primary" onClick={fetchDashboardData} style={{ '--border-radius': '8px', fontWeight: '600' }}>
              Reintentar
            </IonButton>
          </div>
        ) : (
          <>
            {/* Banner de Bienvenida Premium */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)',
              borderRadius: '16px',
              padding: '24px 20px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 8px 20px rgba(30, 58, 138, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Círculos decorativos abstractos de fondo */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '20%',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none'
              }} />

              <IonBadge color="tertiary" style={{ borderRadius: '20px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
                🎾 Temporada de Pádel 2026
              </IonBadge>
              <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '900', lineHeight: '1.2' }}>
                ¡Hola, {userName}!
              </h1>
              <p style={{ margin: '8px 0 16px 0', fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: '400', lineHeight: '1.4' }}>
                Tu próxima victoria te espera en la cancha. Reserva de forma rápida, juega y gestiona tus puntuaciones en tiempo real.
              </p>
              <IonButton 
                color="light" 
                style={{ '--border-radius': '10px', fontWeight: '700', fontSize: '14px', margin: '0' }}
                onClick={() => history.push('/app/courts')}
              >
                Reservar Ahora
                <IonIcon slot="end" icon={arrowForwardOutline} />
              </IonButton>
            </div>

            <IonGrid style={{ padding: '0', marginBottom: '16px' }}>
              <IonRow>
                <IonCol size="12">
                  <IonCard style={{ margin: '0 0 16px 0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <IonCardContent style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <IonIcon icon={calendarOutline} color="secondary" style={{ fontSize: '24px', marginRight: '8px' }} />
                        <IonText color="medium" style={{ fontSize: '12px', fontWeight: '600' }}>Reservas</IonText>
                      </div>
                      <h2 style={{ margin: '0', fontSize: '22px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
                        {activeReservationsCount} Activa{activeReservationsCount !== 1 ? 's' : ''}
                      </h2>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Sección de Canchas Recomendadas / Resumen */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
                Canchas Disponibles
              </h2>
              <IonButton fill="clear" onClick={() => history.push('/app/courts')} style={{ fontWeight: '600', fontSize: '14px' }}>
                Ver Todas
              </IonButton>
            </div>

            {courts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <IonText color="medium">No hay canchas recomendadas disponibles por el momento.</IonText>
              </div>
            ) : (
              <IonGrid style={{ padding: '0' }}>
                <IonRow>
                  {courts.map((court) => (
                    <IonCol size="12" key={court.id}>
                      <IonCard style={{ margin: '0 0 16px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', height: '110px' }}>
                          <div style={{ width: '40%', position: 'relative' }}>
                            {court.imageUrl ? (
                              <img 
                                src={court.imageUrl} 
                                alt={court.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff'
                              }}>
                                <IonIcon icon={tennisballOutline} style={{ fontSize: '32px', opacity: 0.5 }} />
                              </div>
                            )}
                          </div>
                          <div style={{ width: '60%', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <IonBadge color={court.type === 'indoor' ? 'tertiary' : 'warning'} style={{ fontSize: '10px', borderRadius: '4px' }}>
                                  {court.type === 'indoor' ? 'Techada' : 'Descubierta'}
                                </IonBadge>
                                <IonText color="medium" style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                                  <IonIcon icon={starOutline} style={{ color: '#fbbf24', marginRight: '2px' }} />
                                  4.8
                                </IonText>
                              </div>
                              <h3 style={{ margin: '6px 0 0 0', fontSize: '16px', fontWeight: '700', color: 'var(--ion-text-color)' }}>
                                {court.name}
                              </h3>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <IonText color="dark" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                ${(court.pricePerHour || 0).toFixed(2)}/h
                              </IonText>
                              <IonButton 
                                size="small" 
                                color="primary" 
                                style={{ '--border-radius': '6px', margin: '0' }}
                                onClick={() => history.push('/app/courts')}
                              >
                                Reservar
                              </IonButton>
                            </div>
                          </div>
                        </div>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}

            {/* Tips / Recomendaciones */}
            <IonCard style={{ margin: '8px 0 24px 0', borderRadius: '12px', background: 'var(--ion-color-light)', borderLeft: '5px solid var(--ion-color-secondary)' }}>
              <IonCardHeader style={{ padding: '12px 16px 4px 16px' }}>
                <IonCardSubtitle style={{ color: 'var(--ion-color-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <IonIcon icon={shieldCheckmarkOutline} style={{ marginRight: '6px', fontSize: '16px' }} />
                  Tips CanchaYA
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: '4px 16px 12px 16px', fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                Recuerda calentar al menos 10 minutos antes de ingresar a la pista para evitar lesiones y mejorar tu rendimiento.
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
