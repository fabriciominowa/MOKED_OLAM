import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HealthStatus } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { Moked3dCanvasComponent } from '../../shared/components/moked-3d-canvas.component';

@Component({
  selector: 'app-cliente-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, Moked3dCanvasComponent],
  template: `
    <div class="client-app-shell">
      <!-- BARRA DE DEMONSTRAÇÃO DE ESCOPO RESTRITO (CLIENTES A, B e C) -->
      <div class="client-access-banner">
        <div class="cab-info">
          <span class="cab-badge">🔒 ÁREA EXCLUSIVA DO CLIENTE</span>
          <div>
            <strong>
              {{ currentClientMeta().fullName }} ({{ state.selectedContract().name }})
            </strong>
            <small>
              Este perfil visualiza apenas o seu próprio contrato ({{
                state.selectedContract().name
              }}) e não possui acesso às demais áreas internas.
            </small>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- ABA 1: INÍCIO (Saúde do Contrato Interativa RH/RT/RA +            -->
      <!-- Meu Contrato com os 3 Velocímetros Semicirculares)                -->
      <!-- ================================================================= -->
      @if (state.clientActiveTab() === 'inicio') {
        <section class="client-screen-container">
          <!-- TERMÔMETRO INTERATIVO DE SAÚDE DO CONTRATO (RH, RT, RA) -->
          <div class="health-hero-dark">
            <app-moked-3d-canvas
              mode="hero"
              [status]="activeGaugeStatus()"
              class="hero-3d-backdrop"
            />
            <div class="hh-left">
              <div class="hh-eyebrow-row">
                <span class="contract-eyebrow">
                  {{ state.selectedContract().name }} · {{ state.selectedContract().unit }}
                </span>
                @if (selectedHealthPillar() !== 'GERAL') {
                  <button
                    type="button"
                    class="reset-pillar-btn"
                    (click)="selectedHealthPillar.set('GERAL')"
                  >
                    ↺ Voltar para Saúde Geral
                  </button>
                }
              </div>
              <h1>Saúde do Contrato</h1>

              <!-- GRÁFICO DINÂMICO QUE RESPONDE À SELEÇÃO DE RH, RT, RA OU GERAL -->
              <div class="gauge-row">
                <svg viewBox="0 0 220 130" class="gauge-svg">
                  <path
                    d="M 20 110 A 90 90 0 0 1 75 27"
                    fill="none"
                    stroke="#4ade80"
                    stroke-width="22"
                  />
                  <path
                    d="M 77 26 A 90 90 0 0 1 143 26"
                    fill="none"
                    stroke="#f59e0b"
                    stroke-width="22"
                  />
                  <path
                    d="M 145 27 A 90 90 0 0 1 200 110"
                    fill="none"
                    stroke="#dc2626"
                    stroke-width="22"
                  />
                  <g
                    class="gauge-needle-group"
                    [attr.transform]="
                      'translate(110, 108) rotate(' +
                      gaugeNeedleRotation(activeGaugeStatus()) +
                      ')'
                    "
                  >
                    <polygon points="-5,0 0,-78 5,0" fill="#ffffff" />
                    <circle cx="0" cy="0" r="8" fill="#ffffff" />
                  </g>
                </svg>

                <div class="gauge-status-readout">
                  <span class="readout-label">{{ activeGaugeTitle() }}</span>
                  <strong [attr.data-status]="activeGaugeStatus()">
                    {{ statusLabel(activeGaugeStatus()) | uppercase }}
                  </strong>
                  <p class="readout-summary">{{ activeGaugeSummary() }}</p>
                </div>
              </div>

              @if (state.selectedContract().health.alertBanner) {
                <div
                  class="active-incident-banner"
                  (click)="selectHealthPillar('RT')"
                >
                  <span class="incident-icon">📹</span>
                  <div>
                    <strong>{{ state.selectedContract().health.alertBanner }}</strong>
                    <p>{{ state.selectedContract().health.rtSummary }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- OS 3 PILARES SELECIONÁVEIS (RH, RT, RA) -->
            <div class="hh-pillars-grid">
              <div
                class="pillar-card-dark"
                [class.selected]="selectedHealthPillar() === 'RH'"
                (click)="selectHealthPillar('RH')"
              >
                <div class="pc-head">
                  <span class="pc-code">RH</span>
                  <strong [attr.data-status]="state.selectedContract().health.rh">
                    {{ statusLabel(state.selectedContract().health.rh) | uppercase }}
                  </strong>
                </div>
                <h4>Equipe e Treinamentos</h4>
                <p>{{ state.selectedContract().health.rhSummary }}</p>
                <span class="pc-link">
                  {{
                    selectedHealthPillar() === 'RH'
                      ? '● Exibindo no gráfico ao lado'
                      : 'Clique para exibir no gráfico →'
                  }}
                </span>
              </div>

              <div
                class="pillar-card-dark"
                [class.selected]="selectedHealthPillar() === 'RT'"
                (click)="selectHealthPillar('RT')"
              >
                <div class="pc-head">
                  <span class="pc-code">RT</span>
                  <strong [attr.data-status]="state.selectedContract().health.rt">
                    {{ statusLabel(state.selectedContract().health.rt) | uppercase }}
                  </strong>
                </div>
                <h4>Equipamentos e Tecnologia</h4>
                <p>{{ state.selectedContract().health.rtSummary }}</p>
                <span class="pc-link">
                  {{
                    selectedHealthPillar() === 'RT'
                      ? '● Exibindo no gráfico ao lado'
                      : 'Clique para exibir no gráfico →'
                  }}
                </span>
              </div>

              <div
                class="pillar-card-dark"
                [class.selected]="selectedHealthPillar() === 'RA'"
                (click)="selectHealthPillar('RA')"
              >
                <div class="pc-head">
                  <span class="pc-code">RA</span>
                  <strong [attr.data-status]="state.selectedContract().health.ra">
                    {{ statusLabel(state.selectedContract().health.ra) | uppercase }}
                  </strong>
                </div>
                <h4>Pagamentos e Administração</h4>
                <p>{{ state.selectedContract().health.raSummary }}</p>
                <span class="pc-link">
                  {{
                    selectedHealthPillar() === 'RA'
                      ? '● Exibindo no gráfico ao lado'
                      : 'Clique para exibir no gráfico →'
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="screen-title-row mt-12">
            <h1>Meu contrato</h1>
            <span class="contract-chip-red">
              {{ state.selectedContract().name }} · {{ state.selectedContract().unit }}
            </span>
          </div>

          <div class="gauges-cards-stack">
            <!-- CARD 1: PLANO DE MELHORIAS -->
            <div
              class="semi-gauge-card"
              (click)="openIndicatorDetail.set('melhorias')"
            >
              <h3>Plano de melhorias</h3>
              <div class="sgc-body">
                <div class="sgc-dial">
                  <svg viewBox="0 0 220 130" class="semi-gauge-svg">
                    <path
                      d="M 24 108 A 86 86 0 0 1 48 48"
                      fill="none"
                      stroke="#ef4444"
                      stroke-width="20"
                      stroke-linecap="butt"
                    />
                    <path
                      d="M 50 46 A 86 86 0 0 1 110 22"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="20"
                      stroke-linecap="butt"
                    />
                    <path
                      d="M 110 22 A 86 86 0 0 1 172 48"
                      fill="none"
                      stroke="#43a047"
                      stroke-width="20"
                      stroke-linecap="butt"
                    />
                    <path
                      d="M 174 50 A 86 86 0 0 1 196 108"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="20"
                      stroke-linecap="butt"
                    />
                    <g
                      class="gauge-needle-group"
                      [attr.transform]="
                        'translate(110, 92) rotate(' +
                        percentToAngle(state.selectedContract().gauges.improvementPlan) +
                        ')'
                      "
                    >
                      <polygon points="-5,0 0,-66 5,0" fill="#111827" />
                      <circle cx="0" cy="0" r="6" fill="#111827" />
                    </g>
                  </svg>
                  <strong class="sgc-percent">
                    {{ state.selectedContract().gauges.improvementPlan }}%
                  </strong>
                </div>

                <div class="sgc-status">
                  @if (state.selectedContract().gauges.improvementPlan < 75) {
                    <span class="pill-atencao">
                      <span class="ico-warn">▲</span> Atenção
                    </span>
                  } @else {
                    <span class="pill-em-dia">
                      <span class="ico-ok">✓</span> Em dia
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- CARD 2: VISITAS PREVISTAS -->
            <div
              class="semi-gauge-card"
              (click)="openIndicatorDetail.set('visitas')"
            >
              <h3>Visitas previstas</h3>
              <div class="sgc-body">
                <div class="sgc-dial">
                  <svg viewBox="0 0 220 130" class="semi-gauge-svg">
                    <path
                      d="M 24 108 A 86 86 0 0 1 48 48"
                      fill="none"
                      stroke="#ef4444"
                      stroke-width="20"
                    />
                    <path
                      d="M 50 46 A 86 86 0 0 1 110 22"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="20"
                    />
                    <path
                      d="M 110 22 A 86 86 0 0 1 178 56"
                      fill="none"
                      stroke="#43a047"
                      stroke-width="20"
                    />
                    <path
                      d="M 180 58 A 86 86 0 0 1 196 108"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="20"
                    />
                    <g
                      class="gauge-needle-group"
                      [attr.transform]="
                        'translate(110, 92) rotate(' +
                        percentToAngle(state.selectedContract().gauges.plannedVisits) +
                        ')'
                      "
                    >
                      <polygon points="-5,0 0,-66 5,0" fill="#111827" />
                      <circle cx="0" cy="0" r="6" fill="#111827" />
                    </g>
                  </svg>
                  <strong class="sgc-percent">
                    {{ state.selectedContract().gauges.plannedVisits }}%
                  </strong>
                </div>

                <div class="sgc-status">
                  @if (state.selectedContract().gauges.plannedVisits < 75) {
                    <span class="pill-atencao">
                      <span class="ico-warn">▲</span> Atenção
                    </span>
                  } @else {
                    <span class="pill-em-dia">
                      <span class="ico-ok">✓</span> Em dia
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- CARD 3: EQUIPE TREINADA -->
            <div
              class="semi-gauge-card"
              (click)="openIndicatorDetail.set('treinamento')"
            >
              <h3>Equipe treinada</h3>
              <div class="sgc-body">
                <div class="sgc-dial">
                  <svg viewBox="0 0 220 130" class="semi-gauge-svg">
                    <path
                      d="M 24 108 A 86 86 0 0 1 48 48"
                      fill="none"
                      stroke="#ef4444"
                      stroke-width="20"
                    />
                    <path
                      d="M 50 46 A 86 86 0 0 1 110 22"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="20"
                    />
                    <path
                      d="M 110 22 A 86 86 0 0 1 190 82"
                      fill="none"
                      stroke="#43a047"
                      stroke-width="20"
                    />
                    <path
                      d="M 191 84 A 86 86 0 0 1 196 108"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="20"
                    />
                    <g
                      class="gauge-needle-group"
                      [attr.transform]="
                        'translate(110, 92) rotate(' +
                        percentToAngle(state.selectedContract().gauges.trainedTeam) +
                        ')'
                      "
                    >
                      <polygon points="-5,0 0,-66 5,0" fill="#111827" />
                      <circle cx="0" cy="0" r="6" fill="#111827" />
                    </g>
                  </svg>
                  <strong class="sgc-percent">
                    {{ state.selectedContract().gauges.trainedTeam }}%
                  </strong>
                </div>

                <div class="sgc-status">
                  @if (state.selectedContract().gauges.trainedTeam < 75) {
                    <span class="pill-atencao">
                      <span class="ico-warn">▲</span> Atenção
                    </span>
                  } @else {
                    <span class="pill-em-dia">
                      <span class="ico-ok">✓</span> Em dia
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- DETALHE DO INDICADOR AO CLICAR EM UM DOS VELOCÍMETROS -->
          @if (openIndicatorDetail()) {
            <div class="card-panel mt-16">
              <div class="panel-top">
                <h3>
                  Detalhe do indicador ·
                  {{
                    openIndicatorDetail() === 'melhorias'
                      ? 'Plano de melhorias'
                      : openIndicatorDetail() === 'visitas'
                      ? 'Visitas previstas'
                      : 'Equipe treinada'
                  }}
                </h3>
                <button
                  type="button"
                  class="btn-ghost"
                  (click)="openIndicatorDetail.set(null)"
                >
                  Fechar ✕
                </button>
              </div>
              <div class="kpi-list-vertical">
                <div class="klv-row">
                  <span>Critério e período</span>
                  <strong>Ciclo mensal vigente ({{ state.selectedContract().name }})</strong>
                </div>
                <div class="klv-row">
                  <span>Causa do status atual</span>
                  <strong>{{ state.selectedContract().health.rtSummary }}</strong>
                </div>
                <div class="klv-row">
                  <span>Consultor responsável</span>
                  <strong>{{ state.selectedContract().consultant }}</strong>
                </div>
              </div>
            </div>
          }
        </section>
      }

      <!-- ================================================================= -->
      <!-- ABA 2: MEU CONTRATO (Painel do contrato + Equipe do contrato +    -->
      <!-- Atenção ao contrato + Rotatividade com bonecos)                   -->
      <!-- ================================================================= -->
      @if (state.clientActiveTab() === 'meu-contrato') {
        <section class="client-screen-container">
          <!-- PAINEL DO CONTRATO + CARD DINÂMICO PARA OS 4 BOTÕES -->
          <div
            class="contract-panels-duo"
            [class.single-col]="!contractPanelSelection()"
          >
            <!-- CARD ESQUERDO: PAINEL DO CONTRATO (OS 4 BOTÕES) -->
            <div class="contract-white-screen-card">
              <h2 class="cwsc-title">Painel do contrato</h2>

              <div class="cwsc-items-stack">
                <button
                  type="button"
                  class="cwsc-item-box"
                  [class.selected]="contractPanelSelection() === 'seguranca'"
                  (click)="selectContractPanelItem('seguranca')"
                >
                  <strong>Situação da segurança</strong>
                  <span>Indicadores do contrato</span>
                </button>

                <button
                  type="button"
                  class="cwsc-item-box"
                  [class.selected]="contractPanelSelection() === 'orcamento'"
                  (click)="selectContractPanelItem('orcamento')"
                >
                  <strong>Orçamento pendente</strong>
                  <span>Reforço da equipe em aprovação</span>
                </button>

                <button
                  type="button"
                  class="cwsc-item-box"
                  [class.selected]="contractPanelSelection() === 'equipe'"
                  (click)="selectContractPanelItem('equipe')"
                >
                  <strong>Equipe</strong>
                  <span>Substituições e rotatividade</span>
                </button>

                <button
                  type="button"
                  class="cwsc-item-box"
                  [class.selected]="contractPanelSelection() === 'treinamentos'"
                  (click)="selectContractPanelItem('treinamentos')"
                >
                  <strong>Treinamentos</strong>
                  <span>Histórico e evidências</span>
                </button>
              </div>
            </div>

            <!-- 1. ABRE QUANDO SELECIONA "SITUAÇÃO DA SEGURANÇA" -->
            @if (contractPanelSelection() === 'seguranca') {
              <div class="contract-white-screen-card">
                <span class="cwsc-eyebrow-red">MOKED</span>
                <h2 class="cwsc-title">Situação da segurança</h2>

                <div class="cwsc-items-stack">
                  <div class="cwsc-item-box static">
                    <strong>Plano de melhorias</strong>
                    <span>
                      {{ state.selectedContract().gauges.improvementPlan }}% concluído ·
                      {{
                        state.selectedContract().gauges.improvementPlan < 75
                          ? 'Atenção'
                          : 'Em dia'
                      }}
                    </span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Visitas previstas</strong>
                    <span>
                      {{ state.selectedContract().gauges.plannedVisits }}% realizadas ({{
                        state.selectedContract().completedVisitsMonth
                      }}
                      de {{ state.selectedContract().plannedVisitsMonth }} no mês) · Em dia
                    </span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Equipe treinada</strong>
                    <span>
                      {{ state.selectedContract().gauges.trainedTeam }}% da equipe capacitada ·
                      Em dia
                    </span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Pilares RH · RT · RA</strong>
                    <span>
                      RH: {{ statusLabel(state.selectedContract().health.rh) }} · RT:
                      {{ statusLabel(state.selectedContract().health.rt) }} · RA:
                      {{ statusLabel(state.selectedContract().health.ra) }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <!-- 2. ABRE QUANDO SELECIONA "ORÇAMENTO PENDENTE" -->
            @if (contractPanelSelection() === 'orcamento') {
              <div class="contract-white-screen-card">
                <span class="cwsc-eyebrow-red">MOKED</span>
                <h2 class="cwsc-title">Orçamento pendente</h2>

                @for (budget of contractBudgets(); track budget.id) {
                  <div class="cwsc-items-stack">
                    <div class="cwsc-item-box static">
                      <strong>{{ budget.title }}</strong>
                      <span>
                        {{
                          budget.status === 'em-aprovacao-cliente'
                            ? 'Em aprovação — aguarda decisão do cliente'
                            : budget.status === 'aprovado'
                            ? 'Aprovado pelo cliente'
                            : 'Recusado pelo cliente'
                        }}
                      </span>
                    </div>

                    <div class="cwsc-item-box static">
                      <strong>Valor mensal adicional</strong>
                      <span>R$ {{ budget.monthlyValue.toLocaleString('pt-BR') }} / mês</span>
                    </div>

                    <div class="cwsc-item-box static">
                      <strong>Justificativa</strong>
                      <span>{{ budget.justification }}</span>
                    </div>

                    <div class="cwsc-item-box static">
                      <strong>Impacto operacional</strong>
                      <span>{{ budget.impact }}</span>
                    </div>

                    <div class="peb-buttons mt-12">
                      <button
                        type="button"
                        class="btn-primary"
                        (click)="decideBudget(budget.id, 'aprovado')"
                      >
                        ✓ Aprovar
                      </button>
                      <button
                        type="button"
                        class="btn-secondary"
                        (click)="decideBudget(budget.id, 'recusado')"
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- 3. ABRE QUANDO SELECIONA "EQUIPE" -->
            @if (contractPanelSelection() === 'equipe') {
              <div class="contract-white-screen-card">
                <span class="cwsc-eyebrow-red">MOKED</span>
                <h2 class="cwsc-title">Equipe do contrato</h2>

                <div class="cwsc-items-stack">
                  <div class="cwsc-item-box static">
                    <strong>Substituições no mês</strong>
                    <span>{{ state.selectedContract().teamMetrics.replacementsMonth }} no exemplo</span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Turnover</strong>
                    <span>
                      {{ state.selectedContract().teamMetrics.dismissalsMonth }} desligamentos ÷
                      {{ state.selectedContract().teamMetrics.avgHeadcount }} de efetivo médio =
                      {{ state.selectedContract().teamMetrics.turnoverPercent }}%
                    </span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Treinamentos realizados</strong>
                    <span>{{ state.selectedContract().teamMetrics.trainingsCompleted }} no exemplo</span>
                  </div>

                  <div class="cwsc-item-box static">
                    <strong>Participações registradas</strong>
                    <span>{{ state.selectedContract().teamMetrics.participationsRecorded }} no exemplo</span>
                  </div>
                </div>
              </div>
            }

            <!-- 4. ABRE QUANDO SELECIONA "TREINAMENTOS" -->
            @if (contractPanelSelection() === 'treinamentos') {
              <div class="contract-white-screen-card">
                <span class="cwsc-eyebrow-red">MOKED</span>
                <h2 class="cwsc-title">Treinamentos do contrato</h2>

                @for (trn of contractTrainings(); track trn.id) {
                  <div class="cwsc-items-stack">
                    <div class="cwsc-item-box static">
                      <strong>Tema: {{ trn.title }}</strong>
                      <span>Realizado em {{ trn.date }} · Instrutor: {{ trn.instructor }}</span>
                    </div>

                    <div class="cwsc-item-box static">
                      <strong>Participantes</strong>
                      <span>
                        {{ trn.participants.length }} colaboradores treinados ({{
                          state.selectedContract().teamMetrics.participationsRecorded
                        }}
                        participações registradas no mês)
                      </span>
                    </div>

                    <div class="cwsc-item-box static">
                      <strong>Conteúdo aplicado</strong>
                      <span>{{ trn.content }}</span>
                    </div>

                    <div class="ctc-actions-row mt-12">
                      <button
                        type="button"
                        class="btn-ver-fotos-red"
                        (click)="setTab('treinamentos'); activeTrainingPhotosId.set(trn.id)"
                      >
                        <span class="btn-ico">🖼️</span>
                        <span>Ver fotos</span>
                      </button>

                      <button
                        type="button"
                        class="btn-ver-relatorio-white"
                        (click)="setTab('treinamentos'); activeTrainingReportId.set(trn.id)"
                      >
                        <span class="btn-ico">📄</span>
                        <span>Ver relatório</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <div class="screen-title-row mt-12">
            <h1>Atenção ao contrato</h1>
            <span class="contract-chip-red">{{ state.selectedContract().name }}</span>
          </div>

          <!-- CARD 1: AVISO DE PROPOSTA PENDENTE -->
          @for (budget of contractBudgets(); track budget.id) {
            <div class="proposal-alert-card">
              <div class="pac-top-pill">
                <span class="pac-excl">!</span>
                <span>Atenção</span>
              </div>

              <div class="pac-main-row">
                <!-- Ícone de 3 pessoas em vermelho + sinal de "+" -->
                <div class="pac-people-plus-icon">
                  <svg viewBox="0 0 84 68" width="76" height="62">
                    <circle cx="18" cy="22" r="7" fill="#c4161c" />
                    <path d="M6,44 C6,34 30,34 30,44 L30,48 L6,48 Z" fill="#c4161c" />
                    <circle cx="52" cy="20" r="7" fill="#c4161c" />
                    <path d="M40,42 C40,32 64,32 64,42 L64,46 L40,46 Z" fill="#c4161c" />
                    <circle cx="35" cy="15" r="8.5" fill="#c4161c" />
                    <path d="M19,46 C19,33 51,33 51,46 L51,52 L19,52 Z" fill="#c4161c" />
                    <circle cx="58" cy="48" r="13" fill="#c4161c" stroke="#fff1f2" stroke-width="3" />
                    <line x1="58" y1="42" x2="58" y2="54" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
                    <line x1="52" y1="48" x2="64" y2="48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
                  </svg>
                </div>

                <div class="pac-text-col">
                  <h3>{{ budget.title }}</h3>
                  <p class="pac-sub">
                    {{
                      budget.status === 'em-aprovacao-cliente'
                        ? 'Aguarda sua aprovação.'
                        : budget.status === 'aprovado'
                        ? 'Proposta aprovada pelo cliente.'
                        : 'Proposta recusada pelo cliente.'
                    }}
                  </p>
                  <div class="pac-price">
                    R$ {{ budget.monthlyValue.toLocaleString('pt-BR') }}<small>/mês</small>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="pac-action-btn"
                (click)="toggleProposalDetail(budget.id)"
              >
                <span>Ver proposta</span>
                <span class="chevron">›</span>
              </button>

              <!-- PAINEL EXPANDIDO AO CLICAR EM "VER PROPOSTA" -->
              @if (expandedBudgetId() === budget.id) {
                <div class="proposal-expanded-box">
                  <div class="peb-row">
                    <span>Status</span>
                    <strong class="amber-txt">
                      {{
                        budget.status === 'em-aprovacao-cliente'
                          ? 'Em aprovação'
                          : (budget.status | uppercase)
                      }}
                    </strong>
                  </div>
                  <div class="peb-row">
                    <span>Valor mensal adicional</span>
                    <strong>R$ {{ budget.monthlyValue.toLocaleString('pt-BR') }}</strong>
                  </div>

                  <div class="peb-just">
                    <strong>Justificativa</strong>
                    <p>{{ budget.justification }}</p>
                    <p class="mt-12"><strong>Impacto:</strong> {{ budget.impact }}</p>
                  </div>

                  <div class="field-group mt-12">
                    <label>Comentar para o consultor:</label>
                    <textarea
                      rows="2"
                      [(ngModel)]="clientBudgetComment"
                      placeholder="Escreva sua observação..."
                    ></textarea>
                  </div>

                  <div class="peb-buttons">
                    <button
                      type="button"
                      class="btn-primary"
                      (click)="decideBudget(budget.id, 'aprovado')"
                    >
                      ✓ Aprovar
                    </button>
                    <button
                      type="button"
                      class="btn-secondary"
                      (click)="decideBudget(budget.id, 'recusado')"
                    >
                      ✕ Recusar
                    </button>
                    <button
                      type="button"
                      class="btn-secondary"
                      (click)="commentOnBudget(budget.id)"
                    >
                      💬 Comentar
                    </button>
                  </div>

                  <div class="bdc-history mt-12">
                    <strong>Histórico da proposta:</strong>
                    <ul>
                      @for (h of budget.history; track h.step) {
                        <li>{{ h.date }} — {{ h.step }} ({{ h.actor }})</li>
                      }
                    </ul>
                  </div>
                </div>
              }
            </div>
          }

          <!-- CARD 2: ROTATIVIDADE COM BONECOS (SAÍDAS E EFETIVO MÉDIO) -->
          <div class="turnover-white-card">
            <div class="twc-header">
              <span class="twc-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#18181b" stroke-width="2">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                </svg>
              </span>
              <h3>Rotatividade</h3>
            </div>

            <div class="twc-stats-row">
              <div class="twc-left">
                <strong class="twc-big-pct">
                  {{ state.selectedContract().teamMetrics.turnoverPercent }}%
                </strong>
                <span class="twc-caption">
                  {{ state.selectedContract().teamMetrics.dismissalsMonth }} saídas / efetivo médio
                  {{ state.selectedContract().teamMetrics.avgHeadcount }}
                </span>
              </div>

              <!-- FILEIRA DE BONECOS (SILHUETAS) DESTACANDO AS SAÍDAS EM VERMELHO -->
              <div class="twc-figures" aria-label="Representação visual de saídas sobre o efetivo">
                @for (isExit of turnoverFigures(); track $index) {
                  <svg
                    viewBox="0 0 24 48"
                    class="person-figure-svg"
                    [class.exit-red]="isExit"
                  >
                    <circle cx="12" cy="8" r="5.5" />
                    <path
                      d="M6,16 C3.5,16 2,18 2,21 L2,30 C2,31.5 3.2,32.5 4.5,32.5 L6,32.5 L6,45 C6,46.2 7,47 8.2,47 L10.5,47 C11.5,47 12,46.2 12,45 L12,33 L12,45 C12,46.2 12.5,47 13.5,47 L15.8,47 C17,47 18,46.2 18,45 L18,32.5 L19.5,32.5 C20.8,32.5 22,31.5 22,30 L22,21 C22,18 20.5,16 18,16 Z"
                    />
                  </svg>
                }
              </div>
            </div>

            <button
              type="button"
              class="twc-history-btn"
              (click)="showTurnoverHistory.set(!showTurnoverHistory())"
            >
              <span>Ver histórico</span>
              <span class="chevron">›</span>
            </button>

            @if (showTurnoverHistory()) {
              <div class="moked-equipe-sheet mt-12">
                <div class="mes-header">
                  <span class="mes-brand">MOKED</span>
                  <span class="mes-title">Cliente / Equipe</span>
                </div>
                <div class="mes-body">
                  <div class="mes-row">
                    <span class="mes-label">Substituições no mês</span>
                    <strong class="mes-value">
                      {{ state.selectedContract().teamMetrics.replacementsMonth }}
                    </strong>
                  </div>
                  <div class="mes-row">
                    <span class="mes-label">Treinamentos realizados</span>
                    <strong class="mes-value">
                      {{ state.selectedContract().teamMetrics.trainingsCompleted }}
                    </strong>
                  </div>
                  <div class="mes-row">
                    <span class="mes-label">Participações registradas</span>
                    <strong class="mes-value">
                      {{ state.selectedContract().teamMetrics.participationsRecorded }}
                    </strong>
                  </div>

                  <div class="mes-formula">
                    <div>Turnover: desligamentos ÷ efetivo médio</div>
                    <div>
                      Exemplo: {{ state.selectedContract().teamMetrics.dismissalsMonth }} ÷
                      {{ state.selectedContract().teamMetrics.avgHeadcount }} =
                      {{ state.selectedContract().teamMetrics.turnoverPercent }}% no mês
                    </div>
                  </div>

                  <p class="mes-footnote">Substituições e turnover têm definições distintas.</p>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- ================================================================= -->
      <!-- ABA 3: TREINAMENTOS (Quadro MOKED Cliente / Equipe + Cards com    -->
      <!-- Tema, Participantes, Ver fotos em vermelho e Ver relatório branco)-->
      <!-- ================================================================= -->
      @if (state.clientActiveTab() === 'treinamentos') {
        <section class="client-screen-container">
          <div class="screen-title-row">
            <h1>Treinamentos</h1>
            <span class="contract-chip-red">{{ state.selectedContract().name }}</span>
          </div>

          <!-- QUADRO MOKED CLIENTE / EQUIPE (EXATAMENTE COMO NA APRESENTAÇÃO) -->
          <div class="moked-equipe-sheet">
            <div class="mes-header">
              <span class="mes-brand">MOKED</span>
              <span class="mes-title">Cliente / Equipe</span>
            </div>
            <div class="mes-body">
              <div class="mes-row">
                <span class="mes-label">Substituições no mês</span>
                <strong class="mes-value">
                  {{ state.selectedContract().teamMetrics.replacementsMonth }}
                </strong>
              </div>
              <div class="mes-row">
                <span class="mes-label">Treinamentos realizados</span>
                <strong class="mes-value">
                  {{ state.selectedContract().teamMetrics.trainingsCompleted }}
                </strong>
              </div>
              <div class="mes-row">
                <span class="mes-label">Participações registradas</span>
                <strong class="mes-value">
                  {{ state.selectedContract().teamMetrics.participationsRecorded }}
                </strong>
              </div>

              <div class="mes-formula">
                <div>Turnover: desligamentos ÷ efetivo médio</div>
                <div>
                  Exemplo: {{ state.selectedContract().teamMetrics.dismissalsMonth }} ÷
                  {{ state.selectedContract().teamMetrics.avgHeadcount }} =
                  {{ state.selectedContract().teamMetrics.turnoverPercent }}% no mês
                </div>
              </div>

              <p class="mes-footnote">Substituições e turnover têm definições distintas.</p>
            </div>
          </div>

          <div class="client-trainings-list">
            @for (trn of contractTrainings(); track trn.id) {
              <article class="client-training-card">
                <div class="ctc-photo-wrap">
                  <img [src]="trn.photoUrl" [alt]="trn.title" class="ctc-hero-img" />
                </div>

                <div class="ctc-body">
                  <div class="ctc-info-row">
                    <!-- Ícone de crachá/credencial igual à imagem -->
                    <div class="ctc-badge-icon">
                      <svg viewBox="0 0 36 40" width="34" height="38" fill="none" stroke="#18181b" stroke-width="2">
                        <rect x="4" y="5" width="28" height="31" rx="3" />
                        <line x1="4" y1="11" x2="32" y2="11" />
                        <circle cx="13" cy="20" r="3.2" />
                        <path d="M8,29 C8,25 18,25 18,29" />
                        <line x1="21" y1="19" x2="28" y2="19" />
                        <line x1="21" y1="24" x2="28" y2="24" />
                      </svg>
                    </div>

                    <div class="ctc-titles">
                      <h3>{{ trn.title }}</h3>
                      <div class="ctc-participants">
                        <span>👥</span>
                        <span>{{ trn.participants.length }} participantes</span>
                      </div>
                    </div>
                  </div>

                  <!-- DOIS BOTÕES LADO A LADO: VER FOTOS (VERMELHO) E VER RELATÓRIO (BRANCO) -->
                  <div class="ctc-actions-row">
                    <button
                      type="button"
                      class="btn-ver-fotos-red"
                      (click)="toggleTrainingPhotos(trn.id)"
                    >
                      <span class="btn-ico">🖼️</span>
                      <span>Ver fotos</span>
                    </button>

                    <button
                      type="button"
                      class="btn-ver-relatorio-white"
                      (click)="toggleTrainingReport(trn.id)"
                    >
                      <span class="btn-ico">📄</span>
                      <span>Ver relatório</span>
                    </button>
                  </div>

                  <!-- GALERIA DE FOTOS DO TREINAMENTO -->
                  @if (activeTrainingPhotosId() === trn.id) {
                    <div class="ctc-drawer">
                      <div class="panel-top">
                        <strong>Evidências Fotográficas · {{ trn.title }}</strong>
                        <button
                          type="button"
                          class="btn-ghost"
                          (click)="activeTrainingPhotosId.set(null)"
                        >
                          ✕
                        </button>
                      </div>
                      <div class="ctc-photos-grid">
                        <img [src]="trn.photoUrl" alt="Foto principal da turma" />
                        <img src="/assets/p13_img_6.png" alt="Registro em posto" />
                      </div>
                    </div>
                  }

                  <!-- RELATÓRIO COMPLETO DO TREINAMENTO -->
                  @if (activeTrainingReportId() === trn.id) {
                    <div class="ctc-drawer">
                      <div class="panel-top">
                        <strong>Relatório do Treinamento · {{ trn.date }}</strong>
                        <button
                          type="button"
                          class="btn-ghost"
                          (click)="activeTrainingReportId.set(null)"
                        >
                          ✕
                        </button>
                      </div>
                      <p><strong>Instrutor:</strong> {{ trn.instructor }}</p>
                      <p class="mt-12"><strong>Conteúdo aplicado:</strong> {{ trn.content }}</p>
                      <div class="participant-chips mt-12">
                        @for (p of trn.participants; track p.name) {
                          <span class="p-chip" [class.present]="p.present">
                            {{ p.name }} ({{ p.present ? 'Concluído' : 'Em reposição' }})
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </article>
            }
          </div>
        </section>
      }

      <!-- ================================================================= -->
      <!-- ABA 4: MAIS (Linha do Tempo Validada, Fotos e SLA do Contrato)    -->
      <!-- ================================================================= -->
      @if (state.clientActiveTab() === 'mais') {
        <section class="client-screen-container">
          <!-- LINHA DO TEMPO DO CONTRATO -->
          <div class="card-panel">
            <div class="panel-top">
              <div>
                <h3>Linha do Tempo ({{ state.selectedContract().name }})</h3>
                <p>Atualizações e evidências validadas pelo consultor responsável.</p>
              </div>
            </div>

            <div class="contract-timeline">
              @for (ev of state.clientTimeline(); track ev.id) {
                <div class="tl-entry">
                  <div class="tl-marker"></div>
                  <div class="tl-card">
                    <div class="tl-card-head">
                      <span class="tl-timestamp">{{ ev.date }} · {{ ev.time }}</span>
                      <span class="tl-cat">{{ ev.category | uppercase }}</span>
                    </div>
                    <h4>{{ ev.title }}</h4>
                    <p>{{ ev.description }}</p>
                    @if (ev.photoUrl) {
                      <img [src]="ev.photoUrl" [alt]="ev.title" class="tl-photo" />
                    }
                    @if (ev.validatedBy) {
                      <small class="tl-valid">
                        ✓ Validado por {{ ev.validatedBy }} em {{ ev.validatedAt }}
                      </small>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- BARRA DE NAVEGAÇÃO INFERIOR EXCLUSIVA DO MOBILE (OCULTA NO WEB/DESKTOP) -->
      <nav class="client-bottom-nav">
        <button
          type="button"
          [class.active]="state.clientActiveTab() === 'inicio'"
          (click)="setTab('inicio')"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 3L3 10v11h6v-7h6v7h6V10L12 3z" />
          </svg>
          <span>Início</span>
        </button>

        <button
          type="button"
          [class.active]="state.clientActiveTab() === 'meu-contrato'"
          (click)="setTab('meu-contrato')"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="14" y2="17" />
          </svg>
          <span>Meu contrato</span>
        </button>

        <button
          type="button"
          [class.active]="state.clientActiveTab() === 'treinamentos'"
          (click)="setTab('treinamentos')"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 14.5l-7-3.82V17l7 4 7-4v-3.32L12 17.5z" />
          </svg>
          <span>Treinamentos</span>
        </button>

        <button
          type="button"
          [class.active]="state.clientActiveTab() === 'mais'"
          (click)="setTab('mais')"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <circle cx="5" cy="12" r="2.2" />
            <circle cx="12" cy="12" r="2.2" />
            <circle cx="19" cy="12" r="2.2" />
          </svg>
          <span>Mais</span>
        </button>
      </nav>
    </div>
  `,
})
export class ClientePortalComponent implements OnInit {
  readonly state = inject(OlamStateService);

