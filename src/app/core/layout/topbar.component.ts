import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HealthStatus } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="app-header">
      <div class="header-context">
        <!-- BOTÃO HAMBÚRGUER VISÍVEL NO MOBILE E TABLET -->
        <button
          type="button"
          class="hamburger-btn"
          aria-label="Abrir menu de navegação"
          (click)="toggleMobileMenu.emit()"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            stroke-width="2.2"
            fill="none"
          >
            <line x1="3" y1="6" x2="21" y2="6" stroke-linecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" stroke-linecap="round" />
          </svg>
        </button>

        <div class="topbar-moked-brand">
          <strong>MOK<span class="red">ED</span></strong>
        </div>

        @if (state.activeRole() === 'cliente') {
          <!-- QUANDO LOGADO COMO CLIENTE: CONTRATO BLOQUEADO AO SEU ESCOPO + SELETOR DE TESTE A/B/C -->
          <div class="client-scope-pill">
            <span class="lock-icon">🔒</span>
            <strong>{{ state.selectedContract().name }}</strong>
            <span class="unit-sub hide-sm">· {{ state.selectedContract().unit }}</span>
          </div>

          <div class="client-quick-switcher">
            <span class="cqs-label hide-sm">Testar acesso:</span>
            @for (cli of state.clientAccounts; track cli.id) {
              <button
                type="button"
                class="cqs-btn"
                [class.active]="state.activeClientAccount() === cli.id"
                (click)="state.loginAsClientAccount(cli.id)"
              >
                {{ cli.shortName }}
              </button>
            }
          </div>
        } @else {
          <!-- EQUIPE INTERNA MOKED: PODE ALTERNAR ENTRE OS CONTRATOS DA CARTEIRA -->
          <span class="role-badge">{{ currentRoleMeta().shortLabel }}</span>
          <div class="contract-picker">
            <label>Contrato ativo:</label>
            <select
              [ngModel]="state.selectedContractId()"
              (ngModelChange)="state.selectContract($event)"
            >
              @for (c of state.contracts(); track c.id) {
                <option [value]="c.id">
                  {{ c.name }} — {{ c.unit }} ({{ statusLabel(c.health.overall) }})
                </option>
              }
            </select>
          </div>
        }
      </div>

      <div class="header-user-controls">
        <button
          type="button"
          class="bell-notif-btn"
          title="Notificações do contrato"
          (click)="state.showToast('Notificações em dia para ' + state.selectedContract().name)"
        >
          🔔
        </button>
        <button
          type="button"
          class="wa-trigger-btn"
          (click)="toggleWhatsapp.emit()"
        >
          💬 <span class="hide-xs">WhatsApp</span>
        </button>
        <div class="user-chip hide-sm">
          <span class="online-dot"></span>
          <span>{{ state.currentUserEmail() }}</span>
        </div>
        <button type="button" class="logout-btn" (click)="logout()">
          Sair
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);

  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() toggleWhatsapp = new EventEmitter<void>();

  readonly currentRoleMeta = computed(
    () =>
      this.state.roles.find((r) => r.id === this.state.activeRole()) ??
      this.state.roles[0]
  );

  statusLabel(status: HealthStatus): string {
    if (status === 'em-dia') return 'Em dia';
    if (status === 'atencao') return 'Atenção';
    return 'Crítico';
  }

  logout(): void {
    this.state.logout();
    this.router.navigate(['/login']);
  }
}
