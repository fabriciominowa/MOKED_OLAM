import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OlamStateService } from '../../services/olam-state.service';
import { ResolveNavbarComponent } from './resolve-navbar.component';

@Component({
  selector: 'app-resolve-acompanhar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ResolveNavbarComponent],
  template: `
    <div class="mk-resolve-shell">
      <app-resolve-navbar />

      <main class="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- COLUNA ESQUERDA: BUSCA POR CÓDIGO + PROTOCOLOS RECENTES -->
          <section class="lg:col-span-5 mk-surface p-6 space-y-5">
            <div>
              <span class="mk-section-eyebrow">ACOMPANHAMENTO TRANSPARENTE</span>
              <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-moked-ink mt-1">
                Consultar protocolo Moked
              </h1>
              <p class="text-sm text-moked-muted mt-1">
                Digite o código (ex.: <span class="font-mono font-bold">CFTV-03</span>, <span class="font-mono font-bold">OC-01</span> ou <span class="font-mono font-bold">MKD-...</span>) ou clique em um chamado recente abaixo.
              </p>
            </div>

            <div class="flex gap-2">
              <label for="acomp-search" class="sr-only">Código ou palavra-chave do protocolo</label>
              <input
                id="acomp-search"
                type="search"
                class="mk-input"
                [ngModel]="searchCode()"
                (ngModelChange)="searchCode.set($event)"
                placeholder="Ex.: CFTV-03, OC-01, MKD-105..."
              />
            </div>

            <div>
              <span class="mk-label">Protocolos ativos na Base TypeScript ({{ filteredList().length }})</span>
              <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                @for (occ of filteredList(); track occ.id) {
                  <button
                    type="button"
                    class="w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3"
                    [ngClass]="selectedCode() === occ.code ? 'border-moked-crimson bg-rose-50/50' : 'border-slate-200 bg-white'"
                    (click)="selectedCode.set(occ.code)"
                  >
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="font-mono text-xs font-bold text-slate-700">{{ occ.code }}</span>
                        <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {{ occ.division }}
                        </span>
                      </div>
                      <strong class="block text-sm font-bold text-moked-ink truncate">
                        {{ occ.title }}
                      </strong>
                    </div>
                    <span
                      class="status-badge shrink-0"
                      [attr.data-status]="occ.status === 'validada' ? 'em-dia' : 'atencao'"
                    >
                      {{ occ.status === 'validada' ? 'Concluído' : 'Em andamento' }}
                    </span>
                  </button>
                } @empty {
                  <p class="muted-empty">Nenhum protocolo localizado para "{{ searchCode() }}".</p>
                }
              </div>
            </div>
          </section>

          <!-- COLUNA DIREITA: DETALHE, BARRA DE PROGRESSO E CHAT AO VIVO -->
          <section class="lg:col-span-7">
            @if (selectedOccurrence(); as occ) {
              <div class="mk-surface p-6 sm:p-8 space-y-6">
                <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <span class="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                        {{ occ.code }}
                      </span>
                      <span class="mk-chip mk-chip-outline">{{ occ.division }}</span>
                      <span class="mk-chip mk-chip-outline">{{ occ.contractId }}</span>
                    </div>
                    <h2 class="font-display text-xl sm:text-2xl font-extrabold text-moked-ink">
                      {{ occ.title }}
                    </h2>
                    <p class="text-sm text-moked-muted mt-1">{{ occ.description }}</p>
                  </div>

                  <span
                    class="status-badge"
                    [attr.data-status]="occ.status === 'validada' ? 'em-dia' : 'atencao'"
                  >
                    {{
                      occ.status === 'validada'
                        ? 'Concluído / Validado'
                        : occ.status === 'aguardando-validacao'
                          ? 'Em Coordenação'
                          : 'Aberto / Em Execução'
                    }}
                  </span>
                </div>

                <!-- BARRA DE ETAPAS ESTILO HAGANÁ RESOLVE -->
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div class="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span [class.text-moked-crimson]="true">1. Recebido</span>
                    <span [class.text-moked-crimson]="progressPercent(occ.status) >= 55">2. Em Triagem / Reparo</span>
                    <span [class.text-emerald-700]="progressPercent(occ.status) === 100">3. Concluído</span>
                  </div>
                  <div class="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [class.bg-emerald-600]="occ.status === 'validada'"
                      [class.bg-moked-crimson]="occ.status !== 'validada'"
                      [style.width.%]="progressPercent(occ.status)"
                    ></div>
                  </div>
                  <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span><strong>Responsável:</strong> {{ occ.responsible }} · <strong>Prazo:</strong> {{ occ.deadline }}</span>
                    @if (occ.status !== 'validada') {
                      <button
                        type="button"
                        class="text-xs font-bold text-emerald-700 hover:underline"
                        (click)="state.advanceTicketStatus(occ.code, 'validada')"
                      >
                        ✓ Marcar como Validado (Simular conclusão)
                      </button>
                    }
                  </div>
                </div>

                <!-- THREAD DE CHAT AO VIVO -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-display text-base font-bold text-moked-ink">
                      Conversa direta e histórico do atendimento
                    </h3>
                    <span class="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Chat sincronizado
                    </span>
                  </div>

                  <div class="space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
                    @for (msg of activeMessages(); track msg.id) {
                      <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <strong class="text-xs font-extrabold text-moked-ink">
                            {{ msg.author }} <span class="font-normal text-slate-500">({{ msg.roleLabel }})</span>
                          </strong>
                          <span class="font-mono text-[11px] text-slate-400">{{ msg.timestamp }}</span>
                        </div>
                        <p class="text-sm text-slate-700">{{ msg.body }}</p>
                      </div>
                    } @empty {
                      <div class="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
                        {{ occ.consultantNotes || occ.clientStatusText }}
                      </div>
                    }
                  </div>

                  <form class="flex flex-col sm:flex-row gap-2" (ngSubmit)="sendReply(occ.code)">
                    <label for="chat-msg" class="sr-only">Mensagem para o protocolo</label>
                    <input
                      id="chat-msg"
                      type="text"
                      class="mk-input flex-1"
                      [(ngModel)]="chatText"
                      name="chatText"
                      placeholder="Escreva uma atualização ou resposta para este protocolo..."
                    />
                    <button type="submit" class="mk-btn mk-btn-primary">
                      Enviar resposta
                    </button>
                  </form>
                </div>
              </div>
            } @else {
              <div class="mk-surface p-10 text-center">
                <p class="text-sm text-moked-muted mb-4">Selecione um protocolo ao lado ou crie um novo chamado.</p>
                <a routerLink="/registrar" class="mk-btn mk-btn-accent">+ Registrar novo chamado</a>
              </div>
            }
          </section>
        </div>
      </main>
    </div>
  `,
})
export class ResolveAcompanharComponent implements OnInit {
  readonly state = inject(OlamStateService);
  private readonly route = inject(ActivatedRoute);