  // Pilar selecionado na Saúde do Contrato ('GERAL' | 'RH' | 'RT' | 'RA')
  readonly selectedHealthPillar = signal<'GERAL' | 'RH' | 'RT' | 'RA'>('GERAL');

  // Item selecionado no "Painel do contrato" (inicia fechado; abre Equipe do contrato ao clicar em 'equipe')
  readonly contractPanelSelection = signal<
    'seguranca' | 'orcamento' | 'equipe' | 'treinamentos' | null
  >(null);

  readonly openIndicatorDetail = signal<'melhorias' | 'visitas' | 'treinamento' | null>(null);
  readonly expandedBudgetId = signal<string | null>(null);
  readonly showTurnoverHistory = signal<boolean>(false);
  readonly activeTrainingPhotosId = signal<string | null>(null);
  readonly activeTrainingReportId = signal<string | null>(null);
  clientBudgetComment = '';

  // Status dinâmico exibido no velocímetro de Saúde do Contrato conforme o pilar clicado
  readonly activeGaugeStatus = computed<HealthStatus>(() => {
    const h = this.state.selectedContract().health;
    const pillar = this.selectedHealthPillar();
    if (pillar === 'RH') return h.rh;
    if (pillar === 'RT') return h.rt;
    if (pillar === 'RA') return h.ra;
    return h.overall;
  });

