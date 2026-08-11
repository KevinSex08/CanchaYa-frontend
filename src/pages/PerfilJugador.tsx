import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
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
  personOutline,
  notificationsOutline,
  lockClosedOutline,
  helpCircleOutline,
  logOutOutline,
  trophyOutline,
  analyticsOutline,
  ribbonOutline,
  shieldOutline
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
      const response = await api.get('/users/profile/');
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

  const name = playerInfo?.name || 'Santiago Gómez';
  const email = playerInfo?.email || 'santiago.gomez@gmail.com';
  const category = playerInfo?.category || '4ª Categoría (Amateur)';
  const avatarUrl = playerInfo?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  
  const stats = playerInfo?.stats || {
    matchesPlayed: 32,
    winRate: '68%',
    favoriteSurface: 'Cristal (Techada)'
  };

  return (
    <IonPage id="perfil-jugador-page">
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800' }}>Mi Perfil</IonTitle>
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
              
              <div style={{
                marginTop: '10px',
                padding: '5px 12px',
                background: 'var(--ion-color-primary-tint)',
                borderRadius: '20px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}>
                <IonIcon icon={ribbonOutline} style={{ marginRight: '6px' }} />
                {category}
              </div>
            </div>

            {/* Panel de Estadísticas */}
            <h3 style={{ margin: '0 0 12px 4px', fontSize: '18px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
              Estadísticas de Juego
            </h3>
            
            <IonGrid style={{ padding: '0', marginBottom: '24px' }}>
              <IonRow>
                <IonCol size="4">
                  <IonCard style={{ margin: '0', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                    <IonCardContent style={{ padding: '12px 8px' }}>
                      <IonIcon icon={trophyOutline} color="primary" style={{ fontSize: '24px', marginBottom: '4px' }} />
                      <IonText color="medium" style={{ fontSize: '11px', display: 'block', fontWeight: '600' }}>Partidos</IonText>
                      <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
                        {stats.matchesPlayed}
                      </h2>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="4">
                  <IonCard style={{ margin: '0 4px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                    <IonCardContent style={{ padding: '12px 8px' }}>
                      <IonIcon icon={analyticsOutline} color="secondary" style={{ fontSize: '24px', marginBottom: '4px' }} />
                      <IonText color="medium" style={{ fontSize: '11px', display: 'block', fontWeight: '600' }}>Victorias</IonText>
                      <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
                        {stats.winRate}
                      </h2>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="4">
                  <IonCard style={{ margin: '0', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                    <IonCardContent style={{ padding: '12px 8px' }}>
                      <IonIcon icon={shieldOutline} color="tertiary" style={{ fontSize: '24px', marginBottom: '4px' }} />
                      <IonText color="medium" style={{ fontSize: '11px', display: 'block', fontWeight: '600' }}>Pista Fav</IonText>
                      <h2 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '800', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ion-text-color)' }}>
                        {stats.favoriteSurface.split(' ')[0]}
                      </h2>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Opciones de Cuenta */}
            <h3 style={{ margin: '0 0 12px 4px', fontSize: '18px', fontWeight: '800', color: 'var(--ion-text-color)' }}>
              Configuración de Cuenta
            </h3>
            
            <IonList style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px', background: 'transparent' }}>
              <IonItem button detail style={{ '--background': 'var(--ion-card-background, #ffffff)' }}>
                <IonIcon icon={personOutline} slot="start" color="primary" />
                <IonLabel style={{ color: 'var(--ion-text-color)' }}>Editar Datos Personales</IonLabel>
              </IonItem>
              
              <IonItem button detail style={{ '--background': 'var(--ion-card-background, #ffffff)' }}>
                <IonIcon icon={notificationsOutline} slot="start" color="secondary" />
                <IonLabel style={{ color: 'var(--ion-text-color)' }}>Notificaciones</IonLabel>
              </IonItem>
              
              <IonItem button detail style={{ '--background': 'var(--ion-card-background, #ffffff)' }}>
                <IonIcon icon={lockClosedOutline} slot="start" color="tertiary" />
                <IonLabel style={{ color: 'var(--ion-text-color)' }}>Privacidad y Seguridad</IonLabel>
              </IonItem>
              
              <IonItem button detail style={{ '--background': 'var(--ion-card-background, #ffffff)' }}>
                <IonIcon icon={helpCircleOutline} slot="start" color="medium" />
                <IonLabel style={{ color: 'var(--ion-text-color)' }}>Soporte Técnico / Ayuda</IonLabel>
              </IonItem>
              
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
