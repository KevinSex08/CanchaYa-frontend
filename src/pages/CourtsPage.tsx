import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton
} from '@ionic/react';
import { personCircleOutline, shieldOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { CourtList } from '../components/CourtList';

/**
 * Página CourtsPage
 * Contenedor principal que renderiza el listado de canchas disponibles.
 * Proporciona el layout y barra de navegación de Ionic.
 */
export const CourtsPage: React.FC = () => {
  const history = useHistory();

  const handleMakeReservation = () => {
    // Verificación de autenticación
    const token = localStorage.getItem('cognito_access_token');
    if (!token) {
      console.warn('Usuario no autenticado, redirigiendo al login...');
      history.push('/login');
      return;
    }
    // Navegar al nuevo asistente de reservas
    history.push(`/app/reservar`);
  };

  const goToAdmin = () => {
    history.push('/admin/scoreboard');
  };

  return (
    <IonPage id="courts-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton style={{ color: '#ffffff' }} />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>CanchaYA</IonTitle>
          
          <IonButtons slot="end">
            {/* Botón para navegar al panel administrativo (útil para pruebas) */}
            <IonButton onClick={goToAdmin} title="Panel Admin">
              <IonIcon slot="icon-only" icon={shieldOutline} />
            </IonButton>
            
            <IonButton onClick={() => history.push('/app/perfil')} title="Mi Perfil">
              <IonIcon slot="icon-only" icon={personCircleOutline} style={{ color: '#ffffff' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Cabecera de bienvenida */}
        <div style={{ padding: '8px 4px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0', fontSize: '26px', fontWeight: '800', color: 'var(--ion-text-color, #1a1a1a)' }}>
              Catálogo de Canchas
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--ion-color-medium, #666)', fontSize: '15px' }}>
              Conoce nuestras canchas profesionales de pádel.
            </p>
          </div>
        </div>

        <IonButton 
          expand="block" 
          color="success" 
          style={{ marginBottom: '24px', '--border-radius': '12px', height: '54px', fontWeight: 'bold', fontSize: '18px' }}
          onClick={handleMakeReservation}
        >
          ¡Hacer una Reserva Nueva!
        </IonButton>

        {/* Componente del catálogo de canchas */}
        <CourtList onSelectCourt={handleMakeReservation} />
      </IonContent>
    </IonPage>
  );
};
