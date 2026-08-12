import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/react';
import { addOutline, buildOutline } from 'ionicons/icons';
import { adminService } from '../services/admin';
import { Court } from '../interfaces/types';

export const AdminCourtsPage: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await adminService.getCourts();
        setCourts(response.data);
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1f2937', color: 'white' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" style={{ color: 'white' }} />
          </IonButtons>
          <IonTitle style={{ color: 'white' }}>Gestionar Canchas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <IonButton color="primary">
            <IonIcon slot="start" icon={addOutline} />
            Nueva Cancha
          </IonButton>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}><IonSpinner /></div>
        ) : (
          <IonList>
            {courts.map(court => (
              <IonItem key={court.id}>
                <IonLabel>
                  <h2>{court.name}</h2>
                  <p>Precio: ${court.pricePerHour}/h</p>
                </IonLabel>
                <IonBadge color={court.type === 'indoor' ? 'tertiary' : 'warning'}>
                  {court.type === 'indoor' ? 'Techada' : 'Descubierta'}
                </IonBadge>
                <IonButton fill="clear" slot="end" onClick={() => alert('Stub: Editar cancha')}>
                  <IonIcon slot="icon-only" icon={buildOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};
