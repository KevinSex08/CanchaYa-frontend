import React, { useEffect, useState } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
  IonBadge
} from '@ionic/react';
import {
  locationOutline,
  alertCircleOutline,
  refreshOutline,
  businessOutline,
  layersOutline
} from 'ionicons/icons';
import { courtService, Court } from '../services';

interface CourtListProps {
  onSelectCourt?: (courtId: number) => void;
}

/**
 * Componente CourtList
 * Muestra el catálogo de canchas utilizando componentes nativos de Ionic.
 * Incluye estados de carga, error con reintento, y diseño de tarjetas responsivo.
 */
export const CourtList: React.FC<CourtListProps> = ({ onSelectCourt }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carga la lista de canchas desde el servicio
  const fetchCourts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await courtService.getCourts();
      setCourts(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al cargar las canchas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleVerHorarios = (courtId: number) => {
    console.log(`[CourtList] Ver horarios para la cancha ID: ${courtId}`);
    if (onSelectCourt) {
      onSelectCourt(courtId);
    }
  };

  // 1. Estado de carga
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '20px' }}>
        <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.5)', marginBottom: '16px' }} />
        <IonText color="medium">
          <p>Cargando catálogo de canchas...</p>
        </IonText>
      </div>
    );
  }

  // 2. Estado de error
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '20px', textAlign: 'center' }}>
        <IonIcon icon={alertCircleOutline} color="danger" style={{ fontSize: '64px', marginBottom: '16px' }} />
        <IonText color="dark">
          <h2>¡Ups! Algo salió mal</h2>
        </IonText>
        <IonText color="medium" style={{ margin: '8px 24px 20px 24px' }}>
          <p>{error}</p>
        </IonText>
        <IonButton color="primary" onClick={fetchCourts}>
          <IonIcon icon={refreshOutline} slot="start" />
          Reintentar
        </IonButton>
      </div>
    );
  }

  // 3. Estado de catálogo vacío
  if (courts.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '20px', textAlign: 'center' }}>
        <IonIcon icon={businessOutline} color="medium" style={{ fontSize: '64px', marginBottom: '16px' }} />
        <IonText color="medium">
          <p>No hay canchas disponibles en este momento.</p>
        </IonText>
      </div>
    );
  }

  // 4. Catálogo de canchas
  return (
    <IonGrid>
      <IonRow>
        {courts.map((court) => {
          // Soporte flexible para 'type' y 'isIndoor' según los datos devueltos por el API
          const isIndoor = court.type === 'indoor' || (court as any).isIndoor === true;
          const surfaceName = court.surface || 'Pádel Standard';
          
          return (
            <IonCol size="12" sizeSm="6" sizeMd="4" key={court.id}>
              <IonCard style={{ margin: '8px 0px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                
                {/* Cabecera visual (Imagen de la cancha o banner estilizado) */}
                {court.imageUrl ? (
                  <img 
                    src={court.imageUrl} 
                    alt={court.name} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                  />
                ) : (
                  // Gradiente premium de fallback si no hay imagen
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    position: 'relative'
                  }}>
                    <IonIcon icon={businessOutline} style={{ fontSize: '64px', opacity: 0.3 }} />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                      <IonBadge color="success" style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '20px' }}>
                        Pádel Pro
                      </IonBadge>
                    </div>
                  </div>
                )}

                <IonCardHeader style={{ paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    {/* Badge de tipo de cancha (Techada / Al Aire Libre) */}
                    <IonBadge color={isIndoor ? 'tertiary' : 'warning'} style={{ borderRadius: '4px', fontSize: '11px' }}>
                      {isIndoor ? 'Techada' : 'Al aire libre'}
                    </IonBadge>
                    
                    {/* Badge de superficie */}
                    <IonBadge color="light" style={{ borderRadius: '4px', fontSize: '11px', color: 'var(--ion-color-light-contrast, #666)' }}>
                      <IonIcon icon={layersOutline} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                      {surfaceName.charAt(0).toUpperCase() + surfaceName.slice(1)}
                    </IonBadge>
                  </div>

                  <IonCardTitle style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {court.name}
                  </IonCardTitle>
                  
                  {court.location && (
                    <IonCardSubtitle style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                      <IonIcon icon={locationOutline} style={{ marginRight: '4px', fontSize: '14px' }} />
                      {court.location}
                    </IonCardSubtitle>
                  )}
                </IonCardHeader>

                <IonCardContent style={{ paddingBottom: '16px' }}>
                  {court.description && (
                    <p style={{ 
                      color: 'var(--ion-color-medium, #666)', 
                      fontSize: '14px', 
                      lineHeight: '1.4', 
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '38px'
                    }}>
                      {court.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <div>
                      <IonText color="medium" style={{ fontSize: '12px', display: 'block' }}>
                        Precio por Hora
                      </IonText>
                      <IonText color="dark" style={{ fontSize: '22px', fontWeight: 'bold' }}>
                        ${court.pricePerHour.toFixed(2)}
                      </IonText>
                    </div>

                    <IonButton 
                      color="primary" 
                      style={{ '--border-radius': '8px', fontWeight: '600', margin: '0' }}
                      onClick={() => handleVerHorarios(court.id)}
                    >
                      Ver Horarios
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          );
        })}
      </IonRow>
    </IonGrid>
  );
};