  readonly searchCode = signal<string>('');
  readonly selectedCode = signal<string>('CFTV-03');
  chatText = '';

  readonly filteredList = computed(() => {
    const q = this.searchCode().trim().toLowerCase();
    return this.state
      .occurrences()
      .filter(
        (o) =>
          !q ||
          o.code.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.division.toLowerCase().includes(q)
      );
  });

  readonly selectedOccurrence = computed(() => {
    const code = this.selectedCode();
    return (
      this.state.occurrences().find((o) => o.code === code) ??
      this.filteredList()[0] ??
      null
    );
  });

  readonly activeMessages = computed(() => {
    const occ = this.selectedOccurrence();
    if (!occ) return [];
    return this.state
      .ticketMessages()
      .filter((m) => m.occurrenceCode === occ.code || m.occurrenceCode === occ.id);
  });

  ngOnInit(): void {
    const paramCode = this.route.snapshot.queryParamMap.get('code');
    if (paramCode) {
      this.selectedCode.set(paramCode);
    } else if (this.state.occurrences().length > 0) {
      this.selectedCode.set(this.state.occurrences()[0].code);
    }
  }

  progressPercent(status: string): number {
    if (status === 'validada') return 100;
    if (status === 'aguardando-validacao' || status === 'manutencao') return 64;
    return 32;
  }

  sendReply(code: string): void {
    if (!this.chatText.trim()) return;
    this.state.addTicketChatMessage(
      code,
      this.state.currentUserEmail(),
      'Participante Moked Resolve',
      this.chatText
    );
    this.chatText = '';
  }
}
