import React from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { MatchScoreboard } from '../components/MatchScoreboard';

/**
 * Página AdminScoreboardPage
 * Vista de administración para que el personal registre el score de los partidos.
 * Renderiza el componente MatchScoreboard pasándole datos de prueba.
 */
export const AdminScoreboardPage: React.FC = () => {
  const history = useHistory();
  
  // Soporte para parámetros de ruta dinámicos (ej: /admin/scoreboard/:id)
  // con un fallback estático (ID 101) para pruebas, según lo solicitado.
  const { id } = useParams<{ id?: string }>();
  const reservationId = id ? parseInt(id, 10) : 101;
  const courtName = id ? `Cancha Profesional #${id}` : 'Cancha Central (Panorámica)';

  const handleMatchFinished = () => {
    console.log(`[AdminScoreboardPage] El partido de la reserva #${reservationId} ha sido registrado.`);
    // Redirigir de vuelta al catálogo de canchas tras guardar exitosamente
    setTimeout(() => {
      history.push('/courts');
    }, 1500);
  };

  return (
    <IonPage id="admin-scoreboard-page">
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            {/* Botón de retroceso nativo de Ionic */}
            <IonBackButton defaultHref="/courts" text="Atrás" />
          </IonButtons>
          
          <IonTitle style={{ fontWeight: 'bold' }}>Panel de Administración</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Cabecera visual interna */}
        <div style={{ padding: '8px 4px 16px 4px', textAlign: 'center' }}>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: 'var(--ion-text-color, #1a1a1a)' }}>
            Marcador Oficial
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--ion-color-medium, #666)', fontSize: '14px' }}>
            Ajusta los marcadores de sets/juegos y finaliza el registro del partido.
          </p>
        </div>

        {/* Componente del Marcador */}
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <MatchScoreboard
            reservationId={reservationId}
            courtName={courtName}
            onFinished={handleMatchFinished}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};
