import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonToast,
  IonAlert
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { calendarOutline, timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { courtService } from '../services/courts';
import { reservationService } from '../services/reservations';
import { Slot, Court } from '../interfaces/types';

export const CourtSlotsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courtId = parseInt(id, 10);

  const [court, setCourt] = useState<Court | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reserving, setReserving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    fetchData();
  }, [courtId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courtData, availableSlots] = await Promise.all([
        courtService.getCourtDetails(courtId),
        courtService.getAvailableSlots({ courtId })
      ]);
      setCourt(courtData);
      setSlots(availableSlots);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los horarios disponibles. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const confirmReservation = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleReserve = async () => {
    if (!selectedSlot) return;
    setReserving(true);
    try {
      await reservationService.createReservation({
        slotId: selectedSlot.id,
        gameType: 'FRIENDLY' // default gameType as required by payload
      });
      setToastMessage('¡Reserva confirmada exitosamente!');
      setShowToast(true);
      // Remove slot from list
      setSlots(slots.filter(s => s.id !== selectedSlot.id));
    } catch (err: any) {
      console.error('Error al reservar:', err);
      setError('Error al procesar la reserva. Inténtalo de nuevo.');
    } finally {
      setReserving(false);
      setSelectedSlot(null);
    }
  };

  // Helper to format time nicely (e.g. 10:00:00 -> 10:00)
  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/courts" />
          </IonButtons>
          <IonTitle>
            Horarios {court ? `- ${court.name}` : ''}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f4f5f8' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <IonSpinner name="crescent" color="primary" />
            <IonText color="medium" style={{ marginTop: '16px' }}>Cargando horarios...</IonText>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <IonText color="danger">
              <h2>Ups!</h2>
              <p>{error}</p>
            </IonText>
            <IonButton onClick={fetchData} fill="outline" style={{ marginTop: '16px' }}>Reintentar</IonButton>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0', fontSize: '22px', fontWeight: 'bold' }}>
                {court?.name}
              </h2>
              <IonText color="medium" style={{ fontSize: '14px' }}>
                Selecciona un horario disponible para reservar
              </IonText>
            </div>

            {slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px' }}>
                <IonIcon icon={calendarOutline} style={{ fontSize: '48px', color: '#ccc' }} />
                <p style={{ color: '#888', marginTop: '12px' }}>No hay horarios disponibles para esta cancha en este momento.</p>
              </div>
            ) : (
              <IonList style={{ background: 'transparent' }}>
                {slots.map(slot => (
                  <IonItem 
                    key={slot.id} 
                    style={{ 
                      '--background': 'white', 
                      borderRadius: '12px', 
                      marginBottom: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    lines="none"
                  >
                    <IonIcon icon={timeOutline} slot="start" color="primary" />
                    <IonLabel>
                      <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </h3>
                      <p style={{ color: 'var(--ion-color-success)' }}>Disponible</p>
                    </IonLabel>
                    <IonButton slot="end" onClick={() => confirmReservation(slot)} fill="solid" color="primary" style={{ '--border-radius': '8px' }}>
                      Reservar
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        {/* Alerta de Confirmación de Reserva */}
        <IonAlert
          isOpen={!!selectedSlot}
          onDidDismiss={() => !reserving && setSelectedSlot(null)}
          header="Confirmar Reserva"
          message={`¿Deseas reservar ${court?.name} de ${selectedSlot ? formatTime(selectedSlot.startTime) : ''} a ${selectedSlot ? formatTime(selectedSlot.endTime) : ''}?`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setSelectedSlot(null)
            },
            {
              text: 'Confirmar',
              handler: handleReserve
            }
          ]}
        />

        {/* Toast de Éxito */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
          icon={checkmarkCircleOutline}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default CourtSlotsPage;
