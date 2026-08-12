import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonButton,
  IonSpinner,
  IonText,
  IonToast,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { calendarOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { courtService, reservationService, Slot, Court } from '../services';

export const ReservationWizardPage: React.FC = () => {
  const history = useHistory();

  // Estados del Wizard
  const [step, setStep] = useState<number>(1);
  const [gameMode, setGameMode] = useState<'CLASSIC' | 'SUPER_8'>('CLASSIC');
  
  // Datos
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reserving, setReserving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  
  // Selección
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);

  useEffect(() => {
    if (step === 2) {
      fetchData();
    }
  }, [step]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsData, courtsData] = await Promise.all([
        courtService.getAvailableSlots(), // Sin courtId para traer todos
        courtService.getCourts()
      ]);
      setAvailableSlots(slotsData);
      setCourts(courtsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Error al cargar horarios disponibles. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar slots por hora de inicio (para mostrarlos en la UI)
  const slotsByTime = availableSlots.reduce((acc, slot) => {
    const time = slot.startTime.substring(0, 5); // ej. "10:00"
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Ordenar las horas
  const sortedTimes = Object.keys(slotsByTime).sort();

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    
    // Auto-asignación de canchas
    const slotsAtThisTime = slotsByTime[time];
    const courtsRequired = gameMode === 'SUPER_8' ? 2 : 1;

    if (slotsAtThisTime.length < courtsRequired) {
      setError(`No hay suficientes canchas disponibles a las ${time} para el modo seleccionado.`);
      setSelectedSlots([]);
      return;
    }

    // Seleccionar las primeras N canchas disponibles
    setSelectedSlots(slotsAtThisTime.slice(0, courtsRequired));
    setError(null);
    setStep(3); // Avanzar a confirmación
  };

  const handleReserve = async () => {
    if (selectedSlots.length === 0) return;
    setReserving(true);
    setError(null);
    
    try {
      const slotIds = selectedSlots.map(s => s.id);
      await reservationService.createReservation({
        slotIds,
        gameType: gameMode
      });
      
      setShowToast(true);
      setTimeout(() => {
        history.push('/app/mis-partidos');
      }, 1500);
    } catch (err: any) {
      console.error('Error al reservar:', err);
      setError('Error al procesar la reserva. ' + (err.message || ''));
    } finally {
      setReserving(false);
    }
  };

  const getCourtName = (courtId: number) => {
    return courts.find(c => c.id === courtId)?.name || `Cancha ${courtId}`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/courts" />
          </IonButtons>
          <IonTitle>Nueva Reserva</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' }}>
        
        {/* Progreso del Wizard */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              background: step >= i ? 'var(--ion-color-primary)' : '#ccc',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {i}
            </div>
          ))}
        </div>

        {/* PASO 1: Modalidad */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
              Elige tu Modo de Juego
            </h2>
            
            <IonCard 
              onClick={() => setGameMode('CLASSIC')}
              style={{ 
                border: gameMode === 'CLASSIC' ? '2px solid var(--ion-color-primary)' : '2px solid transparent',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              <IonCardContent style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>Pádel Clásico</h3>
                <p style={{ color: 'var(--ion-color-medium)' }}>Dobles (4 jugadores). Requiere 1 cancha.</p>
              </IonCardContent>
            </IonCard>

            <IonCard 
              onClick={() => setGameMode('SUPER_8')}
              style={{ 
                border: gameMode === 'SUPER_8' ? '2px solid var(--ion-color-secondary)' : '2px solid transparent',
                marginBottom: '24px',
                cursor: 'pointer'
              }}
            >
              <IonCardContent style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>Súper 8</h3>
                <p style={{ color: 'var(--ion-color-medium)' }}>Competencia dinámica (8 jugadores). Requiere 2 canchas simultáneas.</p>
              </IonCardContent>
            </IonCard>

            <IonButton expand="block" onClick={() => setStep(2)}>
              Continuar a Horarios
            </IonButton>
          </div>
        )}

        {/* PASO 2: Selección de Hora */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
              Horarios Disponibles
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)', marginBottom: '20px' }}>
              Buscando para modo {gameMode === 'CLASSIC' ? 'Clásico (1 Cancha)' : 'Súper 8 (2 Canchas)'}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonSpinner name="crescent" color="primary" />
                <p>Cargando disponibilidad global...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={alertCircleOutline} color="danger" style={{ fontSize: '48px' }} />
                <p style={{ color: 'var(--ion-color-danger)' }}>{error}</p>
                <IonButton fill="outline" onClick={fetchData}>Reintentar</IonButton>
              </div>
            ) : sortedTimes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonIcon icon={calendarOutline} style={{ fontSize: '48px', color: '#ccc' }} />
                <p>No hay horarios disponibles en este momento.</p>
              </div>
            ) : (
              <IonList style={{ background: 'transparent' }}>
                {sortedTimes.map(time => {
                  const slots = slotsByTime[time];
                  const required = gameMode === 'SUPER_8' ? 2 : 1;
                  const isAvailable = slots.length >= required;

                  return (
                    <IonItem 
                      key={time} 
                      button 
                      onClick={() => isAvailable && handleSelectTime(time)}
                      disabled={!isAvailable}
                      style={{ 
                        '--background': 'white', 
                        borderRadius: '12px', 
                        marginBottom: '10px',
                        opacity: isAvailable ? 1 : 0.6
                      }}
                      lines="none"
                    >
                      <IonIcon icon={timeOutline} slot="start" color={isAvailable ? 'primary' : 'medium'} />
                      <IonLabel>
                        <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>{time}</h3>
                        <p style={{ color: isAvailable ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }}>
                          {slots.length} cancha{slots.length !== 1 ? 's' : ''} libre{slots.length !== 1 ? 's' : ''}
                        </p>
                      </IonLabel>
                    </IonItem>
                  );
                })}
              </IonList>
            )}
            
            <IonButton expand="block" fill="clear" onClick={() => setStep(1)}>
              Atrás
            </IonButton>
          </div>
        )}

        {/* PASO 3: Confirmación */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
              Confirmar Reserva
            </h2>
            
            <IonCard style={{ marginBottom: '24px' }}>
              <IonCardContent>
                <h3 style={{ fontWeight: 'bold', color: 'var(--ion-color-dark)', marginBottom: '12px' }}>Resumen:</h3>
                
                <p><strong>Modo:</strong> {gameMode === 'CLASSIC' ? 'Pádel Clásico' : 'Súper 8'}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                
                <div style={{ marginTop: '16px' }}>
                  <p><strong>Canchas asignadas automáticamente:</strong></p>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    {selectedSlots.map(slot => (
                      <li key={slot.id} style={{ marginBottom: '4px' }}>
                        {getCourtName(slot.courtId)} (ID: {slot.courtId})
                      </li>
                    ))}
                  </ul>
                </div>
              </IonCardContent>
            </IonCard>

            {error && (
              <IonText color="danger" style={{ display: 'block', textAlign: 'center', marginBottom: '16px' }}>
                {error}
              </IonText>
            )}

            <IonButton 
              expand="block" 
              onClick={handleReserve}
              disabled={reserving}
              color="success"
            >
              {reserving ? <IonSpinner name="dots" /> : 'Confirmar Reserva'}
            </IonButton>
            
            <IonButton expand="block" fill="clear" onClick={() => setStep(2)} disabled={reserving}>
              Cambiar Hora
            </IonButton>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="¡Reserva creada exitosamente!"
          duration={3000}
          color="success"
          icon={checkmarkCircleOutline}
        />
      </IonContent>
    </IonPage>
  );
};

export default ReservationWizardPage;
