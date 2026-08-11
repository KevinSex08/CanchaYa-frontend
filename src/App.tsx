import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  homeOutline,
  tennisballOutline,
  calendarOutline,
  personOutline
} from 'ionicons/icons';

/* Importaciones de Páginas */
import { CourtsPage } from './pages/CourtsPage';
import { AdminScoreboardPage } from './pages/AdminScoreboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomeDashboard } from './pages/HomeDashboard';
import { MisPartidos } from './pages/MisPartidos';
import { PerfilJugador } from './pages/PerfilJugador';

/* Estilos CSS obligatorios del Core de Ionic */
import '@ionic/react/css/core.css';

/* Estilos CSS Básicos para que los componentes de Ionic funcionen correctamente */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Hojas de estilo de utilidad opcionales (se pueden comentar/eliminar si no se usan) */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Estilos del Tema (Variables globales de Ionic como colores primarios, fuentes, etc.) */
import './theme/variables.css';

// Inicialización de Ionic React
setupIonicReact();

/**
 * Componente App
 * Archivo principal que maneja la estructura de la aplicación Ionic,
 * inicialización del framework, estilos globales y el enrutador.
 */
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas Públicas y Administrativas fuera de los Tabs */}
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/admin/scoreboard" component={AdminScoreboardPage} />
        <Route exact path="/admin/scoreboard/:id" component={AdminScoreboardPage} />
        
        {/* Vistas Principales del Cliente agrupadas en Tabs */}
        <Route path="/" render={() => (
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/dashboard" component={HomeDashboard} />
              <Route exact path="/courts" component={CourtsPage} />
              <Route exact path="/mis-partidos" component={MisPartidos} />
              <Route exact path="/perfil" component={PerfilJugador} />
              
              {/* Redirección por defecto al Dashboard de la sección del cliente */}
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="dashboard" href="/dashboard">
                <IonIcon icon={homeOutline} />
                <IonLabel>Inicio</IonLabel>
              </IonTabButton>

              <IonTabButton tab="courts" href="/courts">
                <IonIcon icon={tennisballOutline} />
                <IonLabel>Canchas</IonLabel>
              </IonTabButton>

              <IonTabButton tab="mis-partidos" href="/mis-partidos">
                <IonIcon icon={calendarOutline} />
                <IonLabel>Mis Partidos</IonLabel>
              </IonTabButton>

              <IonTabButton tab="perfil" href="/perfil">
                <IonIcon icon={personOutline} />
                <IonLabel>Perfil</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        )} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
