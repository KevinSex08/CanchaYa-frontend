import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonButtons,
  IonMenuButton,
  IonAvatar,
  IonSpinner,
  IonButton
} from '@ionic/react';
import {
  logOutOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services';
import api from '../services/api';

export const PerfilJugador: React.FC = () => {
  const history = useHistory();
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me');
      setPlayerInfo(response.data);
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada o no autorizada. Redirigiendo...');
      } else {
        setError('No se pudo obtener la información de tu perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión?')) {
      authService.logout();
      history.push('/login');
    }
  };

  const name = playerInfo?.name || 'Cargando...';
  const email = playerInfo?.email || '';
  // Generar URL de avatar genérico basado en el nombre (ui-avatars)
  const avatarUrl = playerInfo?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  return (
    <IonPage id="perfil-jugador-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton style={{ color: '#ffffff' }} />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800', color: '#ffffff' }}>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.3)', marginBottom: '16px' }} />
            <IonText color="medium">Cargando tu perfil...</IonText>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '24px' }}>
            <IonText color="danger">
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>¡Ups! Algo salió mal</h3>
            </IonText>
            <p style={{ color: 'var(--ion-color-medium)', marginBottom: '24px', fontSize: '15px' }}>{error}</p>
            <IonButton color="primary" onClick={fetchProfile} style={{ '--border-radius': '8px', fontWeight: '600' }}>
              Reintentar
            </IonButton>
          </div>
        ) : (
          <>
            {/* Cabecera del Perfil con Gradiente Sutil */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 16px',
              textAlign: 'center',
              background: 'linear-gradient(180deg, var(--ion-color-light) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: '16px',
              marginBottom: '20px'
            }}>
              <IonAvatar style={{ width: '90px', height: '90px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '16px' }}>
                <img src={avatarUrl} alt={name} />
              </IonAvatar>
              
              <h2 style={{ margin: '0', fontSize: '22px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
                {name}
              </h2>
              <IonText color="medium" style={{ fontSize: '14px', marginTop: '4px' }}>
                {email}
              </IonText>
            </div>

            {/* Opciones de Cuenta */}
            <h3 style={{ margin: '0 0 12px 4px', fontSize: '18px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
              Configuración de Cuenta
            </h3>
            
            <IonList style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px', background: 'transparent' }}>
              {/* Opción de Salida */}
              <IonItem button detail={false} onClick={handleLogout} style={{ '--background': 'var(--ion-card-background, #ffffff)' }}>
                <IonIcon icon={logOutOutline} slot="start" color="danger" />
                <IonLabel color="danger" style={{ fontWeight: '600' }}>Cerrar Sesión</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