  readonly activeGaugeTitle = computed<string>(() => {
    const pillar = this.selectedHealthPillar();
    if (pillar === 'RH') return 'PILAR RH · EQUIPE E TREINAMENTOS';
    if (pillar === 'RT') return 'PILAR RT · EQUIPAMENTOS E TECNOLOGIA';
    if (pillar === 'RA') return 'PILAR RA · PAGAMENTOS E ADMINISTRAÇÃO';
    return 'SAÚDE GERAL DO CONTRATO';
  });

  readonly activeGaugeSummary = computed<string>(() => {
    const h = this.state.selectedContract().health;
    const pillar = this.selectedHealthPillar();
    if (pillar === 'RH') return h.rhSummary;
    if (pillar === 'RT') return h.rtSummary;
    if (pillar === 'RA') return h.raSummary;
    return 'Clique em RH, RT ou RA ao lado para inspecionar cada indicador no gráfico.';
  });

  readonly currentClientMeta = computed(
    () =>
      this.state.clientAccounts.find((c) => c.id === this.state.activeClientAccount()) ??
      this.state.clientAccounts[1]
  );

  readonly contractBudgets = computed(() =>
    this.state
      .budgets()
      .filter((b) => b.contractId === this.state.selectedContractId())
  );

  readonly contractTrainings = computed(() =>
    this.state
      .trainings()
      .filter((t) => t.contractId === this.state.selectedContractId())
  );

