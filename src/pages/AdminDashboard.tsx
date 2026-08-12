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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonText,
  IonSpinner
} from '@ionic/react';
import {
  peopleOutline,
  tennisballOutline,
  timeOutline,
  podiumOutline,
  logOutOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services';

export const AdminDashboard: React.FC = () => {
  const history = useHistory();
  const [userName, setUserName] = useState<string>('Admin');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/me');
        if (response.data?.name) {
          setUserName(response.data.name);
        }
      } catch (err) {
        console.error('Error al cargar perfil de admin', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión?')) {
      await authService.logout();
      history.push('/login');
    }
  };

  const adminOptions = [
    {
      title: 'Gestionar Canchas',
      icon: tennisballOutline,
      color: '#3b82f6',
      path: '/admin/courts',
      description: 'Crear o editar canchas de pádel'
    },
    {
      title: 'Generar Horarios',
      icon: timeOutline,
      color: '#10b981',
      path: '/admin/slots',
      description: 'Aperturar slots disponibles para reservas'
    },
    {
      title: 'Administradores',
      icon: peopleOutline,
      color: '#f59e0b',
      path: '/admin/users',
      description: 'Conceder permisos a nuevos usuarios'
    },
    {
      title: 'Scoreboard Súper 8',
      icon: podiumOutline,
      color: '#8b5cf6',
      path: '/admin/scoreboard',
      description: 'Ver resultados en tiempo real'
    }
  ];

  return (
    <IonPage id="admin-dashboard-page">
      <IonHeader translucent>
        {/* Usamos un color dark o distinto para diferenciarlo visualmente del lado del cliente */}
        <IonToolbar style={{ '--background': '#1f2937', color: 'white' }}>
          <IonButtons slot="start">
            <IonMenuButton style={{ color: 'white' }} />
          </IonButtons>
          <IonTitle style={{ fontWeight: '800', color: 'white' }}>Panel Admin</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} title="Cerrar Sesión">
              <IonIcon slot="icon-only" icon={logOutOutline} style={{ color: 'white' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ '--background': '#f3f4f6' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <IonSpinner name="crescent" color="dark" style={{ transform: 'scale(1.3)', marginBottom: '16px' }} />
            <IonText color="medium">Cargando panel...</IonText>
          </div>
        ) : (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
              borderRadius: '16px',
              padding: '24px 20px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
            }}>
              <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '900' }}>
                ¡Bienvenido, {userName}!
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Modo Administrador Activo. Selecciona una acción para gestionar el sistema.
              </p>
            </div>

            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                {adminOptions.map((option, index) => (
                  <IonCol size="12" sizeMd="6" key={index}>
                    <IonCard 
                      button 
                      onClick={() => history.push(option.path)}
                      style={{ 
                        margin: '0 0 16px 0', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        borderLeft: `5px solid ${option.color}`
                      }}
                    >
                      <IonCardHeader>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            backgroundColor: `${option.color}20`, 
                            padding: '10px', 
                            borderRadius: '50%', 
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <IonIcon icon={option.icon} style={{ fontSize: '24px', color: option.color }} />
                          </div>
                          <div>
                            <IonCardTitle style={{ fontSize: '18px', fontWeight: 'bold' }}>{option.title}</IonCardTitle>
                          </div>
                        </div>
                      </IonCardHeader>
                      <IonCardContent style={{ paddingTop: 0, paddingBottom: '16px' }}>
                        <IonText color="medium" style={{ fontSize: '14px' }}>
                          {option.description}
                        </IonText>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};
