import { Routes } from '@angular/router';
import { AltaGestaoBiComponent } from './features/alta-gestao/alta-gestao-bi.component';
import { LoginComponent } from './features/auth/login.component';
import { ClientePortalComponent } from './features/cliente/cliente-portal.component';
import { ConsultorWorkspaceComponent } from './features/consultor/consultor-workspace.component';
import { LiderPostoComponent } from './features/lider/lider-posto.component';
import { CentralMonitoramentoComponent } from './features/monitoramento/central-monitoramento.component';
import { TerceirizadosPortalComponent } from './features/terceirizados/terceirizados-portal.component';
import { TreinamentoPortalComponent } from './features/treinamento/treinamento-portal.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cliente' },
  { path: 'login', component: LoginComponent },
  { path: 'cliente', component: ClientePortalComponent },
  { path: 'consultor', component: ConsultorWorkspaceComponent },
  { path: 'consultor/visitas', component: ConsultorWorkspaceComponent },
  { path: 'consultor/carteira', component: ConsultorWorkspaceComponent },
  { path: 'consultor/ocorrencias', component: ConsultorWorkspaceComponent },
  { path: 'consultor/orcamentos', component: ConsultorWorkspaceComponent },
  { path: 'consultor/area/:division', component: ConsultorWorkspaceComponent },
  { path: 'lider', component: LiderPostoComponent },
  { path: 'lider/falta-atraso', component: LiderPostoComponent },
  { path: 'lider/treinamento', component: LiderPostoComponent },
  { path: 'lider/ocorrencia', component: LiderPostoComponent },
  { path: 'lider/sem-alteracao', component: LiderPostoComponent },
  { path: 'lider/pendencias', component: LiderPostoComponent },
  { path: 'lider/historico', component: LiderPostoComponent },
  { path: 'terceirizados', component: TerceirizadosPortalComponent },
  { path: 'monitoramento', component: CentralMonitoramentoComponent },
  { path: 'treinamento', component: TreinamentoPortalComponent },
  { path: 'alta-gestao', component: AltaGestaoBiComponent },
  { path: '**', redirectTo: 'cliente' },
];
