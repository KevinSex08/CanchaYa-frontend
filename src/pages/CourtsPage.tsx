import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon
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

  const handleSelectCourt = (courtId: number) => {
    console.log(`[CourtsPage] Cancha seleccionada: ${courtId}`);
    // En una aplicación real, aquí redirigiríamos al flujo de reserva de horarios:
    // history.push(`/courts/${courtId}/slots`);
  };

  const goToAdmin = () => {
    history.push('/admin/scoreboard');
  };

  return (
    <IonPage id="courts-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle style={{ fontWeight: 'bold' }}>CanchaYA</IonTitle>
          
          <IonButtons slot="end">
            {/* Botón para navegar al panel administrativo (útil para pruebas) */}
            <IonButton onClick={goToAdmin} title="Panel Admin">
              <IonIcon slot="icon-only" icon={shieldOutline} />
            </IonButton>
            
            <IonButton title="Perfil de Usuario">
              <IonIcon slot="icon-only" icon={personCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Cabecera de bienvenida */}
        <div style={{ padding: '8px 4px 16px 4px' }}>
          <h1 style={{ margin: '0', fontSize: '26px', fontWeight: '800', color: 'var(--ion-text-color, #1a1a1a)' }}>
            Reserva tu Cancha
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--ion-color-medium, #666)', fontSize: '15px' }}>
            Selecciona una de nuestras canchas profesionales de pádel para iniciar.
          </p>
        </div>

        {/* Componente del catálogo de canchas */}
        <CourtList onSelectCourt={handleSelectCourt} />
      </IonContent>
    </IonPage>
  );
};
