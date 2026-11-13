import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DivisionCode } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { Moked3dCanvasComponent } from '../../shared/components/moked-3d-canvas.component';

@Component({
  selector: 'app-alta-gestao-bi',
  standalone: true,
  imports: [CommonModule, FormsModule, Moked3dCanvasComponent],
  template: `
    <!-- MÓDULO 1: VISÃO EXECUTIVA -->
    @if (state.managementActiveTab() === 'visao-executiva') {
      <div class="exec-dashboard">
        <section class="exec-3d-banner">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-300 backdrop-blur-md">
              <span class="fx-radar-dot"></span>
              <span>Telemetria 3D em Tempo Real · Moked Resolve 360</span>
            </div>
            <h2 class="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Comando Executivo · 20 Contratos Monitorados
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed max-w-xl">
              Visualização espacial integrada à Base TypeScript: acompanhe cobertura de visitas, alertas críticos e fluxos do Moked Resolve.
            </p>
            <div class="flex flex-wrap gap-2 pt-1 font-mono text-xs">
              <span class="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-emerald-200 font-semibold">
                ● {{ state.portfolioSummary().emDia }} Em Dia
              </span>
              <span class="rounded-lg bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 text-amber-200 font-semibold">
                ▲ {{ state.portfolioSummary().atencao }} Atenção
              </span>
              <span class="rounded-lg bg-rose-500/20 border border-rose-400/30 px-2.5 py-1 text-rose-200 font-semibold">
                ■ {{ state.portfolioSummary().criticos }} Críticos
              </span>
            </div>
          </div>
          <div class="e3d-stage" aria-hidden="true">
            <app-moked-3d-canvas mode="network" status="em-dia" />
          </div>
        </section>

        <div class="exec-filters-bar">
          <h2>Visão Executiva</h2>
          <div class="exec-selects">
            <select [(ngModel)]="state.biPeriodFilter">
              <option value="Semana">📅 Período: Semana</option>
              <option value="Mês">📅 Período: Mês</option>
              <option value="Trimestre">📅 Período: Trimestre</option>
            </select>
            <select [(ngModel)]="state.biDivisionFilter">
              <option value="Todas">🏢 Todas as áreas</option>
              @for (d of state.divisions; track d.code) {
                <option [value]="d.code">{{ d.code }} — {{ d.name }}</option>
              }
            </select>
            <select [(ngModel)]="state.biManagerFilter">
              <option value="Todos">👤 Todos os gestores</option>
              <option value="Gestor A">Gestor A</option>
              <option value="Gestor B">Gestor B</option>
              <option value="Gestor C">Gestor C</option>
              <option value="Gestor D">Gestor D</option>
            </select>
          </div>
        </div>

        <!-- 4 KPI CARDS INTERATIVOS -->
        <div class="exec-kpi-grid">
          <div class="exec-kpi-card" (click)="drilldownModalType.set('visitas')">
            <span class="ek-icon red">📍</span>
            <div>
              <small>Visitas</small>
              <strong>24</strong>
              <span>de 30 previstas (80%)</span>
            </div>
          </div>

          <div class="exec-kpi-card" (click)="drilldownModalType.set('cobertura')">
            <span class="ek-icon green">📄</span>
            <div>
              <small>Contratos visitados</small>
              <strong>
                {{ state.portfolioSummary().visited }}<span class="muted">/20</span>
              </strong>
              <span>Cobertura: {{ state.portfolioSummary().coveragePercent }}%</span>
            </div>
          </div>

          <div class="exec-kpi-card" (click)="drilldownModalType.set('treinamentos')">
            <span class="ek-icon red">🎓</span>
            <div>
              <small>Treinamentos</small>
              <strong>8</strong>
              <span>90% presença (72/80)</span>
            </div>
          </div>

          <div class="exec-kpi-card" (click)="drilldownModalType.set('vencidas')">
            <span class="ek-icon amber">⚠️</span>
            <div>
              <small>Ações vencidas</small>
              <strong>5</strong>
              <span>3 críticas · Ver responsáveis</span>
            </div>
          </div>
        </div>

        @if (drilldownModalType()) {
          <div class="card-panel">
            <div class="panel-top">
              <h4>Detalhamento dos Registros — {{ drilldownModalType() | uppercase }}</h4>
              <button type="button" class="btn-ghost" (click)="drilldownModalType.set(null)">
                ✕
              </button>
            </div>
            <p>
              Todos os indicadores são alimentados pelos registros reais de campo com data,
              entrada, saída, duração e evidência fotográfica.
            </p>
          </div>
        }

        <!-- GRÁFICO VISITAS POR GESTOR + MAPA DE CALOR -->
        <div class="two-col-grid">
          <div class="card-panel">
            <h3>Visitas por Gestor (Previstas vs. Realizadas)</h3>
            <div class="vbars-chart">
              @for (m of managerStats; track m.name) {
                <div class="vbar-group">
                  <div class="vbar-columns">
                    <div class="bar-planned" [style.height.px]="m.planned * 15">
                      <span>{{ m.planned }}</span>
                    </div>
                    <div class="bar-completed" [style.height.px]="m.completed * 15">
                      <span>{{ m.completed }}</span>
                    </div>
                  </div>
                  <strong>{{ m.name }}</strong>
                  <small>{{ m.division }}</small>
                </div>
              }
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-top">
              <h3>Mapa de Calor · Pendências Vencidas</h3>
              <div class="legend-inline">
                <span class="badge-green">Baixa (0)</span>
                <span class="badge-amber">Média (1)</span>
                <span class="badge-red">Alta (2+)</span>
              </div>
            </div>

            <div class="heatmap-container">
              <table class="heat-matrix">
                <thead>
                  <tr>
                    <th>Divisão</th>
                    <th>Contrato A</th>
                    <th>Contrato B</th>
                    <th>Contrato C</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of heatmapRows(); track r.area) {
                    <tr>
                      <td><strong>{{ r.area }}</strong></td>
                      <td
                        [attr.data-val]="r.a"
                        (click)="state.selectContract('CT-A'); state.managementActiveTab.set('xray-contrato')"
                      >
                        {{ r.a }}
                      </td>
                      <td
                        [attr.data-val]="r.b"
                        (click)="state.selectContract('CT-B'); state.managementActiveTab.set('xray-contrato')"
                      >
                        {{ r.b }}
                      </td>
                      <td
                        [attr.data-val]="r.c"
                        (click)="state.selectContract('CT-C'); state.managementActiveTab.set('xray-contrato')"
                      >
                        {{ r.c }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="geo-heatmap">
                <svg viewBox="0 0 220 150" class="geo-svg">
                  <path
                    d="M25,45 L75,20 L145,25 L195,55 L175,120 L110,138 L45,115 Z"
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    stroke-width="2"
                  />
                  <g
                    class="pin"
                    (click)="state.selectContract('CT-A'); state.managementActiveTab.set('xray-contrato')"
                  >
                    <circle cx="65" cy="52" r="9" fill="#ef4444" />
                    <text
                      x="65"
                      y="55"
                      text-anchor="middle"
                      fill="#fff"
                      font-size="8"
                      font-weight="bold"
                    >
                      A
                    </text>
                  </g>
                  <g
                    class="pin"
                    (click)="state.selectContract('CT-B'); state.managementActiveTab.set('xray-contrato')"
                  >
                    <circle cx="115" cy="68" r="9" fill="#f59e0b" />
                    <text
                      x="115"
                      y="71"
                      text-anchor="middle"
                      fill="#fff"
                      font-size="8"
                      font-weight="bold"
                    >
                      B
                    </text>
                  </g>
                  <g
                    class="pin"
                    (click)="state.selectContract('CT-C'); state.managementActiveTab.set('xray-contrato')"
                  >
                    <circle cx="155" cy="48" r="9" fill="#ef4444" />
                    <text
                      x="155"
                      y="51"
                      text-anchor="middle"
                      fill="#fff"
                      font-size="8"
                      font-weight="bold"
                    >
                      C
                    </text>
                  </g>
                  <circle cx="85" cy="95" r="7" fill="#16a34a" />
                  <circle cx="138" cy="102" r="7" fill="#16a34a" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- REGISTROS RECENTES -->
        <div class="card-panel">
          <h3>Registros Recentes de Campo</h3>
          <div class="recent-strip-grid">
            <div
              class="rec-tile"
              (click)="state.selectContract('CT-A'); state.managementActiveTab.set('xray-contrato')"
            >
              <div>
                <small>05/11/2026</small>
                <strong>Contrato A</strong>
                <span>Visita MOKPAT · 42 min</span>
              </div>
              <img src="/assets/p13_img_7.png" alt="Contrato A" />
            </div>
            <div
              class="rec-tile"
              (click)="state.selectContract('CT-B'); state.managementActiveTab.set('xray-contrato')"
            >
              <div>
                <small>05/11/2026</small>
                <strong>Contrato B</strong>
                <span>Reparo CFTV 03 validado</span>
              </div>
              <img src="/assets/p13_img_9.png" alt="Contrato B" />
            </div>
            <div
              class="rec-tile"
              (click)="state.selectContract('CT-B'); state.managementActiveTab.set('xray-contrato')"
            >
              <div>
                <small>04/11/2026</small>
                <strong>Contrato B</strong>
                <span>Treinamento Controle de Acesso</span>
              </div>
              <img src="/assets/p13_img_6.png" alt="Treinamento" />
            </div>
            <div
              class="rec-tile"
              (click)="state.selectContract('CT-C'); state.managementActiveTab.set('xray-contrato')"
            >
              <div>
                <small>03/11/2026</small>
                <strong>Contrato C</strong>
                <span>Ação crítica perimetral</span>
              </div>
              <img src="/assets/p13_img_8.png" alt="Contrato C" />
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MÓDULO 2: ATENÇÃO HOJE & OCORRÊNCIAS (PAINEL DARK NAVY) -->
    @if (state.managementActiveTab() === 'atencao-ocorrencias') {
      <div class="navy-grid">
        <div class="navy-panel">
          <div class="navy-split-row">
            <div>
              <h2 class="navy-big-heading">Atenção<br /><span class="cyan">hoje</span></h2>
              <ul class="navy-list">
                <li>
                  <strong class="cyan">{{ state.portfolioSummary().total }}</strong> contratos no
                  total
                </li>
                <li>
                  <strong class="cyan">{{ state.portfolioSummary().emDia }}</strong> em dia
                </li>
                <li>
                  <strong class="purple">{{ state.portfolioSummary().atencao }}</strong> em atenção
                </li>
                <li>
                  <strong class="purple">{{ state.portfolioSummary().criticos }}</strong> críticos
                </li>
              </ul>
              <div class="navy-sep"></div>
              <ul class="navy-list">
                <li><strong class="purple">3</strong> ações críticas vencidas</li>
                <li><strong class="cyan">4</strong> decisões com a gestão</li>
              </ul>
            </div>

            <svg viewBox="0 0 200 200" width="210" height="210">
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#22d3ee"
                stroke-width="22"
                stroke-dasharray="316 452"
                stroke-dashoffset="0"
              />
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#c084fc"
                stroke-width="22"
                stroke-dasharray="90 452"
                stroke-dashoffset="-316"
              />
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke="#9333ea"
                stroke-width="22"
                stroke-dasharray="46 452"
                stroke-dashoffset="-406"
              />
              <text
                x="100"
                y="98"
                text-anchor="middle"
                fill="#ffffff"
                font-size="38"
                font-weight="800"
              >
                20
              </text>
              <text x="100" y="120" text-anchor="middle" fill="#cbd5e1" font-size="11">
                contratos no total
              </text>
            </svg>
          </div>
        </div>

        <div class="navy-panel">
          <h3>Ocorrências, equipamentos e prazos</h3>
          <div class="navy-counters-3">
            <div class="nc-tile">
              <strong class="cyan">28</strong>
              <span>ações abertas</span>
            </div>
            <div class="nc-tile">
              <strong class="purple">7</strong>
              <span>vencidas</span>
            </div>
            <div class="nc-tile">
              <strong class="purple">3</strong>
              <span>críticas entre as vencidas</span>
            </div>
          </div>

          <div class="navy-bar-block">
            <small>AÇÕES POR SITUAÇÃO</small>
            <div class="navy-segmented-bar">
              <div class="seg cyan-seg" style="flex: 21">
                <strong>21</strong>
                <span>no prazo</span>
              </div>
              <div class="seg purple-seg" style="flex: 4">
                <strong>4</strong>
                <span>vencidas não críticas</span>
              </div>
              <div class="seg deep-purple-seg" style="flex: 3">
                <strong>3</strong>
                <span>vencidas críticas</span>
              </div>
            </div>
          </div>

          <div class="navy-meta-row">
            <span>Tempo fora do ar: <strong class="cyan">2h 15min</strong> · </span>
            <span>Primeira resposta: <strong class="cyan">14 min</strong> · </span>
            <span>Solução validada: <strong class="cyan">16h30</strong></span>
          </div>
        </div>
      </div>
    }

    <!-- MÓDULO 3: X-RAY DO CONTRATO -->
    @if (state.managementActiveTab() === 'xray-contrato') {
      <div class="navy-xray">
        <div class="xray-top">
          <h2>X-Ray do contrato</h2>
          <div class="xray-controls">
            <div class="xray-input">
              <span>🔍</span>
              <select
                [ngModel]="state.selectedContractId()"
                (ngModelChange)="state.selectContract($event)"
              >
                @for (c of state.contracts(); track c.id) {
                  <option [value]="c.id">{{ c.name }} — {{ c.unit }}</option>
                }
              </select>
            </div>
            <div class="xray-input">De {{ xrayDateFrom }} 📅</div>
            <div class="xray-input">Até {{ xrayDateTo }} 📅</div>
            <div class="xray-input">
              <select [(ngModel)]="xrayActivityFilter">
                <option value="Todos">Tipo de atividade: Todos</option>
                <option value="visita-consultoria">Visitas de consultoria</option>
                <option value="visita-tecnica">Visita técnica</option>
                <option value="reuniao">Reunião</option>
                <option value="treinamento">Treinamento</option>
              </select>
            </div>
          </div>
        </div>

        <div class="xray-kpi-row">
          <div class="xray-kpi">
            <strong class="cyan">2</strong>
            <span>Visitas de consultoria</span>
          </div>
          <div class="xray-kpi">
            <strong class="purple">1</strong>
            <span>Visita técnica</span>
          </div>
          <div class="xray-kpi">
            <strong class="cyan">1</strong>
            <span>Reunião</span>
          </div>
          <div class="xray-kpi">
            <strong class="purple">1</strong>
            <span>Treinamento</span>
          </div>
        </div>

        <div class="xray-lower-grid">
          <div class="xray-box">
            <h4>Atividades por dia</h4>
            <div class="xray-bars">
              @for (b of xrayDailyBars; track b.date) {
                <div class="xb-col">
                  <span>{{ b.count }}</span>
                  <div
                    class="xb-fill"
                    [class.cyan]="b.color === 'cyan'"
                    [class.purple]="b.color === 'purple'"
                    [style.height.px]="b.count * 40"
                  ></div>
                  <small>{{ b.date }}</small>
                </div>
              }
            </div>
          </div>

          <div class="xray-box">
            <h4>Linha do tempo ({{ state.selectedContract().name }})</h4>
            <div class="xray-tl">
              @for (ev of filteredXrayTimeline(); track ev.id) {
                <div class="xtl-item">
                  <span class="xtl-dot"></span>
                  <span class="xtl-date">{{ ev.date }}</span>
                  <strong class="xtl-time">{{ ev.time }}</strong>
                  <span>{{ ev.title }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MÓDULO 4: BI DE VISITAS (42 MIN MEDIANA) & TREINAMENTOS/FV -->
    @if (state.managementActiveTab() === 'bi-visitas-treinamentos') {
      <div class="two-col-grid">
        <div class="card-panel">
          <h3>BI de Visitas e Cobertura de Campo</h3>
          <div class="bi-metrics-grid">
            <div class="bm-card">
              <small>Execução do plano</small>
              <strong class="red">24 de 30</strong>
              <span>visitas planejadas concluídas (80%)</span>
            </div>
            <div class="bm-card">
              <small>Cobertura da carteira</small>
              <strong class="red">16 de 20</strong>
              <span>contratos com visita no período (80%)</span>
            </div>
            <div class="bm-card">
              <small>Duração em campo</small>
              <strong class="red">42 min</strong>
              <span>Mediana entre entrada e saída (registros incompletos ficam fora)</span>
            </div>
            <div class="bm-card">
              <small>Frequência pactuada</small>
              <strong>Dias desde a última visita</strong>
              <span>Priorização automática dos contratos sem visita recente</span>
            </div>
          </div>
        </div>

        <div class="card-panel">
          <h3>BI de Treinamentos, Equipes e FV</h3>
          <div class="bi-metrics-grid">
            <div class="bm-card">
              <small>Turmas realizadas</small>
              <strong class="red">8 de 10</strong>
              <span>do plano mensal (80%)</span>
            </div>
            <div class="bm-card">
              <small>Presença nas convocações</small>
              <strong class="red">72 de 80</strong>
              <span>participantes presentes (90%)</span>
            </div>
            <div class="bm-card">
              <small>Reposições pendentes</small>
              <strong class="red">8</strong>
              <span>por ausência em acompanhamento</span>
            </div>
            <div class="bm-card">
              <small>FV (Previsto · Usado · Saldo)</small>
              <strong>100h · 85h · 15h</strong>
              <span>Controle consolidado e integrado à base EZIG</span>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MÓDULO 5: DECISÕES, ALÇADAS, SLA E RELATOS RESTRITOS -->
    @if (state.managementActiveTab() === 'decisoes-relatos') {
      <div class="two-col-grid">
        <div class="card-panel">
          <h3>Decisões Pendentes e Aprovação de Multas de SLA</h3>
          <p><strong>9 decisões pendentes:</strong> 5 com clientes e 4 com a Alta Gestão.</p>

          <div class="sla-cards-grid mt-12">
            @for (s of state.thirdPartySLAs(); track s.id) {
              @if (s.delayMinutes > 0) {
                <div class="sla-item-card">
                  <div class="sic-head">
                    <strong>{{ s.contractId }} · {{ s.serviceType }}</strong>
                    <span class="badge-amber">Atraso de {{ s.delayMinutes }} min</span>
                  </div>
                  <p>{{ s.reason }}</p>
                  <div class="sic-footer">
                    <strong>Multa: R$ {{ s.fineAmount }},00 ({{ s.fineStatus }})</strong>
                    @if (s.fineStatus !== 'publicada-cliente') {
                      <button
                        type="button"
                        class="btn-primary"
                        (click)="state.approveAndPublishSlaFine(s.id)"
                      >
                        Aprovar e Publicar no Contrato
                      </button>
                    } @else {
                      <span class="badge-green">✓ Publicada ao Cliente</span>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <div class="card-panel">
          <h3>Relatos de Clientes e Canal Restrito de Colaboradores</h3>
          <div class="bi-metrics-grid">
            <div class="bm-card">
              <small>Relatos de Clientes</small>
              <strong>2 abertos</strong>
              <span>Tempo médio de 1ª resposta: 18 min</span>
            </div>
            <div class="bm-card">
              <small>Relatos Internos de Colaboradores</small>
              <strong class="red">Acesso Restrito</strong>
              <span>Visível exclusivamente para a Alta Gestão</span>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- MÓDULO 6: TRILHA DE AUDITORIA -->
    @if (state.managementActiveTab() === 'auditoria') {
      <div class="card-panel">
        <h3>Trilha de Auditoria e Segurança da Operação</h3>
        <p>Histórico imutável de quem criou, alterou, validou ou publicou cada registro no Olam.</p>

        <table class="data-table mt-12">
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Contrato</th>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Ação</th>
              <th>Registro</th>
              <th>Detalhamento</th>
            </tr>
          </thead>
          <tbody>
            @for (log of state.auditLogs(); track log.id) {
              <tr>
                <td>{{ log.timestamp }}</td>
                <td><strong>{{ log.contractId }}</strong></td>
                <td>{{ log.actor }}</td>
                <td>{{ log.actorRole }}</td>
                <td><span class="tag-code">{{ log.action }}</span></td>
                <td>{{ log.entityType }} ({{ log.entityId }})</td>
                <td>{{ log.details }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- MÓDULO 7: PAINEL SALA DE SITUAÇÃO (MODO TV) -->
    @if (state.managementActiveTab() === 'modo-tv') {
      <div class="tv-dashboard-screen">
        <div class="tv-top">
          <div>
            <span class="tv-tag">GRUPO MOKED · SALA DE SITUAÇÃO</span>
            <h1>Operação da semana</h1>
          </div>
          <button
            type="button"
            class="btn-outline-light"
            (click)="state.managementActiveTab.set('visao-executiva')"
          >
            Sair do Modo TV
          </button>
        </div>

        <div class="tv-big-kpis">
          <div class="tv-kpi">
            <strong>24</strong>
            <span>Visitas</span>
          </div>
          <div class="tv-kpi">
            <strong>16/20</strong>
            <span>Contratos visitados</span>
          </div>
          <div class="tv-kpi">
            <strong>5</strong>
            <span>Ações vencidas</span>
          </div>
        </div>

        <h3>Visitas por gestor</h3>
        <div class="tv-bars">
          @for (m of managerStats; track m.name) {
            <div class="tv-bar-row">
              <span class="tv-mgr">{{ m.name.replace('Gestor ', '') }}</span>
              <div class="tv-track">
                <div class="tv-fill" [style.width.%]="m.completed * 10"></div>
              </div>
              <strong>{{ m.completed }}</strong>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class AltaGestaoBiComponent implements OnInit {
  readonly state = inject(OlamStateService);

  xrayDateFrom = '02/11';
  xrayDateTo = '05/11';
  xrayActivityFilter = 'Todos';
  readonly drilldownModalType = signal<
    'visitas' | 'cobertura' | 'treinamentos' | 'vencidas' | null
  >(null);

  readonly managerStats = [
    { name: 'Gestor A', division: 'MOKPAT', completed: 8, planned: 10 },
    { name: 'Gestor B', division: 'MOKPAT / MOKIMP', completed: 6, planned: 8 },
    { name: 'Gestor C', division: 'MOKVIP / MOKLOG', completed: 5, planned: 6 },
    { name: 'Gestor D', division: 'MOKTEC / MOKRES', completed: 5, planned: 6 },
  ];

  readonly xrayDailyBars = [
    { date: '02/11', count: 1, color: 'cyan' },
    { date: '03/11', count: 2, color: 'purple' },
    { date: '04/11', count: 1, color: 'cyan' },
    { date: '05/11', count: 4, color: 'purple' },
  ];

  readonly filteredXrayTimeline = computed(() => {
    const type = this.xrayActivityFilter;
    return this.state.allContractTimeline().filter((ev) => {
      if (type === 'Todos') return true;
      return ev.category === type;
    });
  });

  readonly heatmapRows = computed(() => {
    const areas: DivisionCode[] = [
      'MOKPAT',
      'MOKVIP',
      'MOKIMP',
      'MOKLOG',
      'MOKRES',
      'MOKTEC',
      'P950',
      'Treinamento',
    ];
    return areas.map((area) => {
      if (area === 'MOKPAT') return { area, a: 2, b: 0, c: 1 };
      if (area === 'MOKVIP') return { area, a: 0, b: 1, c: 0 };
      if (area === 'MOKIMP') return { area, a: 0, b: 0, c: 1 };
      return { area, a: 0, b: 0, c: 0 };
    });
  });

  ngOnInit(): void {
    this.state.activeRole.set('alta-gestao');
  }
}