  // Gera os 8 bonecos de rotatividade (destacando as saídas em vermelho)
  readonly turnoverFigures = computed(() => {
    const dismissals = this.state.selectedContract().teamMetrics.dismissalsMonth;
    const totalIcons = 8;
    const redCount = Math.min(Math.max(dismissals, 1), totalIcons);
    return Array.from({ length: totalIcons }, (_, idx) => idx < redCount);
  });

  ngOnInit(): void {
    this.state.activeRole.set('cliente');
    const cli = this.currentClientMeta();
    this.state.selectedContractId.set(cli.contractId);
  }

  selectHealthPillar(pillar: 'RH' | 'RT' | 'RA'): void {
    this.selectedHealthPillar.set(
      this.selectedHealthPillar() === pillar ? 'GERAL' : pillar
    );
  }

  selectContractPanelItem(
    item: 'seguranca' | 'orcamento' | 'equipe' | 'treinamentos'
  ): void {
    const next = this.contractPanelSelection() === item ? null : item;
    this.contractPanelSelection.set(next);
    if (next === 'orcamento') {
      const firstBudget = this.contractBudgets()[0];
      if (firstBudget) {
        this.expandedBudgetId.set(firstBudget.id);
      }
    }
  }

  switchClient(clientId: 'CLI-A' | 'CLI-B' | 'CLI-C'): void {
    this.state.loginAsClientAccount(clientId);
    this.selectedHealthPillar.set('GERAL');
    this.contractPanelSelection.set(null);
    this.expandedBudgetId.set(null);
    this.showTurnoverHistory.set(false);
    this.openIndicatorDetail.set(null);
  }

