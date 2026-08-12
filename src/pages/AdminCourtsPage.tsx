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
  IonSpinner,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  useIonToast
} from '@ionic/react';
import { addOutline, buildOutline, closeOutline } from 'ionicons/icons';
import { adminService } from '../services/admin';
import { Court } from '../interfaces/types';

export const AdminCourtsPage: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [present] = useIonToast();

  // Estado del formulario
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState<number>(40);
  const [type, setType] = useState<'indoor' | 'outdoor'>('indoor');
  const [surface, setSurface] = useState<'glass' | 'wall' | 'panoramic'>('glass');

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

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleCreateCourt = async () => {
    if (!name || !pricePerHour) {
      present({ message: 'Nombre y precio son requeridos', duration: 2000, color: 'warning' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        location,
        pricePerHour,
        type,
        surface
      };
      await adminService.createCourt(payload);
      present({ message: 'Cancha creada exitosamente', duration: 3000, color: 'success' });
      setShowModal(false);
      setName('');
      setLocation('');
      setPricePerHour(40);
      setLoading(true);
      fetchCourts(); // Recargar canchas
    } catch (error) {
      present({ message: 'Error al crear la cancha', duration: 3000, color: 'danger' });
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
          <IonTitle style={{ color: 'white' }}>Gestionar Canchas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <IonButton color="primary" onClick={() => setShowModal(true)}>
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
                <IonButton fill="clear" slot="end" onClick={() => present({ message: 'Edición en desarrollo', duration: 2000 })}>
                  <IonIcon slot="icon-only" icon={buildOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nueva Cancha</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}><IonIcon icon={closeOutline} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonInput label="Nombre" labelPlacement="stacked" placeholder="Ej. Cancha Cristal 1" value={name} onIonChange={e => setName(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonInput label="Ubicación" labelPlacement="stacked" placeholder="Ej. Bloque A" value={location} onIonChange={e => setLocation(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonInput label="Precio por Hora ($)" labelPlacement="stacked" type="number" value={pricePerHour} onIonChange={e => setPricePerHour(parseFloat(e.detail.value!) || 0)} />
            </IonItem>
            <IonItem>
              <IonSelect label="Tipo" labelPlacement="stacked" value={type} onIonChange={e => setType(e.detail.value)}>
                <IonSelectOption value="indoor">Techada (Indoor)</IonSelectOption>
                <IonSelectOption value="outdoor">Descubierta (Outdoor)</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonSelect label="Superficie" labelPlacement="stacked" value={surface} onIonChange={e => setSurface(e.detail.value)}>
                <IonSelectOption value="glass">Cristal</IonSelectOption>
                <IonSelectOption value="wall">Muro</IonSelectOption>
                <IonSelectOption value="panoramic">Panorámica</IonSelectOption>
              </IonSelect>
            </IonItem>
            
            <IonButton expand="block" style={{ marginTop: '24px' }} onClick={handleCreateCourt} disabled={isSubmitting}>
              {isSubmitting ? <IonSpinner name="crescent" /> : 'Guardar Cancha'}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
