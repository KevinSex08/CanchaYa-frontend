import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonInput,
  useIonToast,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { adminService } from '../services/admin';

export const AdminSlotsPage: React.FC = () => {
  const [courtId, setCourtId] = useState<string>('1');
  const [date, setDate] = useState<string>(new Date().toISOString());
  
  // Nuevos estados dinámicos
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [slotDuration, setSlotDuration] = useState<number>(90);
  const [price, setPrice] = useState<number>(40);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [present] = useIonToast();

  const handleCreate = async () => {
    if (!startTime || !endTime || !slotDuration || !price) {
      present({ message: 'Todos los campos son obligatorios', duration: 2000, color: 'warning' });
      return;
    }

    if (startTime >= endTime) {
      present({ message: 'La hora de inicio debe ser menor a la hora de fin', duration: 2000, color: 'warning' });
      return;
    }

    const today = new Date().toISOString().substring(0, 10);
    const selectedDate = date.substring(0, 10);
    if (selectedDate < today) {
       present({ message: 'No puedes generar horarios en el pasado', duration: 2000, color: 'warning' });
       return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createSlots(
        parseInt(courtId), 
        date.substring(0, 10), 
        startTime, 
        endTime, 
        slotDuration, 
        price
      );
      present({
        message: 'Horarios generados correctamente en el servidor',
        duration: 3000,
        color: 'success'
      });
    } catch (error) {
      present({
        message: 'Error al generar los horarios',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1f2937', color: 'white' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" style={{ color: 'white' }} />
          </IonButtons>
          <IonTitle style={{ color: 'white' }}>Generar Horarios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Aperturar Horarios (Slots)</h2>
        <p>Configura la disponibilidad para las reservas en bloque.</p>
        
        <IonItem>
          <IonSelect label="Cancha Destino" labelPlacement="stacked" value={courtId} onIonChange={e => setCourtId(e.detail.value)}>
            <IonSelectOption value="1">CanchaYA - Cristal Indoor 1</IonSelectOption>
            <IonSelectOption value="2">CanchaYA - Panorámica Indoor 2</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonGrid style={{ padding: 0, marginTop: '8px' }}>
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonInput 
                  type="time" 
                  label="Hora Inicio" 
                  labelPlacement="stacked" 
                  value={startTime} 
                  onIonChange={e => setStartTime(e.detail.value!)} 
                />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonInput 
                  type="time" 
                  label="Hora Fin" 
                  labelPlacement="stacked" 
                  value={endTime} 
                  onIonChange={e => setEndTime(e.detail.value!)} 
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonInput 
                  type="number" 
                  label="Duración (min)" 
                  labelPlacement="stacked" 
                  value={slotDuration} 
                  onIonChange={e => setSlotDuration(parseInt(e.detail.value!) || 0)} 
                />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonInput 
                  type="number" 
                  label="Precio ($)" 
                  labelPlacement="stacked" 
                  value={price} 
                  onIonChange={e => setPrice(parseFloat(e.detail.value!) || 0)} 
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonItem style={{ marginTop: '8px' }}>
          <IonDatetime 
            presentation="date" 
            value={date} 
            onIonChange={e => setDate(e.detail.value as string)} 
            style={{ width: '100%', margin: '0 auto' }}
          />
        </IonItem>

        <IonButton expand="block" color="success" style={{ marginTop: '24px' }} onClick={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Generar Slots'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
