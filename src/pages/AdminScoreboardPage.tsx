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
import { adminService } from '../services/admin';
import { Reservation } from '../interfaces/types';

export const AdminScoreboardPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        // Cargar todas las reservas y usuarios
        try {
          const [resResponse, usersResponse] = await Promise.all([
            adminService.getAllReservations(),
            adminService.getAllUsers()
          ]);
          setAllReservations(resResponse.data || resResponse);
          setUsers(usersResponse.data || usersResponse);
        } catch (e: any) {
          console.error("Error al obtener reservas del backend:", e.response?.data);
          const backendMsg = e.response?.data?.message || e.response?.data?.error || JSON.stringify(e.response?.data);
          setError(`Error del servidor (500): ${backendMsg}. Pide al backend que revise los logs.`);
        } finally {
          setLoading(false);
        }
        return;
      }
      try {
        const resId = parseInt(id, 10);
        const [data, usersResponse] = await Promise.all([
          reservationService.getReservationById(resId),
          adminService.getAllUsers()
        ]);
        setReservation(data);
        setUsers(usersResponse.data || usersResponse);
      } catch (e: any) {
        console.error("Error al obtener la reserva o usuarios:", e);
        setError("No se pudo cargar la información de la reserva o de los usuarios.");
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
        ) : !id ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '16px' }}>Partidos Activos</h1>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px' }}>Selecciona una reserva para gestionar su marcador.</p>
            {allReservations.length === 0 ? (
              <IonText color="medium"><p>No hay partidos activos en este momento.</p></IonText>
            ) : (
              allReservations.map(res => {
                const userObj = users.find(u => u.cognitoSub === res.cognitoUserId);
                const nombreReal = userObj ? userObj.name : "Usuario Desconocido";
                return (
                  <div 
                    key={res.id} 
                    style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => history.push(`/admin/scoreboard/${res.id}`)}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Reserva #{res.id}</h3>
                      <p style={{ margin: '0', fontSize: '13px', color: 'gray' }}>Usuario: {nombreReal}</p>
                      <p style={{ margin: '0', fontSize: '13px', color: 'gray' }}>Cancha: {res.slot?.court?.name || res.slot?.courtId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <IonText color="primary" style={{ fontWeight: 'bold', fontSize: '14px' }}>{res.gameType}</IonText>
                      <p style={{ margin: '0', fontSize: '12px', color: 'gray' }}>{res.status}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : reservation ? (
          <>
            <div style={{ padding: '8px 4px 16px 4px', textAlign: 'center' }}>
              <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800' }}>
                Marcador Oficial
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'var(--ion-color-medium)', fontSize: '14px' }}>
                Ajusta los marcadores y finaliza el registro.
              </p>
              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--ion-color-step-150, #e9ecef)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Titular: {users.find(u => u.cognitoSub === reservation.cognitoUserId)?.name || "Usuario Desconocido"}</p>
                <p style={{ margin: '0', fontSize: '14px', color: 'var(--ion-color-medium)' }}>
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
