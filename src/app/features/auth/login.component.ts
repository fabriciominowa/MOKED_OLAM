import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserRole } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { Moked3dCanvasComponent } from '../../shared/components/moked-3d-canvas.component';

interface ProfileUserOption {
  id: string;
  name: string;
  tag: string;
  email: string;
  clientAccountId?: 'CLI-A' | 'CLI-B' | 'CLI-C';
  thirdPartyTab?: 'ordens-servico' | 'supervisao-posto';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Moked3dCanvasComponent],
  template: `
    <div class="auth-page">
      <app-moked-3d-canvas mode="auth" class="auth-3d-backdrop" />
      <div class="auth-container">
        <!-- COLUNA ESQUERDA: SELEÇÃO DE PERFIL + USUÁRIOS (E PERSONAGEM NOS DEMAIS PERFIS) -->
        <div class="auth-brand-panel">
          <div class="auth-logo-row">
            <div class="star-mark">
              <svg viewBox="0 0 64 64" width="42" height="42">
                <ellipse
                  cx="32"
                  cy="34"
                  rx="26"
                  ry="11"
                  fill="none"
                  stroke="#56b4f9"
                  stroke-width="2.5"
                  transform="rotate(-18 32 34)"
                />
                <polygon
                  points="32,8 37,26 54,31 37,36 32,54 27,36 10,31 27,26"
                  fill="#111827"
                />
                <polygon
                  points="50,11 52,16 57,18 52,20 50,25 48,20 43,18 48,16"
                  fill="#c4161c"
                />
              </svg>
            </div>
            <div>
              <h1>OLAM</h1>
              <span>GRUPO MOK<strong class="red">ED</strong></span>
            </div>
          </div>

          <div class="auth-brand-copy">
            <h2>Plataforma Operacional e Gestão de Contratos</h2>
            <p>
              Selecione o perfil de acesso no formulário para visualizar os usuários disponíveis.
            </p>
          </div>

          <!-- CONTEÚDO DINÂMICO CONFORME PERFIL SELECIONADO -->
          <div class="auth-dynamic-role-box">
            @if (selectedRole !== 'cliente') {
              <!-- NOS OUTROS ACESSOS: EXIBE O PERSONAGEM DO PERFIL + USUÁRIOS -->
              <div class="auth-character-showcase">
                <div class="acs-text">
                  <span class="acs-kicker">{{ selectedRoleMeta().code }} · PERSONAGEM DO PERFIL</span>
                  <h3>{{ selectedRoleMeta().shortLabel }}</h3>
                  <p>{{ selectedRoleMeta().subtitle }}</p>
                </div>
                <img
                  [src]="characterAvatar()"
                  [alt]="'Personagem ' + selectedRoleMeta().shortLabel"
                  class="acs-avatar-img"
                />
              </div>
            } @else {
              <!-- QUANDO SELECIONADO CLIENTE: SEM PERSONAGEM, FOCO NOS USUÁRIOS DE CLIENTES -->
              <div class="auth-client-scope-head">
                <span class="acs-kicker">01 · ACESSO EXCLUSIVO DO CLIENTE</span>
                <h3>Selecione o usuário do cliente</h3>
                <p>Cada cliente visualiza exclusivamente os dados do seu contrato.</p>
              </div>
            }

            <div class="auth-role-presets">
              <span class="preset-title">
                {{
                  selectedRole === 'cliente'
                    ? 'Usuários de Clientes (A, B e C)'
                    : 'Usuários de ' + selectedRoleMeta().shortLabel
                }}
              </span>

              <div class="preset-grid">
                @for (usr of activeProfileUsers(); track usr.id) {
                  <button
                    type="button"
                    class="preset-btn"
                    [class.active]="email === usr.email"
                    (click)="selectProfileUser(usr)"
                  >
                    <div class="pb-head">
                      <strong>{{ usr.name }}</strong>
                      <span class="pb-tag">{{ usr.tag }}</span>
                    </div>
                    <small>{{ usr.email }}</small>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- COLUNA DIREITA: FORMULÁRIO DE ENTRADA -->
        <div class="auth-form-panel">
          <div class="auth-box-header">
            <div class="abh-brand">
              <strong>MOK<span class="red">ED</span></strong>
              <span class="abh-divider">·</span>
              <span>OLAM / Entrar</span>
            </div>
            <div class="flex items-center gap-2">
              <a routerLink="/home" class="text-xs font-bold text-moked-crimson hover:underline no-underline">
                ← Home
              </a>
              <span class="abh-role-pill">{{ selectedRoleMeta().shortLabel }}</span>
            </div>
          </div>

          <form class="auth-box-body" (ngSubmit)="submit()">
            <div class="auth-form-intro">
              <h3>Acessar sua área</h3>
              <p>
                Escolha o <strong>Perfil de acesso</strong> para carregar o usuário
                {{ selectedRole === 'cliente' ? 'de cliente.' : 'e o personagem correspondente.' }}
              </p>
            </div>

            <div class="field-group">
              <label for="login-role">Perfil de acesso</label>
              <select
                id="login-role"
                name="selectedRole"
                [(ngModel)]="selectedRole"
                (ngModelChange)="onRoleChange($event)"
              >
                @for (r of state.roles; track r.id) {
                  <option [value]="r.id">{{ r.label }}</option>
                }
              </select>
            </div>

            <div class="field-group">
              <label for="login-email">E-mail corporativo</label>
              <input
                id="login-email"
                name="email"
                type="email"
                [(ngModel)]="email"
                placeholder="nome@empresa.com.br"
                autocomplete="username"
              />
            </div>

            <div class="field-group">
              <label for="login-password">Senha</label>
              <div class="password-input-wrap">
                <input
                  id="login-password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-pass-btn"
                  (click)="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary full auth-submit-btn">
              Entrar como {{ selectedUserName() }} →
            </button>

            <div class="auth-footer-links">
              <button
                type="button"
                class="link-btn"
                (click)="forgotPasswordSent = !forgotPasswordSent"
              >
                Esqueci minha senha
              </button>
              <span class="auth-scope-note">
                Acesso conforme perfil e contratos autorizados.
              </span>
            </div>

            @if (forgotPasswordSent) {
              <div class="recovery-alert">
                Link de redefinição enviado para <strong>{{ email }}</strong>.
              </div>
            }
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = 'cliente.b@contratob.com.br';
  password = '••••••••';
  selectedRole: UserRole = 'cliente';
  showPassword = false;
  forgotPasswordSent = false;
  selectedThirdPartyTab: 'ordens-servico' | 'supervisao-posto' = 'ordens-servico';
  selectedClientId: 'CLI-A' | 'CLI-B' | 'CLI-C' = 'CLI-B';

  private readonly usersByRole: Record<UserRole, ProfileUserOption[]> = {
    cliente: [
      {
        id: 'CLI-A',
        name: 'Cliente A · Sede Paulista',
        tag: 'CT-A',
        email: 'cliente.a@contratoa.com.br',
        clientAccountId: 'CLI-A',
      },
      {
        id: 'CLI-B',
        name: 'Cliente B · Portaria Loja 24',
        tag: 'CT-B',
        email: 'cliente.b@contratob.com.br',
        clientAccountId: 'CLI-B',
      },
      {
        id: 'CLI-C',
        name: 'Cliente C · Centro Logístico',
        tag: 'CT-C',
        email: 'cliente.c@contratoc.com.br',
        clientAccountId: 'CLI-C',
      },
    ],
    consultor: [
      {
        id: 'CON-1',
        name: 'Carlos Mendes',
        tag: 'MOKPAT / B',
        email: 'consultor@moked.com.br',
      },
      {
        id: 'CON-2',
        name: 'Fernanda Costa',
        tag: 'MOKIMP / C',
        email: 'fernanda.costa@moked.com.br',
      },
    ],
    lider: [
      {
        id: 'LID-1',
        name: 'Sérgio Oliveira',
        tag: 'Posto Exemplo',
        email: 'lider.posto@seguranca.com.br',
      },
      {
        id: 'LID-2',
        name: 'Ricardo Almeida',
        tag: 'Posto 02 · Docas',
        email: 'ricardo.lider@seguranca.com.br',
      },
    ],
    terceirizados: [
      {
        id: 'TER-1',
        name: 'Roberto Alves',
        tag: '04A Técnico',
        email: 'tecnico@terceirizada.com.br',
        thirdPartyTab: 'ordens-servico',
      },
      {
        id: 'TER-2',
        name: 'Marcos Vieira',
        tag: '04B Supervisor',
        email: 'supervisor@terceirizada.com.br',
        thirdPartyTab: 'supervisao-posto',
      },
    ],
    monitoramento: [
      {
        id: 'MON-1',
        name: 'Operador Central 24h',
        tag: 'Mesa CFTV',
        email: 'central@moked.com.br',
      },
      {
        id: 'MON-2',
        name: 'Luciana Rocha',
        tag: 'Plantão Noturno',
        email: 'luciana.central@moked.com.br',
      },
    ],
    treinamento: [
      {
        id: 'TRN-1',
        name: 'Rafael Lima',
        tag: 'Instrutor',
        email: 'rafael.treinamento@moked.com.br',
      },
      {
        id: 'TRN-2',
        name: 'Camila Souza',
        tag: 'Coordenação',
        email: 'camila.treinamento@moked.com.br',
      },
    ],
    'alta-gestao': [
      {
        id: 'GES-1',
        name: 'Eric',
        tag: 'Diretoria',
        email: 'eric.diretoria@moked.com.br',
      },
      {
        id: 'GES-2',
        name: 'Presidência Moked',
        tag: 'Executivo BI',
        email: 'presidencia@moked.com.br',
      },
    ],
  };

  private readonly avatarsByRole: Record<Exclude<UserRole, 'cliente'>, string> = {
    consultor: '/assets/consultor-avatar.png',
    lider: '/assets/lider-avatar.png',
    terceirizados: '/assets/terceirizados-avatar.png',
    monitoramento: '/assets/monitoramento-avatar.png',
    treinamento: '/assets/treinamento-avatar.png',
    'alta-gestao': '/assets/alta-gestao-avatar.png',
  };

  ngOnInit(): void {
    this.state.isLoggedIn.set(false);
    const paramRole = this.route.snapshot.queryParamMap.get('role') as UserRole | null;
    const isValidRole = paramRole && this.state.roles.some((r) => r.id === paramRole);
    const active = isValidRole ? paramRole : this.state.activeRole();
    this.selectedRole = active;
    this.onRoleChange(active);
  }

  selectedRoleMeta() {
    return (
      this.state.roles.find((r) => r.id === this.selectedRole) ??
      this.state.roles[0]
    );
  }

  activeProfileUsers(): ProfileUserOption[] {
    return this.usersByRole[this.selectedRole] ?? [];
  }

  characterAvatar(): string {
    if (this.selectedRole === 'cliente') return '';
    return this.avatarsByRole[this.selectedRole];
  }

  selectedUserName(): string {
    const found = this.activeProfileUsers().find((u) => u.email === this.email);
    return found ? found.name : this.selectedRoleMeta().shortLabel;
  }

  onRoleChange(role: UserRole): void {
    this.selectedRole = role;
    const users = this.usersByRole[role];
    if (users && users.length > 0) {
      const defaultOpt = role === 'cliente' ? users[1] ?? users[0] : users[0];
      this.selectProfileUser(defaultOpt);
    } else {
      const found = this.state.roles.find((r) => r.id === role);
      if (found) this.email = found.defaultEmail;
    }
  }

  selectProfileUser(usr: ProfileUserOption): void {
    this.email = usr.email;
    if (usr.clientAccountId) {
      this.selectedClientId = usr.clientAccountId;
    }
    if (usr.thirdPartyTab) {
      this.selectedThirdPartyTab = usr.thirdPartyTab;
    }
  }

  submit(): void {
    if (this.selectedRole === 'cliente') {
      const targetCli =
        this.activeProfileUsers().find((u) => u.email === this.email)?.clientAccountId ??
        this.selectedClientId;
      this.state.loginAsClientAccount(targetCli);
      this.state.clientActiveTab.set('inicio');
      this.router.navigate(['/cliente']);
      return;
    }

    if (this.selectedRole === 'terceirizados') {
      this.state.thirdPartyActiveTab.set(this.selectedThirdPartyTab);
    } else if (this.selectedRole === 'consultor') {
      this.state.consultantActiveTab.set('minhas-areas');
    } else if (this.selectedRole === 'lider') {
      this.state.leaderActiveTab.set('meu-turno');
    }

    this.state.loginWithProfile(this.email, this.selectedRole);
    this.router.navigate(['/' + this.selectedRole]);
  }
}
