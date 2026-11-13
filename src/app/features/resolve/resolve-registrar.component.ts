import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DivisionCode } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { ResolveNavbarComponent } from './resolve-navbar.component';

@Component({
  selector: 'app-resolve-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ResolveNavbarComponent],
  template: `
    <div class="mk-resolve-shell">
      <app-resolve-navbar />

      <main class="max-w-[920px] mx-auto px-4 sm:px-6 py-10">
        @if (!createdProtocol()) {
          <div class="mb-6">
            <span class="mk-section-eyebrow">NOVO REGISTRO · MOKED RESOLVE</span>
            <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-moked-ink mt-1">
              O que você deseja registrar na Moked?
            </h1>
            <p class="text-sm text-moked-muted mt-1">
              Fluxo guiado em 4 passos com direcionamento automático para a divisão responsável.
            </p>
          </div>

          <!-- STEPPER VISUAL -->
          <div class="mk-stepper mb-6" aria-label="Etapas do formulário">
            @for (s of steps; track s.num) {
              <button
                type="button"
                class="mk-step-btn"
                [class.active]="step() === s.num"
                [class.done]="step() > s.num"
                (click)="goStep(s.num)"
              >
                <span class="mk-step-node">{{ step() > s.num ? '✓' : s.num }}</span>
                <span class="hidden sm:inline">{{ s.label }}</span>
              </button>
            }
          </div>

          <section class="mk-surface p-6 sm:p-8">
            <!-- ETAPA 1: TIPO -->
            @if (step() === 1) {
              <h2 class="font-display text-xl font-bold text-moked-ink mb-4">
                1. Selecione a categoria do registro
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  class="mk-cat-card ideia text-left"
                  [class.selected]="kind() === 'ideia'"
                  (click)="selectKind('ideia')"
                >
                  <span class="mk-chip mk-chip-ideia mk-chip-dot">Ideia</span>
                  <h3>Melhoria ou Sugestão</h3>
                  <p>Processos de portaria, escalas, rondas ou tecnologia.</p>
                </button>

                <button
                  type="button"
                  class="mk-cat-card critica text-left"
                  [class.selected]="kind() === 'critica'"
                  (click)="selectKind('critica')"
                >
                  <span class="mk-chip mk-chip-critica mk-chip-dot">Ocorrência / Crítica</span>
                  <h3>Falha, Crítica ou Alerta</h3>
                  <p>Avaria de CFTV, divergência no posto ou chamado urgente.</p>
                </button>

                <button
                  type="button"
                  class="mk-cat-card elogio text-left"
                  [class.selected]="kind() === 'elogio'"
                  (click)="selectKind('elogio')"
                >
                  <span class="mk-chip mk-chip-elogio mk-chip-dot">Elogio</span>
                  <h3>Reconhecer Equipe</h3>
                  <p>Postura exemplar e atendimentos que merecem destaque.</p>
                </button>
              </div>

              <div class="mt-6 flex justify-end">
                <button type="button" class="mk-btn mk-btn-primary" (click)="step.set(2)">
                  Continuar →
                </button>
              </div>
            }

            <!-- ETAPA 2: CONTRATO & DIVISÃO -->
            @if (step() === 2) {
              <h2 class="font-display text-xl font-bold text-moked-ink mb-4">
                2. Contrato e Divisão Moked responsável
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="mk-label" for="reg-contract">Contrato / Unidade</label>
                  <select id="reg-contract" class="mk-input" [(ngModel)]="contractId" name="contractId">
                    @for (c of state.contracts(); track c.id) {
                      <option [value]="c.id">{{ c.name }} — {{ c.unit }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mk-label" for="reg-div">Divisão Moked</label>
                  <select id="reg-div" class="mk-input" [(ngModel)]="division" name="division">
                    @for (d of state.divisions; track d.code) {
                      <option [value]="d.code">{{ d.code }} — {{ d.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="mt-4">
                <label class="mk-label" for="reg-loc">Posto / Local específico (opcional)</label>
                <input
                  id="reg-loc"
                  type="text"
                  class="mk-input"
                  [(ngModel)]="location"
                  name="location"
                  placeholder="Ex.: Portaria Principal, Docas 02, Central de Controle..."
                />
              </div>

              <div class="mt-6 flex justify-between gap-3">
                <button type="button" class="mk-btn mk-btn-ghost" (click)="step.set(1)">
                  ← Voltar
                </button>
                <button type="button" class="mk-btn mk-btn-primary" (click)="step.set(3)">
                  Continuar →
                </button>
              </div>
            }

            <!-- ETAPA 3: RELATO -->
            @if (step() === 3) {
              <h2 class="font-display text-xl font-bold text-moked-ink mb-4">
                3. Descreva o que aconteceu ou sua sugestão
              </h2>

              <div class="space-y-4">
                <div>
                  <label class="mk-label" for="reg-title">Título resumido *</label>
                  <input
                    id="reg-title"
                    type="text"
                    class="mk-input"
                    [(ngModel)]="title"
                    name="title"
                    placeholder="Ex.: Câmera do portão Leste sem sinal ou Elogio ao plantão"
                  />
                </div>

                @if (kind() === 'elogio') {
                  <div>
                    <label class="mk-label" for="reg-recipient">Nome do profissional ou equipe homenageada</label>
                    <input
                      id="reg-recipient"
                      type="text"
                      class="mk-input"
                      [(ngModel)]="recipientName"
                      name="recipientName"
                      placeholder="Ex.: Sérgio Oliveira · Turno Diurno"
                    />
                  </div>
                } @else {
                  <div>
                    <label class="mk-label" for="reg-prio">Prioridade percebida</label>
                    <select id="reg-prio" class="mk-input" [(ngModel)]="priority" name="priority">
                      <option value="rotina">Rotina (Prazo padrão 24h úteis)</option>
                      <option value="alta">Alta (Atendimento prioritário)</option>
                      <option value="grave">Grave / Urgente (Acionamento imediato)</option>
                    </select>
                  </div>
                }

                <div>
                  <label class="mk-label" for="reg-desc">Descrição completa *</label>
                  <textarea
                    id="reg-desc"
                    rows="4"
                    class="mk-input"
                    [(ngModel)]="description"
                    name="description"
                    placeholder="Inclua detalhes do local, horário ou impacto para agilizar a resposta..."
                  ></textarea>
                </div>
              </div>

              <div class="mt-6 flex justify-between gap-3">
                <button type="button" class="mk-btn mk-btn-ghost" (click)="step.set(2)">
                  ← Voltar
                </button>
                <button
                  type="button"
                  class="mk-btn mk-btn-primary"
                  [disabled]="!title.trim() || !description.trim()"
                  (click)="step.set(4)"
                >
                  Revisar e Identificar →
                </button>
              </div>
            }

            <!-- ETAPA 4: IDENTIFICAÇÃO / ANÔNIMO -->
            @if (step() === 4) {
              <h2 class="font-display text-xl font-bold text-moked-ink mb-4">
                4. Privacidade e confirmação do envio
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  class="mk-surface p-4 text-left border-2 transition-all"
                  [ngClass]="!anonymous() ? 'border-moked-crimson bg-rose-50/40' : ''"
                  (click)="anonymous.set(false)"
                >
                  <strong class="block text-sm font-bold text-moked-ink">Enviar identificado</strong>
                  <small class="text-xs text-moked-muted">Permite retorno nominal direto pelo consultor.</small>
                </button>

                <button
                  type="button"
                  class="mk-surface p-4 text-left border-2 transition-all"
                  [ngClass]="anonymous() ? 'border-moked-crimson bg-rose-50/40' : ''"
                  (click)="anonymous.set(true)"
                >
                  <strong class="block text-sm font-bold text-moked-ink">Registro 100% anônimo (LGPD)</strong>
                  <small class="text-xs text-moked-muted">Seu nome não aparece no chamado; acompanhe pelo código.</small>
                </button>
              </div>

              @if (!anonymous()) {
                <div class="mb-5">
                  <label class="mk-label" for="reg-name">Seu nome ou setor</label>
                  <input
                    id="reg-name"
                    type="text"
                    class="mk-input"
                    [(ngModel)]="reporterName"
                    name="reporterName"
                    placeholder="Ex.: Cliente Contrato B ou Líder Sérgio"
                  />
                </div>
              }

              <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
                <div><strong>Tipo:</strong> {{ kind() | uppercase }} · <strong>Divisão:</strong> {{ division }}</div>
                <div><strong>Assunto:</strong> {{ title }}</div>
              </div>

              <div class="mt-6 flex justify-between gap-3">
                <button type="button" class="mk-btn mk-btn-ghost" (click)="step.set(3)">
                  ← Ajustar relato
                </button>
                <button type="button" class="mk-btn mk-btn-accent mk-btn-lg" (click)="submitWizard()">
                  Gerar Protocolo Moked →
                </button>
              </div>
            }
          </section>
        } @else {
          <!-- RECIBO DO PROTOCOLO GERADO -->
          <section class="mk-surface p-8 text-center max-w-[620px] mx-auto">
            <span class="mk-chip mk-chip-elogio mb-4">Protocolo Registrado com Sucesso</span>
            <h1 class="font-display text-3xl font-extrabold text-moked-ink">
              Seu código de acompanhamento:
            </h1>

            <div class="my-6 py-5 px-6 rounded-2xl bg-slate-950 text-white inline-block">
              <div class="text-[11px] uppercase tracking-widest text-rose-400 font-bold mb-1">
                CÓDIGO ÚNICO MOKED RESOLVE
              </div>
              <div class="font-mono text-4xl font-extrabold tracking-wider">
                {{ createdProtocol() }}
              </div>
            </div>

            <p class="text-sm text-moked-muted leading-relaxed mb-6">
              O registro foi gravado na <strong>Base TypeScript</strong>, encaminhado para a divisão
              <strong>{{ division }}</strong> e já está disponível no painel de acompanhamento e auditoria.
            </p>

            <div class="flex flex-wrap justify-center gap-3">
              <button type="button" class="mk-btn mk-btn-accent" (click)="goTrack()">
                Acompanhar protocolo agora →
              </button>
              <button type="button" class="mk-btn mk-btn-ghost" (click)="resetForm()">
                Abrir outro registro
              </button>
              <a routerLink="/resolve" class="mk-btn mk-btn-ghost">
                Voltar ao início
              </a>
            </div>
          </section>
        }
      </main>
    </div>
  `,
})
export class ResolveRegistrarComponent implements OnInit {
  readonly state = inject(OlamStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly steps = [
    { num: 1, label: 'Tipo' },
    { num: 2, label: 'Contrato & Divisão' },
    { num: 3, label: 'Relato' },
    { num: 4, label: 'Envio' },
  ];

  readonly step = signal<number>(1);
  readonly kind = signal<'ideia' | 'critica' | 'elogio'>('ideia');
  readonly anonymous = signal<boolean>(false);
  readonly createdProtocol = signal<string | null>(null);

  contractId = 'CT-B';
  division: DivisionCode = 'MOKPAT';
  location = '';
  title = '';
  description = '';
  priority: 'rotina' | 'alta' | 'grave' = 'alta';
  reporterName = '';
  recipientName = '';

  ngOnInit(): void {
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    if (tipo === 'ideia' || tipo === 'critica' || tipo === 'elogio') {
      this.kind.set(tipo);
      this.step.set(2);
    }
    this.contractId = this.state.selectedContractId();
  }

  selectKind(k: 'ideia' | 'critica' | 'elogio'): void {
    this.kind.set(k);
    this.step.set(2);
  }

  goStep(num: number): void {
    if (num <= this.step()) {
      this.step.set(num);
    }
  }

  submitWizard(): void {
    const protocol = this.state.registerResolveTicket({
      kind: this.kind(),
      contractId: this.contractId,
      division: this.division,
      location: this.location,
      title: this.title,
      description: this.description,
      priority: this.kind() === 'elogio' ? 'rotina' : this.priority,
      anonymous: this.anonymous(),
      reporterName: this.reporterName,
      recipientName: this.recipientName,
    });
    this.createdProtocol.set(protocol);
  }

  goTrack(): void {
    const code = this.createdProtocol();
    this.router.navigate(['/acompanhar'], { queryParams: { code } });
  }

  resetForm(): void {
    this.createdProtocol.set(null);
    this.step.set(1);
    this.title = '';
    this.description = '';
    this.location = '';
    this.recipientName = '';
  }
}
