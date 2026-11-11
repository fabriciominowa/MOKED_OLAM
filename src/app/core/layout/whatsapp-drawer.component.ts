import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-whatsapp-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wa-drawer">
      <div class="wa-drawer-header">
        <div>
          <strong>Olam · Consulta Rápida WhatsApp</strong>
          <small>Respostas conforme permissão do perfil {{ currentRoleMeta().shortLabel }}</small>
        </div>
        <button type="button" (click)="close.emit()">✕</button>
      </div>

      <div class="wa-quick-chips">
        <button type="button" (click)="sendQuery('Status Câmera CFTV 03')">
          Status CFTV 03
        </button>
        <button type="button" (click)="sendQuery('Saúde do Contrato')">
          Saúde do Contrato
        </button>
        <button type="button" (click)="sendQuery('Resumo da Carteira')">
          Resumo Carteira
        </button>
      </div>

      <div class="wa-messages">
        @for (m of messages(); track $index) {
          <div class="wa-msg" [class.user]="m.sender === 'user'">
            <p>{{ m.text }}</p>
            <small>{{ m.time }}</small>
          </div>
        }
      </div>

      <div class="wa-input-row">
        <input
          type="text"
          [(ngModel)]="queryText"
          placeholder="Digite sua consulta..."
          (keyup.enter)="sendQuery()"
        />
        <button type="button" (click)="sendQuery()">Enviar</button>
      </div>
    </div>
  `,
})
export class WhatsappDrawerComponent {
  readonly state = inject(OlamStateService);
  @Output() close = new EventEmitter<void>();

  queryText = '';
  readonly messages = signal<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou o canal de consulta rápida do Olam via WhatsApp. Consulte indicadores, status de câmeras ou pendências conforme sua permissão.',
      time: '08:00',
    },
  ]);

  readonly currentRoleMeta = computed(
    () =>
      this.state.roles.find((r) => r.id === this.state.activeRole()) ??
      this.state.roles[0]
  );

  sendQuery(preset?: string): void {
    const q = (preset || this.queryText).trim();
    if (!q) return;
    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const c = this.state.selectedContract();
    let reply = '';
    if (q.toLowerCase().includes('cftv') || q.toLowerCase().includes('câmera')) {
      const occ = this.state.occurrences()[0];
      reply = `[${c.name}] ${occ.title} · Status: ${occ.status.toUpperCase()} · Responsável: ${occ.responsible} · Prazo: ${occ.deadline}.`;
    } else if (q.toLowerCase().includes('saúde') || q.toLowerCase().includes('termômetro')) {
      reply = `[${c.name}] Saúde Geral: ${c.health.overall.toUpperCase()} | RH: ${c.health.rh.toUpperCase()} | RT: ${c.health.rt.toUpperCase()} | RA: ${c.health.ra.toUpperCase()}.`;
    } else {
      reply = `Resumo Operacional (${this.currentRoleMeta().shortLabel}): 20 contratos ativos (14 em dia, 4 em atenção, 2 críticos). Cobertura semanal: 16/20 visitados (80%).`;
    }

    this.messages.update((msgs) => [
      ...msgs,
      { sender: 'user', text: q, time: now },
      { sender: 'bot', text: reply, time: now },
    ]);
    this.queryText = '';
  }
}

