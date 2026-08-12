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
  IonInput
} from '@ionic/react';
import { adminService } from '../services/admin';

export const AdminUsersPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleMakeAdmin = async () => {
    if (!email) return;
    alert(`Stub: Otorgando permisos a ${email}`);
    await adminService.makeAdmin(email);
    setEmail('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#1f2937', color: 'white' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" style={{ color: 'white' }} />
          </IonButtons>
          <IonTitle style={{ color: 'white' }}>Administradores</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Otorgar permisos de Administrador</h2>
        <p>Ingresa el correo de un usuario existente para convertirlo en admin.</p>
        
        <IonItem>
          <IonLabel position="stacked">Correo Electrónico</IonLabel>
          <IonInput 
            type="email" 
            placeholder="ejemplo@canchaya.com" 
            value={email} 
            onIonChange={e => setEmail(e.detail.value!)} 
          />
        </IonItem>

        <IonButton expand="block" style={{ marginTop: '24px' }} onClick={handleMakeAdmin}>
          Hacer Administrador
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
