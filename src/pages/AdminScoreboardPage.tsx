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
  IonText
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { MatchScoreboard } from '../components/MatchScoreboard';
import { reservationService } from '../services/reservations';
import { Reservation } from '../interfaces/types';

export const AdminScoreboardPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) {
        setError("Por favor seleccione un partido válido desde el catálogo.");
        setLoading(false);
        return;
      }
      try {
        const resId = parseInt(id, 10);
        const data = await reservationService.getReservationById(resId);
        setReservation(data);
      } catch (e: any) {
        console.error("Error al obtener la reserva:", e);
        setError("No se pudo cargar la información de la reserva. Verifique que exista.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  const handleMatchFinished = () => {
    console.log(`[AdminScoreboardPage] El partido ha sido registrado.`);
    setTimeout(() => {
      history.push('/admin/dashboard');
    }, 1500);
  };

  return (
    <IonPage id="admin-scoreboard-page">
      <IonHeader>
        <IonToolbar color="danger">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="Atrás" />
          </IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>Panel de Administración</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" />
            <p>Cargando información del partido...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonText color="danger">
              <h2>Error</h2>
              <p>{error}</p>
            </IonText>
          </div>
        ) : reservation ? (
          <>
            <div style={{ padding: '8px 4px 16px 4px', textAlign: 'center' }}>
              <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: 'var(--ion-text-color, #1a1a1a)' }}>
                Marcador Oficial
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'var(--ion-color-medium, #666)', fontSize: '14px' }}>
                Ajusta los marcadores y finaliza el registro.
              </p>
              <div style={{ marginTop: '12px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>Titular: {reservation.userId}</p>
                <p style={{ margin: '0', fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                  Modo: {reservation.gameType === 'SUPER_8' ? 'Súper 8' : 'Clásico'}
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <MatchScoreboard
                reservationId={reservation.id!}
                courtName={reservation.slot?.court?.name || `Cancha ID ${reservation.slot?.courtId}`}
                gameType={reservation.gameType === 'SUPER_8' ? 'SUPER_8' : 'CLASSIC'}
                onFinished={handleMatchFinished}
              />
            </div>
          </>
        ) : null}
      </IonContent>
    </IonPage>
  );
};
