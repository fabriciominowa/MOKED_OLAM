import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { Moked3dCanvasComponent } from '../../shared/components/moked-3d-canvas.component';
import { ResolveNavbarComponent } from './resolve-navbar.component';

@Component({
  selector: 'app-resolve-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveNavbarComponent, Moked3dCanvasComponent],
  template: `
    <div class="mk-resolve-shell">
      <app-resolve-navbar />

      <!-- HERO PRINCIPAL (ESTILO HAGANÁ RESOLVE COM IDENTIDADE MOKED + THREE.JS) -->
      <section class="mk-hero">
        <div class="mk-hero-3d" aria-hidden="true">
          <app-moked-3d-canvas mode="light" status="em-dia" />
        </div>

        <div class="mk-hero-grid">
          <div class="mk-stagger">
            <div class="mk-hero-eyebrow">
              <span class="mk-hero-eyebrow-dot"></span>
              <span>Canal Oficial de Atendimento &amp; Governança · Grupo Moked</span>
            </div>

            <h1 class="mk-hero-title">
              Registre ideias, ocorrências e <em>elogios</em> na Moked.
            </h1>

            <p class="mk-hero-sub">
              O canal transparente do Grupo Moked para clientes, líderes de posto, consultores e equipes.
              Direcionamento automático por divisão, protocolo único e acompanhamento em tempo real.
            </p>

            <div class="mk-hero-cta-row">
              <a routerLink="/registrar" class="mk-btn mk-btn-accent mk-btn-lg">
                <span>Registrar chamado agora</span>
                <span aria-hidden="true">→</span>
              </a>
              <a routerLink="/acompanhar" class="mk-btn mk-btn-ghost mk-btn-lg">
                <span>Acompanhar protocolo</span>
              </a>
              <button type="button" class="mk-btn mk-btn-primary mk-btn-lg" (click)="openWorkspace('cliente')">
                <span>Portal Operacional 360</span>
              </button>
            </div>

            <div class="mk-hero-stats-row">
              <div>
                <div class="mk-hero-stat-num">{{ state.contracts().length }}</div>
                <div class="mk-hero-stat-label">Contratos monitorados em tempo real</div>
              </div>
              <div>
                <div class="mk-hero-stat-num">94%</div>
                <div class="mk-hero-stat-label">SLA atendido no prazo</div>
              </div>
              <div>
                <div class="mk-hero-stat-num">{{ state.dbTotalRecords() }}</div>
                <div class="mk-hero-stat-label">Registros na Base TypeScript</div>
              </div>
            </div>
          </div>

          <!-- CARD DE FEED AO VIVO ESTILO HAGANÁ RESOLVE -->
          <aside class="mk-feed-card" aria-label="Feed ao vivo de protocolos Moked">
            <div class="mk-feed-card-head">
              <strong class="mk-feed-card-title">Atividade ao vivo · Moked Resolve</strong>
              <span class="mk-feed-live">
                <span class="mk-feed-live-dot"></span>
                TEMPO REAL
              </span>
            </div>

            <div class="mk-feed-list">
              @for (item of liveFeedItems(); track item.code) {
                <button
                  type="button"
                  class="mk-feed-item text-left w-full"
                  (click)="trackCode(item.code)"
                >
                  <span class="mk-feed-item-cat" [ngClass]="'cat-' + item.kind"></span>
                  <div class="mk-feed-item-body">
                    <div class="mk-feed-item-line">
                      <span class="font-mono text-xs font-bold text-slate-500 mr-1.5">{{ item.code }}</span>
                      <strong>{{ item.title }}</strong>
                    </div>
                    <div class="mk-feed-item-meta">
                      {{ item.division }} · {{ item.statusText }}
                    </div>
                  </div>
                  <span class="text-xs font-bold text-slate-400">›</span>
                </button>
              }
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Clique em qualquer item para abrir o protocolo</span>
              <a routerLink="/acompanhar" class="font-bold text-moked-crimson hover:underline">
                Ver todos →
              </a>
            </div>
          </aside>
        </div>
      </section>

      <!-- FAIXA DE PROPOSTAS: IDEIA, OCORRÊNCIA OU ELOGIO -->
      <section class="mk-section bg-white border-y border-slate-200/80">
        <div class="mk-section-wrap">
          <div class="mk-section-head">
            <div class="mk-section-eyebrow">ESCOLHA COMO CONTRIBUIR</div>
            <h2 class="mk-section-title">Três caminhos rápidos com direcionamento automático</h2>
            <p class="mk-section-sub">
              Cada registro é encaminhado automaticamente para a divisão Moked responsável e gera um protocolo exclusivo de acompanhamento.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button type="button" class="mk-cat-card ideia text-left" (click)="startWithKind('ideia')">
              <span class="mk-chip mk-chip-ideia mk-chip-dot">Ideia / Melhoria</span>
              <h3>Sugerir melhoria operacional</h3>
              <p>Proponha otimizações de ronda, controle de acesso, checklist P950 ou escala de turnos.</p>
              <span class="mk-cat-link">Registrar ideia →</span>
            </button>

            <button type="button" class="mk-cat-card critica text-left" (click)="startWithKind('critica')">
              <span class="mk-chip mk-chip-critica mk-chip-dot">Ocorrência / Crítica</span>
              <h3>Relatar ocorrência ou falha técnica</h3>
              <p>Acione consultoria, liderança de posto ou manutenção CFTV/alarme com foto e SLA imediato.</p>
              <span class="mk-cat-link">Abrir ocorrência →</span>
            </button>

            <button type="button" class="mk-cat-card elogio text-left" (click)="startWithKind('elogio')">
              <span class="mk-chip mk-chip-elogio mk-chip-dot">Elogio / Reconhecimento</span>
              <h3>Reconhecer um profissional ou equipe</h3>
              <p>Valorize colaboradores e turmas no Mural Moked e pontue no Ranking de excelência.</p>
              <span class="mk-cat-link">Enviar elogio →</span>
            </button>
          </div>
        </div>
      </section>

      <!-- COMO FUNCIONA EM 3 PASSOS -->
      <section class="mk-section">
        <div class="mk-section-wrap">
          <div class="mk-section-head">
            <div class="mk-section-eyebrow">COMO FUNCIONA</div>
            <h2 class="mk-section-title">Da abertura à validação em 3 etapas transparentes</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="mk-surface p-6">
              <div class="font-mono text-xs font-bold text-moked-crimson mb-2">PASSO 01</div>
              <h3 class="font-display text-lg font-bold text-moked-ink mb-2">Registro guiado ou anônimo</h3>
              <p class="text-sm text-moked-muted leading-relaxed">
                Selecione o tipo, contrato e divisão (MOKPAT, MOKTEC, MOKLOG...). Escolha entre identificar-se ou enviar de forma anônima conforme a LGPD.
              </p>
            </div>
            <div class="mk-surface p-6">
              <div class="font-mono text-xs font-bold text-moked-crimson mb-2">PASSO 02</div>
              <h3 class="font-display text-lg font-bold text-moked-ink mb-2">Protocolo &amp; Triagem 360</h3>
              <p class="text-sm text-moked-muted leading-relaxed">
                Gera código único na hora (<span class="font-mono">MKD-XXX</span>) e aciona o consultor ou técnico responsável na Base TypeScript Moked.
              </p>
            </div>
            <div class="mk-surface p-6">
              <div class="font-mono text-xs font-bold text-moked-crimson mb-2">PASSO 03</div>
              <h3 class="font-display text-lg font-bold text-moked-ink mb-2">Chat direto e encerramento</h3>
              <p class="text-sm text-moked-muted leading-relaxed">
                Acompanhe cada avanço pela barra de progresso e troque mensagens com o setor responsável até a conclusão validada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ECOSSISTEMA COMPLETO MOKED: TODOS OS 7 PERFIS & 8 DIVISÕES -->
      <section class="mk-section bg-white border-t border-slate-200/80">
        <div class="mk-section-wrap">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9">
            <div class="mk-section-head mb-0">
              <div class="mk-section-eyebrow">PLATAFORMA OPERACIONAL MOKED 360</div>
              <h2 class="mk-section-title">Todos os perfis e divisões conectados</h2>
              <p class="mk-section-sub">
                Acesse qualquer módulo operacional da Moked diretamente — com os 20 contratos, BI Executivo, X-Ray, Treinamento e Monitoramento.
              </p>
            </div>
            <a routerLink="/login" class="mk-btn mk-btn-primary">
              Selecionar usuário no Login →
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (role of state.roles; track role.id) {
              <button
                type="button"
                class="mk-surface p-5 text-left hover:border-moked-crimson hover:-translate-y-0.5 transition-all"
                (click)="openWorkspace(role.id)"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-moked-crimson border border-rose-200">
                    {{ role.code }}
                  </span>
                  <span class="text-xs font-bold text-slate-400">Abrir →</span>
                </div>
                <h3 class="font-display text-base font-bold text-moked-ink mb-1">
                  {{ role.shortLabel }}
                </h3>
                <p class="text-xs text-moked-muted leading-relaxed">
                  {{ role.subtitle }}
                </p>
              </button>
            }

            <div class="mk-surface p-5 bg-slate-950 text-white border-slate-800 flex flex-col justify-between">
              <div>
                <span class="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  8 Divisões Ativas
                </span>
                <div class="flex flex-wrap gap-1.5 mt-3">
                  @for (d of state.divisions; track d.code) {
                    <span class="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                      {{ d.code }}
                    </span>
                  }
                </div>
              </div>
              <button
                type="button"
                class="mt-4 text-left text-xs font-bold text-rose-300 hover:text-rose-200"
                (click)="state.resetDatabaseToSeed()"
              >
                ↺ Restaurar Base TypeScript ({{ state.dbTotalRecords() }} registros)
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="bg-slate-950 text-slate-300 py-10 px-6 border-t border-slate-800">
        <div class="max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="font-display text-lg font-extrabold text-white">
              Moked <span class="text-rose-500">Resolve</span> · OLAM 360
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Conformidade LGPD · Base TypeScript Persistente · Segurança Patrimonial, Eletrônica e Facilities
            </p>
          </div>
          <div class="flex flex-wrap gap-4 text-xs font-semibold">
            <a routerLink="/registrar" class="hover:text-white">Registrar chamado</a>
            <a routerLink="/acompanhar" class="hover:text-white">Acompanhar protocolo</a>
            <a routerLink="/mural" class="hover:text-white">Mural de Elogios</a>
            <a routerLink="/ranking" class="hover:text-white">Ranking</a>
            <a routerLink="/login" class="hover:text-white">Portal 360</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class ResolveHomeComponent {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);

  readonly liveFeedItems = computed(() => {
    const occs = this.state.occurrences().slice(0, 4).map((o) => ({
      code: o.code,
      title: o.title,
      division: o.division,
      statusText: o.status === 'validada' ? 'Validado' : 'Em andamento',
      kind: o.status === 'validada' ? ('elogio' as const) : ('critica' as const),
    }));
    const praises = this.state.muralPraises().slice(0, 2).map((p) => ({
      code: p.id,
      title: p.title,
      division: p.division,
      statusText: `Elogio · ${p.recipient}`,
      kind: 'elogio' as const,
    }));
    return [...occs.slice(0, 3), ...praises.slice(0, 2)];
  });

  startWithKind(kind: 'ideia' | 'critica' | 'elogio'): void {
    this.router.navigate(['/registrar'], { queryParams: { tipo: kind } });
  }

  trackCode(code: string): void {
    this.router.navigate(['/acompanhar'], { queryParams: { code } });
  }

  openWorkspace(role: UserRole): void {
    this.state.setRole(role);
    this.state.isLoggedIn.set(true);
    this.router.navigateByUrl('/' + role);
  }
}

