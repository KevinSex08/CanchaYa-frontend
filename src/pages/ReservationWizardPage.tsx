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
  IonCardContent,
  IonDatetime,
  IonCheckbox
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { calendarOutline, timeOutline, checkmarkCircleOutline, alertCircleOutline, tennisballOutline } from 'ionicons/icons';
import { courtService, reservationService, Slot, Court } from '../services';

export const ReservationWizardPage: React.FC = () => {
  const history = useHistory();

  // Estados del Wizard
  const [step, setStep] = useState<number>(1);
  const [gameMode, setGameMode] = useState<'CLASSIC' | 'SUPER_8'>('CLASSIC');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  
  // Datos
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reserving, setReserving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsData, courtsData] = await Promise.all([
        courtService.getAvailableSlots(), // Trae todos los slots
        courtService.getCourts()
      ]);
      setAvailableSlots(slotsData);
      setCourts(courtsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Error al cargar datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Helper para parsear la fecha/hora del slot robustamente
  const getSlotDateTime = (startTime: string) => {
    try {
      // Soportar tanto '2026-08-13T10:00:00Z' como '2026-08-13 10:00:00'
      const normalized = startTime.replace(' ', 'T');
      if (normalized.includes('T')) {
        return {
          date: normalized.split('T')[0],
          time: normalized.split('T')[1].substring(0, 5)
        };
      }
      // Fallback si el backend solo envía "HH:mm" (asumimos hoy)
      const today = new Date().toISOString().split('T')[0];
      return { date: today, time: startTime.substring(0, 5) };
    } catch (e) {
      return { date: '', time: '' };
    }
  };

  // 2. Filtrar slots por fecha seleccionada y isAvailable === true
  const targetDateStr = selectedDate.split('T')[0]; // "YYYY-MM-DD"
  
  const slotsOnDate = availableSlots.filter(slot => {
    if (!slot.isAvailable) return false;
    const { date } = getSlotDateTime(slot.startTime);
    return date === targetDateStr;
  });

  // 3. Agrupar por hora de inicio
  const slotsByTime = slotsOnDate.reduce((acc, slot) => {
    const { time } = getSlotDateTime(slot.startTime);
    if (!acc[time]) acc[time] = [];
    acc[time].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const sortedTimes = Object.keys(slotsByTime).sort();

  // 4. Obtener slots para la hora seleccionada (Paso 4)
  const slotsAtSelectedTime = selectedTime ? slotsByTime[selectedTime] || [] : [];

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setSelectedSlots([]); // Resetear canchas seleccionadas al cambiar la hora
    setStep(4);
  };

  const handleToggleSlot = (slot: Slot) => {
    const maxAllowed = gameMode === 'SUPER_8' ? 2 : 1;
    const isSelected = selectedSlots.some(s => s.id === slot.id);

    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      if (selectedSlots.length < maxAllowed) {
        setSelectedSlots([...selectedSlots, slot]);
      } else {
        // Reemplazar si ya alcanzó el máximo en Clásico, o ignorar en Super 8
        if (maxAllowed === 1) {
          setSelectedSlots([slot]);
        }
      }
    }
  };

  const autoAssignSuper8 = () => {
    if (slotsAtSelectedTime.length >= 2) {
      setSelectedSlots(slotsAtSelectedTime.slice(0, 2));
    }
  };

  const handleReserve = async () => {
    const required = gameMode === 'SUPER_8' ? 2 : 1;
    if (selectedSlots.length !== required) {
      setError(`Debes seleccionar exactamente ${required} cancha(s) para este modo.`);
      return;
    }

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
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: step >= i ? 'var(--ion-color-primary)' : '#ccc',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {i}
            </div>
          ))}
        </div>

        {/* PASO 1: Modalidad */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#1a1a1a' }}>
              Elige tu Modo de Juego
            </h2>
            
            <IonCard 
              onClick={() => { setGameMode('CLASSIC'); setStep(2); }}
              style={{ 
                border: gameMode === 'CLASSIC' ? '2px solid var(--ion-color-primary)' : '2px solid transparent',
                marginBottom: '16px',
                cursor: 'pointer'
              }}
            >
              <IonCardContent style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>Pádel Clásico</h3>
                <p style={{ color: '#666' }}>Dobles (4 jugadores). Requiere 1 cancha.</p>
              </IonCardContent>
            </IonCard>

            <IonCard 
              onClick={() => { setGameMode('SUPER_8'); setStep(2); }}
              style={{ 
                border: gameMode === 'SUPER_8' ? '2px solid var(--ion-color-secondary)' : '2px solid transparent',
                marginBottom: '24px',
                cursor: 'pointer'
              }}
            >
              <IonCardContent style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>Súper 8</h3>
                <p style={{ color: '#666' }}>Competencia dinámica (8 jugadores). Requiere 2 canchas simultáneas.</p>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* PASO 2: Selección de Fecha */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#1a1a1a' }}>
              Selecciona la Fecha
            </h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
              ¿Cuándo deseas jugar?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <IonDatetime 
                presentation="date" 
                value={selectedDate}
                onIonChange={e => setSelectedDate(e.detail.value as string)}
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </div>

            <IonButton expand="block" onClick={() => setStep(3)}>
              Ver Horarios Disponibles
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => setStep(1)}>
              Atrás
            </IonButton>
          </div>
        )}

        {/* PASO 3: Selección de Hora */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#1a1a1a' }}>
              Horarios para el {targetDateStr}
            </h2>
            <p style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>
              Buscando para modo {gameMode === 'CLASSIC' ? 'Clásico (1 Cancha)' : 'Súper 8 (2 Canchas)'}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonSpinner name="crescent" color="primary" />
                <p style={{ color: '#1a1a1a', marginTop: '16px' }}>Cargando disponibilidad global...</p>
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
                <p style={{ color: '#1a1a1a', marginTop: '16px' }}>No hay canchas libres en esta fecha.</p>
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
                        <h3 style={{ fontWeight: 'bold', fontSize: '18px', color: '#1a1a1a' }}>{time}</h3>
                        <p style={{ color: isAvailable ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }}>
                          {slots.length} cancha{slots.length !== 1 ? 's' : ''} libre{slots.length !== 1 ? 's' : ''}
                        </p>
                      </IonLabel>
                    </IonItem>
                  );
                })}
              </IonList>
            )}
            
            <IonButton expand="block" fill="clear" onClick={() => setStep(2)}>
              Cambiar Fecha
            </IonButton>
          </div>
        )}

        {/* PASO 4: Selección de Canchas y Confirmación */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#1a1a1a' }}>
              Elige tu{gameMode === 'SUPER_8' ? 's' : ''} Cancha{gameMode === 'SUPER_8' ? 's' : ''}
            </h2>
            <p style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>
              Horario: {selectedTime} | Selecciona {gameMode === 'CLASSIC' ? '1 cancha' : '2 canchas'}
            </p>

            {gameMode === 'SUPER_8' && (
               <IonButton expand="block" fill="outline" size="small" onClick={autoAssignSuper8} style={{ marginBottom: '16px' }}>
                 Auto-seleccionar 2 canchas aleatorias
               </IonButton>
            )}

            <IonList style={{ background: 'transparent' }}>
              {slotsAtSelectedTime.map(slot => {
                const isSelected = selectedSlots.some(s => s.id === slot.id);
                const court = courts.find(c => c.id === slot.courtId);
                return (
                  <IonItem 
                    key={slot.id} 
                    button 
                    onClick={() => handleToggleSlot(slot)}
                    style={{ 
                      '--background': 'white', 
                      borderRadius: '12px', 
                      marginBottom: '10px',
                      border: isSelected ? '2px solid var(--ion-color-primary)' : '2px solid transparent'
                    }}
                    lines="none"
                  >
                    <IonIcon icon={tennisballOutline} slot="start" color={isSelected ? 'primary' : 'medium'} />
                    <IonLabel>
                      <h3 style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{court?.name || `Cancha ${slot.courtId}`}</h3>
                      <p style={{ color: '#666' }}>
                        {court?.surface ? court.surface.toUpperCase() : 'PÁDEL STANDARD'}
                      </p>
                    </IonLabel>
                    <IonCheckbox 
                      slot="end" 
                      checked={isSelected} 
                      onIonChange={() => handleToggleSlot(slot)} 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </IonItem>
                );
              })}
            </IonList>

            {error && (
              <IonText color="danger" style={{ display: 'block', textAlign: 'center', margin: '16px 0' }}>
                {error}
              </IonText>
            )}

            <IonButton 
              expand="block" 
              onClick={handleReserve}
              disabled={reserving || selectedSlots.length !== (gameMode === 'SUPER_8' ? 2 : 1)}
              color="success"
              style={{ marginTop: '24px' }}
            >
              {reserving ? <IonSpinner name="dots" /> : 'Confirmar Reserva'}
            </IonButton>
            
            <IonButton expand="block" fill="clear" onClick={() => setStep(3)} disabled={reserving}>
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
