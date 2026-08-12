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
  IonAlert,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput
} from '@ionic/react';
import {
  addOutline,
  removeOutline,
  trophyOutline,
  checkmarkCircleOutline,
  personAddOutline,
  trashOutline
} from 'ionicons/icons';
import { gameService } from '../services';

interface MatchScoreboardProps {
  reservationId: number;
  courtName: string;
  gameType?: 'CLASSIC' | 'SUPER_8';
  onFinished?: () => void;
}

interface Super8PlayerScore {
  playerId: number;
  playerName: string;
  matchesWon: number;
  pointsFor: number;
  pointsAgainst: number;
}

export const MatchScoreboard: React.FC<MatchScoreboardProps> = ({
  reservationId,
  courtName,
  gameType,
  onFinished
}) => {
  const [mode, setMode] = useState<'CLASSIC' | 'SUPER_8'>(gameType || 'CLASSIC');
  
  // Estado Clásico
  const [scoreTeam1, setScoreTeam1] = useState<number>(0);
  const [scoreTeam2, setScoreTeam2] = useState<number>(0);
  
  // Estado Super 8
  const [super8Scores, setSuper8Scores] = useState<Super8PlayerScore[]>([
    { playerId: 101, playerName: 'Jugador 1', matchesWon: 0, pointsFor: 0, pointsAgainst: 0 },
    { playerId: 102, playerName: 'Jugador 2', matchesWon: 0, pointsFor: 0, pointsAgainst: 0 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Funciones Clásicas
  const incrementScore = (team: 1 | 2) => {
    if (team === 1) setScoreTeam1((prev) => prev + 1);
    else setScoreTeam2((prev) => prev + 1);
  };

  const decrementScore = (team: 1 | 2) => {
    if (team === 1) setScoreTeam1((prev) => Math.max(0, prev - 1));
    else setScoreTeam2((prev) => Math.max(0, prev - 1));
  };

  // Funciones Super 8
  const addPlayer = () => {
    if (super8Scores.length >= 8) return;
    const newId = 100 + super8Scores.length + 1;
    setSuper8Scores([...super8Scores, {
      playerId: newId,
      playerName: `Jugador ${super8Scores.length + 1}`,
      matchesWon: 0,
      pointsFor: 0,
      pointsAgainst: 0
    }]);
  };

  const removePlayer = (index: number) => {
    setSuper8Scores(super8Scores.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: keyof Super8PlayerScore, value: string | number) => {
    const updated = [...super8Scores];
    updated[index] = { ...updated[index], [field]: value };
    setSuper8Scores(updated);
  };

  const handleFinishMatch = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // 1. Create the GameRecord for this reservation (it might fail if already exists, but backend should handle or we assume it succeeds)
      const gameRecord = await gameService.startGameRecord({ reservationId });
      const gameRecordId = gameRecord.id!;

      // 2. Finish the game record with its real ID
      if (mode === 'CLASSIC') {
        const winner = scoreTeam1 > scoreTeam2 ? 'TEAM_A' : scoreTeam1 < scoreTeam2 ? 'TEAM_B' : 'NONE';
        await gameService.finishGameRecord(gameRecordId, {
          teamAScore: scoreTeam1,
          teamBScore: scoreTeam2,
          winnerTeam: winner
        });
      } else {
        // Modo Super 8
        const leaderboard = super8Scores.map(p => ({
          ...p,
          pointDifference: p.pointsFor - p.pointsAgainst
        }));
        
        leaderboard.sort((a, b) => {
          if (b.pointsFor !== a.pointsFor) {
            return b.pointsFor - a.pointsFor;
          }
          return b.pointDifference - a.pointDifference;
        });

        const additionalStats = JSON.stringify({
          tournamentType: 'SUPER_8',
          leaderboard
        });

        await gameService.finishGameRecord(gameRecordId, {
          teamAScore: 0,
          teamBScore: 0,
          additionalStats,
          winnerTeam: 'NONE'
        });
      }
      setShowSuccessAlert(true);
    } catch (error: any) {
      console.error('Error al finalizar el partido:', error);
      const backendMsg = error.response?.data?.message || error.response?.data?.error || JSON.stringify(error.response?.data);
      setErrorMessage(backendMsg ? `Error del Servidor: ${backendMsg}` : 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <IonCard style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}>
        <IonCardHeader style={{ background: 'var(--ion-color-light)', borderBottom: '1px solid var(--ion-color-step-150, #e9ecef)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IonIcon icon={trophyOutline} color="warning" style={{ fontSize: '24px', marginRight: '10px' }} />
            <div>
              <IonCardTitle style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>Registrar Marcador</IonCardTitle>
              <IonText color="medium" style={{ fontSize: '12px' }}>{courtName} (Reserva #{reservationId})</IonText>
            </div>
          </div>
          
          <IonSegment 
            value={mode} 
            onIonChange={e => setMode(e.detail.value as any)}
            style={{ marginTop: '16px' }}
          >
            <IonSegmentButton value="CLASSIC">
              <IonLabel>Pádel Clásico</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="SUPER_8">
              <IonLabel>Súper 8</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonCardHeader>

        <IonCardContent style={{ padding: '24px 16px' }}>
          
          {mode === 'CLASSIC' ? (
            /* =================== MODO CLÁSICO =================== */
            <IonGrid>
              <IonRow className="ion-align-items-center ion-justify-content-center">
                <IonCol size="5" style={{ textAlign: 'center' }}>
                  <IonText color="primary" style={{ fontWeight: 'bold' }}>EQUIPO 1</IonText>
                  <div style={{ background: 'var(--ion-color-light)', color: 'var(--ion-color-dark)', borderRadius: '12px', padding: '16px', fontSize: '48px', fontWeight: '800', margin: '8px auto', width: '90px' }}>
                    {scoreTeam1}
                  </div>
                  <IonButton fill="outline" onClick={() => decrementScore(1)} disabled={isSubmitting || scoreTeam1 === 0}><IonIcon icon={removeOutline} /></IonButton>
                  <IonButton fill="solid" onClick={() => incrementScore(1)} disabled={isSubmitting}><IonIcon icon={addOutline} /></IonButton>
                </IonCol>
                <IonCol size="2" style={{ textAlign: 'center' }}>
                  <IonText color="medium" style={{ fontSize: '20px', fontWeight: '800', opacity: 0.5 }}>VS</IonText>
                </IonCol>
                <IonCol size="5" style={{ textAlign: 'center' }}>
                  <IonText color="secondary" style={{ fontWeight: 'bold' }}>EQUIPO 2</IonText>
                  <div style={{ background: 'var(--ion-color-light)', color: 'var(--ion-color-dark)', borderRadius: '12px', padding: '16px', fontSize: '48px', fontWeight: '800', margin: '8px auto', width: '90px' }}>
                    {scoreTeam2}
                  </div>
                  <IonButton fill="outline" onClick={() => decrementScore(2)} disabled={isSubmitting || scoreTeam2 === 0}><IonIcon icon={removeOutline} /></IonButton>
                  <IonButton fill="solid" color="secondary" onClick={() => incrementScore(2)} disabled={isSubmitting}><IonIcon icon={addOutline} /></IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          ) : (
            /* =================== MODO SÚPER 8 =================== */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <IonText color="dark" style={{ fontWeight: 'bold' }}>Tabla de Posiciones</IonText>
                <IonButton size="small" fill="outline" onClick={addPlayer} disabled={super8Scores.length >= 8}>
                  <IonIcon icon={personAddOutline} slot="start" /> Añadir
                </IonButton>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f4f5f8', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Jugador</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>PG</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>PF</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>PC</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {super8Scores.map((player, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '4px' }}>
                          <IonInput 
                            value={player.playerName}
                            onIonChange={e => updatePlayer(index, 'playerName', e.detail.value!)}
                            placeholder="Nombre"
                            style={{ '--padding-start': '0', minWidth: '100px' }}
                          />
                        </td>
                        <td style={{ padding: '4px', width: '60px' }}>
                          <IonInput 
                            type="number"
                            value={player.matchesWon}
                            onIonChange={e => updatePlayer(index, 'matchesWon', parseInt(e.detail.value!, 10) || 0)}
                            style={{ textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '4px', width: '60px' }}>
                          <IonInput 
                            type="number"
                            value={player.pointsFor}
                            onIonChange={e => updatePlayer(index, 'pointsFor', parseInt(e.detail.value!, 10) || 0)}
                            style={{ textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '4px', width: '60px' }}>
                          <IonInput 
                            type="number"
                            value={player.pointsAgainst}
                            onIonChange={e => updatePlayer(index, 'pointsAgainst', parseInt(e.detail.value!, 10) || 0)}
                            style={{ textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '4px', textAlign: 'right' }}>
                          <IonButton fill="clear" color="danger" size="small" onClick={() => removePlayer(index)} style={{ margin: 0 }}>
                            <IonIcon icon={trashOutline} slot="icon-only" />
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '12px', color: 'gray', marginTop: '8px' }}>
                * PG = Partidos Ganados | PF = Puntos a Favor | PC = Puntos en Contra
              </p>
            </div>
          )}

          {errorMessage && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <IonText color="danger" style={{ fontSize: '13px' }}>{errorMessage}</IonText>
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <IonButton expand="block" color="success" disabled={isSubmitting} onClick={handleFinishMatch}>
              {isSubmitting ? <IonSpinner name="crescent" /> : <><IonIcon icon={checkmarkCircleOutline} slot="start" /> Finalizar Partido</>}
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={() => { setShowSuccessAlert(false); if (onFinished) onFinished(); }}
        header="¡Partido Finalizado!"
        subHeader="Resultado guardado correctamente"
        message="Los marcadores y estadísticas han sido enviados a la base de datos."
        buttons={['Aceptar']}
      />
    </>
  );
};
