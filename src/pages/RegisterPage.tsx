import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonText,
  IonSpinner,
  IonIcon
} from '@ionic/react';
import { mailOutline, lockClosedOutline, personOutline, alertCircleOutline, keyOutline } from 'ionicons/icons';
import { useHistory, Link } from 'react-router-dom';
import { authService } from '../services';

export const RegisterPage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados para el flujo OTP
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.register({ username: email, password: password, name: name });
      // En lugar de ir al login, pasamos a modo verificación
      setIsVerifying(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrorMsg('Debes ingresar el código de verificación.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.confirmRegister(email, verificationCode);
      history.push('/login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Código incorrecto o error al verificar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ '--background': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%', width: '100%' }}>
          <IonCard style={{ width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '8px' }}>
            <IonCardHeader style={{ textAlign: 'center' }}>
              <IonCardTitle style={{ fontSize: '26px', fontWeight: '800' }}>
                {isVerifying ? 'Verificar Cuenta' : 'Registro'}
              </IonCardTitle>
              <IonText color="medium">
                {isVerifying ? 'Ingresa el código que enviamos a tu correo' : 'Crea tu cuenta en CanchaYA'}
              </IonText>
            </IonCardHeader>
            <IonCardContent>
              {!isVerifying ? (
                <form onSubmit={handleRegister}>
                  <IonItem lines="none" style={{ '--background': '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                    <IonIcon icon={personOutline} slot="start" color="medium" />
                    <IonInput type="text" placeholder="Nombre completo" value={name} onIonInput={e => setName(e.detail.value!)} disabled={isLoading} style={{ '--color': '#111111' }} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                    <IonIcon icon={mailOutline} slot="start" color="medium" />
                    <IonInput type="email" placeholder="Correo electrónico" value={email} onIonInput={e => setEmail(e.detail.value!)} disabled={isLoading} style={{ '--color': '#111111' }} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': '#f8f9fa', borderRadius: '8px', marginBottom: '4px' }}>
                    <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                    <IonInput type="password" placeholder="Contraseña" value={password} onIonInput={e => setPassword(e.detail.value!)} disabled={isLoading} style={{ '--color': '#111111' }} />
                  </IonItem>
                  
                  {/* Requisitos de contraseña añadidos a petición del usuario */}
                  <IonText color="medium" style={{ fontSize: '11px', display: 'block', padding: '0 8px', marginBottom: '10px' }}>
                    * Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo especial.
                  </IonText>
                  
                  {errorMsg && (
                    <IonText color="danger" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <IonIcon icon={alertCircleOutline} style={{ marginRight: '4px' }} />
                      {errorMsg}
                    </IonText>
                  )}

                  <IonButton type="submit" expand="block" disabled={isLoading} style={{ marginTop: '16px', '--border-radius': '10px' }}>
                    {isLoading ? <IonSpinner name="crescent" /> : 'Crear Cuenta'}
                  </IonButton>
                  
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <IonText color="medium" style={{ fontSize: '14px' }}>
                      ¿Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 'bold', textDecoration: 'none' }}>Inicia sesión aquí</Link>
                    </IonText>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerify}>
                  <IonItem lines="none" style={{ '--background': '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                    <IonIcon icon={keyOutline} slot="start" color="medium" />
                    <IonInput type="text" placeholder="Código de 6 dígitos" value={verificationCode} onIonInput={e => setVerificationCode(e.detail.value!)} disabled={isLoading} style={{ '--color': '#111111', fontSize: '18px', letterSpacing: '2px', textAlign: 'center' }} />
                  </IonItem>

                  {errorMsg && (
                    <IonText color="danger" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <IonIcon icon={alertCircleOutline} style={{ marginRight: '4px' }} />
                      {errorMsg}
                    </IonText>
                  )}

                  <IonButton type="submit" expand="block" disabled={isLoading} style={{ marginTop: '16px', '--border-radius': '10px' }}>
                    {isLoading ? <IonSpinner name="crescent" /> : 'Verificar y Continuar'}
                  </IonButton>
                  
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <IonButton fill="clear" onClick={() => setIsVerifying(false)} disabled={isLoading}>
                      Volver al Registro
                    </IonButton>
                  </div>
                </form>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