  setTab(tab: 'inicio' | 'meu-contrato' | 'treinamentos' | 'mais'): void {
    this.state.clientActiveTab.set(tab);
  }

  // Converte 0..100% em ângulo de -90deg a +90deg para o velocímetro semicircular
  percentToAngle(percent: number): number {
    const clamped = Math.max(0, Math.min(100, percent));
    return (clamped / 100) * 180 - 90;
  }

  statusLabel(status: HealthStatus): string {
    if (status === 'em-dia') return 'Em dia';
    if (status === 'atencao') return 'Atenção';
    return 'Crítico';
  }

  gaugeNeedleRotation(status: HealthStatus): number {
    if (status === 'em-dia') return -52;
    if (status === 'atencao') return -8;
    return 52;
  }

  toggleProposalDetail(budgetId: string): void {
    this.expandedBudgetId.set(this.expandedBudgetId() === budgetId ? null : budgetId);
  }

  toggleTrainingPhotos(trnId: string): void {
    this.activeTrainingPhotosId.set(this.activeTrainingPhotosId() === trnId ? null : trnId);
  }

  toggleTrainingReport(trnId: string): void {
    this.activeTrainingReportId.set(this.activeTrainingReportId() === trnId ? null : trnId);
  }

  decideBudget(budgetId: string, decision: 'aprovado' | 'recusado'): void {
    this.state.decideBudget(budgetId, decision, this.clientBudgetComment);
    this.clientBudgetComment = '';
  }

  commentOnBudget(budgetId: string): void {
    if (!this.clientBudgetComment.trim()) return;
    this.state.addBudgetComment(
      budgetId,
      'Cliente (' + this.state.selectedContract().name + ')',
      'Cliente',
      this.clientBudgetComment
    );
    this.clientBudgetComment = '';
  }
}
