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
  IonLabel,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  useIonToast
} from '@ionic/react';
import { adminService } from '../services/admin';

export const AdminSlotsPage: React.FC = () => {
  const [courtId, setCourtId] = useState<string>('1');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [present] = useIonToast();

  const handleCreate = async () => {
    try {
      await adminService.createSlots(parseInt(courtId), date, '08:00', '22:00', 90, 40);
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
        <p>Configura la disponibilidad para las reservas.</p>
        
        <IonItem>
          <IonLabel position="stacked">Selecciona la Cancha</IonLabel>
          <IonSelect value={courtId} onIonChange={e => setCourtId(e.detail.value)}>
            <IonSelectOption value="1">CanchaYA - Cristal Indoor 1</IonSelectOption>
            <IonSelectOption value="2">CanchaYA - Panorámica Indoor 2</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fecha a Generar</IonLabel>
          <IonDatetime presentation="date" value={date} onIonChange={e => setDate(e.detail.value as string)} />
        </IonItem>

        <IonButton expand="block" color="success" style={{ marginTop: '24px' }} onClick={handleCreate}>
          Generar Slots
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
