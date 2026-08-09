import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSpinner,
  IonIcon,
  IonAlert
} from '@ionic/react';
import {
  addOutline,
  removeOutline,
  trophyOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { gameService } from '../services';

interface MatchScoreboardProps {
  reservationId: number;
  courtName: string;
  onFinished?: () => void;
}

/**
 * Componente MatchScoreboard
 * Interfaz administrativa para registrar los resultados finales de un partido de Pádel.
 * Muestra un marcador visual de gran tamaño para incrementar/decrementar sets o juegos.
 */
export const MatchScoreboard: React.FC<MatchScoreboardProps> = ({
  reservationId,
  courtName,
  onFinished
}) => {
  const [scoreTeam1, setScoreTeam1] = useState<number>(0);
  const [scoreTeam2, setScoreTeam2] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Incrementa el puntaje de un equipo
  const incrementScore = (team: 1 | 2) => {
    if (team === 1) {
      setScoreTeam1((prev) => prev + 1);
    } else {
      setScoreTeam2((prev) => prev + 1);
    }
  };

  // Decrementa el puntaje de un equipo (sin bajar de 0)
  const decrementScore = (team: 1 | 2) => {
    if (team === 1) {
      setScoreTeam1((prev) => Math.max(0, prev - 1));
    } else {
      setScoreTeam2((prev) => Math.max(0, prev - 1));
    }
  };

  // Envía el score final al servidor
  const handleFinishMatch = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // Llamada al servicio con la reserva y puntajes finales
      await gameService.finishGameRecord(reservationId, {
        scoreTeam1,
        scoreTeam2
      });
      setShowSuccessAlert(true);
    } catch (error: any) {
      console.error('Error al finalizar el partido:', error);
      setErrorMessage(error.message || 'Error al conectar con el servidor. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertDismiss = () => {
    setShowSuccessAlert(false);
    if (onFinished) {
      onFinished();
    }
  };

  return (
    <>
      <IonCard style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <IonCardHeader style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
          <IonIcon icon={trophyOutline} color="warning" style={{ fontSize: '24px', marginRight: '10px' }} />
          <div>
            <IonCardTitle style={{ fontSize: '18px', fontWeight: 'bold' }}>Registrar Marcador</IonCardTitle>
            <IonText color="medium" style={{ fontSize: '12px' }}>{courtName} (Reserva #{reservationId})</IonText>
          </div>
        </IonCardHeader>

        <IonCardContent style={{ padding: '24px 16px' }}>
          {/* Grid Principal del Marcador */}
          <IonGrid>
            <IonRow className="ion-align-items-center ion-justify-content-center">
              
              {/* Equipo 1 */}
              <IonCol size="5" style={{ textAlign: 'center' }}>
                <IonText color="primary" style={{ fontWeight: 'bold', fontSize: '15px', display: 'block', marginBottom: '8px' }}>
                  EQUIPO 1
                </IonText>
                
                {/* Visualización del Score */}
                <div style={{
                  background: '#f1f3f5',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#2b2b2b',
                  margin: '8px auto',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}>
                  {scoreTeam1}
                </div>

                {/* Botones de Control */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <IonButton 
                    fill="outline" 
                    color="medium" 
                    size="small"
                    style={{ '--border-radius': '50%', width: '40px', height: '40px', margin: '0' }}
                    onClick={() => decrementScore(1)}
                    disabled={isSubmitting || scoreTeam1 === 0}
                  >
                    <IonIcon icon={removeOutline} />
                  </IonButton>
                  
                  <IonButton 
                    fill="solid" 
                    color="primary" 
                    size="small"
                    style={{ '--border-radius': '50%', width: '40px', height: '40px', margin: '0' }}
                    onClick={() => incrementScore(1)}
                    disabled={isSubmitting}
                  >
                    <IonIcon icon={addOutline} />
                  </IonButton>
                </div>
              </IonCol>

              {/* Separador VS */}
              <IonCol size="2" style={{ textAlign: 'center' }}>
                <IonText color="medium" style={{ fontSize: '20px', fontWeight: '800', opacity: 0.5 }}>
                  VS
                </IonText>
              </IonCol>

              {/* Equipo 2 */}
              <IonCol size="5" style={{ textAlign: 'center' }}>
                <IonText color="secondary" style={{ fontWeight: 'bold', fontSize: '15px', display: 'block', marginBottom: '8px' }}>
                  EQUIPO 2
                </IonText>

                {/* Visualización del Score */}
                <div style={{
                  background: '#f1f3f5',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#2b2b2b',
                  margin: '8px auto',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                }}>
                  {scoreTeam2}
                </div>

                {/* Botones de Control */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <IonButton 
                    fill="outline" 
                    color="medium" 
                    size="small"
                    style={{ '--border-radius': '50%', width: '40px', height: '40px', margin: '0' }}
                    onClick={() => decrementScore(2)}
                    disabled={isSubmitting || scoreTeam2 === 0}
                  >
                    <IonIcon icon={removeOutline} />
                  </IonButton>

                  <IonButton 
                    fill="solid" 
                    color="secondary" 
                    size="small"
                    style={{ '--border-radius': '50%', width: '40px', height: '40px', margin: '0' }}
                    onClick={() => incrementScore(2)}
                    disabled={isSubmitting}
                  >
                    <IonIcon icon={addOutline} />
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Mostrar error si falla la llamada */}
          {errorMessage && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <IonText color="danger" style={{ fontSize: '13px' }}>
                {errorMessage}
              </IonText>
            </div>
          )}

          {/* Botón de Enviar */}
          <div style={{ marginTop: '24px' }}>
            <IonButton
              expand="block"
              color="success"
              style={{ '--border-radius': '10px', height: '48px', fontWeight: 'bold', margin: '0' }}
              disabled={isSubmitting}
              onClick={handleFinishMatch}
            >
              {isSubmitting ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                  Guardando resultado...
                </>
              ) : (
                <>
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Finalizar Partido
                </>
              )}
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Alerta de Éxito al finalizar el partido */}
      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={handleAlertDismiss}
        header="¡Partido Finalizado!"
        subHeader="Resultado guardado correctamente"
        message={`El marcador final se registró como:\nEquipo 1: ${scoreTeam1} set(s) / Equipo 2: ${scoreTeam2} set(s).`}
        buttons={[{ text: 'Aceptar', role: 'confirm' }]}
      />
    </>
  );
};
