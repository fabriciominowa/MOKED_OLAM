import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DivisionCode, HealthStatus } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-consultor-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- =================================================================== -->
    <!-- PÁGINA 1: MINHAS ÁREAS (RESUMO + DIVISÕES EM PÁGINA COMPLETA)        -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'minhas-areas') {
      <section class="page-hero">
        <div class="hero-copy">
          <span class="badge-pill">02 | CONSULTOR · MINHAS ÁREAS</span>
          <h2>Painel das Minhas Áreas e Carteira</h2>
          <p>
            Contrato em foco: <strong>{{ state.selectedContract().name }}</strong> ({{
              state.selectedContract().division
            }}
            — {{ state.selectedContract().unit }}). Selecione qualquer divisão abaixo ou na barra
            lateral para abrir sua página dedicada.
          </p>
        </div>
        <div class="hero-status-box" [attr.data-status]="state.selectedContract().health.overall">
          <span class="label">Saúde do Contrato Ativo</span>
          <strong>{{ statusLabel(state.selectedContract().health.overall) | uppercase }}</strong>
          <small>
            RH: {{ statusLabel(state.selectedContract().health.rh) }} · RT:
            {{ statusLabel(state.selectedContract().health.rt) }} · RA:
            {{ statusLabel(state.selectedContract().health.ra) }}
          </small>
        </div>
      </section>

      <div class="card-panel mt-16">
        <h3>Divisões e Áreas Operacionais</h3>
        <p>Acesse diretamente a página de cada divisão do Grupo Moked.</p>

        <div class="mok-areas-grid full-width-areas mt-12">
          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKPAT'"
            (click)="openAreaPage('MOKPAT')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <path
                  d="M32 6 L12 14 V30 C12 45 20.5 54.5 32 58 C43.5 54.5 52 45 52 30 V14 L32 6 Z"
                  fill="#d91b22"
                />
                <circle cx="32" cy="25" r="6" fill="#ffffff" />
                <path d="M21 43 C21 35 43 35 43 43 Z" fill="#ffffff" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">PAT</span></div>
            <small class="mat-sub">Segurança Patrimonial ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKVIP'"
            (click)="openAreaPage('MOKVIP')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <circle cx="20" cy="24" r="6" fill="#18181b" />
                <path d="M10 44 C10 35 30 35 30 44 Z" fill="#18181b" />
                <circle cx="44" cy="24" r="6" fill="#18181b" />
                <path d="M34 44 C34 35 54 35 54 44 Z" fill="#18181b" />
                <circle cx="32" cy="20" r="7.5" fill="#18181b" />
                <path d="M18 48 C18 36 46 36 46 48 Z" fill="#18181b" stroke="#f8f9fa" stroke-width="2" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">VIP</span></div>
            <small class="mat-sub">Proteção Executiva ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKIMP'"
            (click)="openAreaPage('MOKIMP')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <path
                  d="M16 8 H38 L48 18 V54 C48 56.2 46.2 58 44 58 H16 C13.8 58 12 56.2 12 54 V12 C12 9.8 13.8 8 16 8 Z"
                  fill="#d91b22"
                />
                <path d="M38 8 V18 H48 Z" fill="#fca5a5" />
                <rect x="20" y="26" width="20" height="3.5" rx="1.5" fill="#ffffff" />
                <rect x="20" y="34" width="20" height="3.5" rx="1.5" fill="#ffffff" />
                <rect x="20" y="42" width="13" height="3.5" rx="1.5" fill="#ffffff" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">IMP</span></div>
            <small class="mat-sub">Implantação ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKLOG'"
            (click)="openAreaPage('MOKLOG')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <rect x="14" y="38" width="8" height="14" rx="2" fill="#18181b" />
                <rect x="28" y="26" width="8" height="26" rx="2" fill="#18181b" />
                <rect x="42" y="14" width="8" height="38" rx="2" fill="#18181b" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">LOG</span></div>
            <small class="mat-sub">Segurança Logística ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKRES'"
            (click)="openAreaPage('MOKRES')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <rect x="14" y="12" width="36" height="44" rx="5" fill="#d91b22" />
                <rect x="23" y="7" width="18" height="9" rx="3" fill="#991b1b" />
                <polyline
                  points="23 35 29 41 41 28"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="4.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">RES</span></div>
            <small class="mat-sub">Segurança Residencial ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'MOKTEC'"
            (click)="openAreaPage('MOKTEC')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 64 64" width="44" height="44">
                <circle cx="32" cy="32" r="14" fill="none" stroke="#18181b" stroke-width="8" />
                <circle cx="32" cy="32" r="5" fill="#ffffff" />
                <rect x="29" y="8" width="6" height="9" rx="2" fill="#18181b" />
                <rect x="29" y="47" width="6" height="9" rx="2" fill="#18181b" />
                <rect x="8" y="29" width="9" height="6" rx="2" fill="#18181b" />
                <rect x="47" y="29" width="9" height="6" rx="2" fill="#18181b" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">MOK</span><span class="red">TEC</span></div>
            <small class="mat-sub">Tecnologia e Sistemas ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'P950'"
            (click)="openAreaPage('P950')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 32 32" width="38" height="38" fill="none" stroke="#18181b" stroke-width="2.2">
                <rect x="3" y="5" width="26" height="17" rx="2" />
                <line x1="11" y1="27" x2="21" y2="27" />
                <line x1="16" y1="22" x2="16" y2="27" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">P950</span></div>
            <small class="mat-sub">Portaria Remota ›</small>
          </button>

          <button
            type="button"
            class="mok-area-tile"
            [class.active]="state.selectedDivision() === 'Treinamento'"
            (click)="openAreaPage('Treinamento')"
          >
            <div class="mat-icon">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="#18181b">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 14.5l-7-3.82V17l7 4 7-4v-3.32L12 17.5z" />
              </svg>
            </div>
            <div class="mat-label"><span class="blk">Treinamento</span></div>
            <small class="mat-sub">Capacitação e Turmas ›</small>
          </button>
        </div>
      </div>

      <section class="kpi-grid-4 mt-16">
        <div class="kpi-card">
          <span class="kpi-label">Divisões Moked</span>
          <strong>{{ state.divisions.length }}</strong>
          <small>Páginas dedicadas ativas</small>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Contratos na Carteira</span>
          <strong>{{ state.contracts().length }}</strong>
          <small>Ativo: {{ state.selectedContract().id }}</small>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Visitas Registradas</span>
          <strong>{{ state.visits().length }}</strong>
          <small>Agenda e relatórios de campo</small>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Ocorrências em Aberto</span>
          <strong>{{ state.occurrences().length }}</strong>
          <small>Validações e chamados técnicos</small>
        </div>
      </section>

      <div class="two-col-grid mt-20">
        <div class="card-panel">
          <h3>Resumo dos Contratos em Foco</h3>
          <div class="cwsc-items-stack mt-12">
            @for (c of state.contracts().slice(0, 4); track c.id) {
              <div
                class="portfolio-status-box static"
                [attr.data-status]="c.health.overall"
              >
                <div class="psb-row">
                  <strong>{{ c.name }} · {{ c.division }}</strong>
                  <span class="status-badge" [attr.data-status]="c.health.overall">
                    {{ statusLabel(c.health.overall) }}
                  </span>
                </div>
                <span>{{ c.unit }} — {{ c.address }}</span>
                <small>
                  Visitas no mês: {{ c.completedVisitsMonth }}/{{ c.plannedVisitsMonth }}
                </small>
              </div>
            }
          </div>
        </div>

        <div class="card-panel">
          <h3>Últimas Visitas e Ocorrências</h3>
          <div class="visits-feed mt-12">
            @for (v of state.visits().slice(0, 3); track v.id) {
              <div class="visit-feed-card">
                <div class="vfc-head">
                  <strong>{{ v.division }} · {{ v.contractId }}</strong>
                  <span class="badge-green">{{ v.date }} às {{ v.entryTime }}</span>
                </div>
                <p>{{ v.summary }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- =================================================================== -->
    <!-- PÁGINA INDIVIDUAL DE CADA ÁREA (/consultor/area/:division)          -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'area-detalhe') {
      <section class="page-hero">
        <div class="hero-copy">
          <span class="badge-pill">02 | CONSULTOR · {{ currentDivisionMeta().code }}</span>
          <h2>{{ currentDivisionMeta().code }} · {{ currentDivisionMeta().name }}</h2>
          <p>{{ currentDivisionMeta().description }}</p>
        </div>
        <div class="hero-status-box" [attr.data-status]="state.selectedContract().health.overall">
          <span class="label">Contrato Selecionado</span>
          <strong>{{ state.selectedContract().name }}</strong>
          <small>Saúde geral: {{ statusLabel(state.selectedContract().health.overall) }}</small>
        </div>
      </section>

      <div class="consultant-main-grid mt-16">
        <!-- COLUNA 1: CONTRATOS E INDICADORES DA ÁREA -->
        <section class="card-panel">
          <h3>
            Contratos da Área {{ currentDivisionMeta().code }} ({{
              contractsInSelectedDivision().length
            }})
          </h3>

          <div class="cwsc-items-stack mt-12">
            @for (c of contractsInSelectedDivision(); track c.id) {
              <div
                class="portfolio-status-box"
                [attr.data-status]="c.health.overall"
                [class.selected]="state.selectedContractId() === c.id"
                (click)="state.selectContract(c.id)"
              >
                <div class="psb-row">
                  <strong>{{ c.name }} · {{ c.unit }}</strong>
                  <span class="status-badge" [attr.data-status]="c.health.overall">
                    {{ statusLabel(c.health.overall) }}
                  </span>
                </div>
                <span>{{ c.address }}</span>
                <span>
                  Visitas no mês:
                  <strong>{{ c.completedVisitsMonth }}/{{ c.plannedVisitsMonth }}</strong> · RH:
                  <strong>{{ statusLabel(c.health.rh) }}</strong> · RT:
                  <strong>{{ statusLabel(c.health.rt) }}</strong> · RA:
                  <strong>{{ statusLabel(c.health.ra) }}</strong>
                </span>

                <div class="ctc-actions-row mt-12">
                  <button
                    type="button"
                    class="btn-ver-fotos-red"
                    (click)="goToVisitsPage(c.id, 'agendada'); $event.stopPropagation()"
                  >
                    Agendar visita
                  </button>
                  <button
                    type="button"
                    class="btn-ver-relatorio-white"
                    (click)="goToVisitsPage(c.id, 'concluida'); $event.stopPropagation()"
                  >
                    Registrar visita
                  </button>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- COLUNA 2: PAINEL OPERACIONAL DA ÁREA + VISITAS DA DIVISÃO -->
        <section class="card-panel">
          <div class="panel-top">
            <div>
              <h3>{{ state.selectedContract().name }} · {{ currentDivisionMeta().code }}</h3>
              <p>Indicadores operacionais e visitas da divisão</p>
            </div>
            <span
              class="status-badge"
              [attr.data-status]="state.selectedContract().health.overall"
            >
              {{ statusLabel(state.selectedContract().health.overall) }}
            </span>
          </div>

          <div class="cwsc-items-stack">
            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.rh"
            >
              <strong>RH · {{ statusLabel(state.selectedContract().health.rh) }}</strong>
              <span>{{ state.selectedContract().health.rhSummary }}</span>
            </div>

            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.rt"
            >
              <strong>RT · {{ statusLabel(state.selectedContract().health.rt) }}</strong>
              <span>{{ state.selectedContract().health.rtSummary }}</span>
            </div>

            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.ra"
            >
              <strong>RA · {{ statusLabel(state.selectedContract().health.ra) }}</strong>
              <span>{{ state.selectedContract().health.raSummary }}</span>
            </div>
          </div>

          <div class="division-contracts-box mt-12">
            <div class="dcb-head">
              <strong>Protocolos e Campos Específicos · {{ currentDivisionMeta().code }}</strong>
            </div>
            @for (field of currentDivisionMeta().specificFields; track field.key) {
              <div class="klv-row">
                <span>{{ field.label }}</span>
                <strong>{{ divisionFieldValues[field.key] || field.placeholder }}</strong>
              </div>
            }
          </div>

          <div class="ctc-actions-row mt-12">
            <button
              type="button"
              class="btn-ver-fotos-red"
              (click)="goToVisitsPage(state.selectedContractId(), 'agendada')"
            >
              📅 Ir para Página de Visitas (Agendar)
            </button>
            <button
              type="button"
              class="btn-ver-relatorio-white"
              (click)="goToVisitsPage(state.selectedContractId(), 'concluida')"
            >
              📍 Ir para Página de Visitas (Registrar)
            </button>
          </div>

          <h4 class="mt-12">
            Últimas Visitas da Área {{ currentDivisionMeta().code }} ({{
              visitsInSelectedDivision().length
            }})
          </h4>
          <div class="visits-feed">
            @for (v of visitsInSelectedDivision(); track v.id) {
              <div class="visit-feed-card">
                <div class="vfc-head">
                  <strong>{{ v.division }} · {{ v.contractId }} ({{ v.date }} {{ v.entryTime }})</strong>
                  @if (v.status === 'agendada') {
                    <span class="badge-amber">📅 Agendada</span>
                  } @else {
                    <span class="badge-green">✓ Salva</span>
                  }
                </div>
                <p>{{ v.summary }}</p>
              </div>
            }
          </div>
        </section>
      </div>
    }

    <!-- =================================================================== -->
    <!-- PÁGINA DEDICADA DE VISITAS (/consultor/visitas):                    -->
    <!-- AGENDAR VISITA & REGISTRAR VISITA COM FOTOS E RESUMO                -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'nova-visita') {
      <section class="page-hero">
        <div class="hero-copy">
          <span class="badge-pill">
            02 | CONSULTOR · {{ state.selectedDivision() }} · {{ state.selectedContract().name }}
          </span>
          <h2>{{ visitMode() === 'agendada' ? 'Agendar Nova Visita' : 'Registrar Visita em Campo' }}</h2>
          <p>
            Contrato ativo: <strong>{{ state.selectedContract().name }}</strong> —
            {{ state.selectedContract().unit }}.
          </p>
        </div>
        <div class="hero-status-box" data-status="em-dia">
          <span class="label">Histórico</span>
          <strong>{{ state.visits().length }} registros</strong>
          <small>Envio automático para o cliente</small>
        </div>
      </section>

      <div class="consultant-main-grid mt-16">
        <!-- CARD ESQUERDO: FORMULÁRIO DE AGENDAR / REGISTRAR VISITA -->
        <section class="card-panel" id="nova-visita-card">
          <!-- ABAS DE AÇÃO NA PÁGINA DE VISITAS: AGENDAR VISITA | REGISTRAR VISITA | TREINAMENTO | PROBLEMA -->
          <div class="visit-type-tabs">
            <button
              type="button"
              [class.active]="visitMode() === 'agendada'"
              (click)="visitActivityType.set('visita'); visitMode.set('agendada')"
            >
              Agendar visita
            </button>
            <button
              type="button"
              [class.active]="visitActivityType() === 'visita' && visitMode() === 'concluida'"
              (click)="visitActivityType.set('visita'); visitMode.set('concluida')"
            >
              Registrar visita
            </button>
            <button
              type="button"
              [class.active]="visitActivityType() === 'treinamento' && visitMode() === 'concluida'"
              (click)="visitActivityType.set('treinamento'); visitMode.set('concluida')"
            >
              Treinamento
            </button>
            <button
              type="button"
              [class.active]="visitActivityType() === 'problema' && visitMode() === 'concluida'"
              (click)="visitActivityType.set('problema'); visitMode.set('concluida')"
            >
              Problema
            </button>
          </div>

          <!-- CAMPO 1: CONTRATO -->
          <div class="nv-field-row">
            <div class="nv-field-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#18181b">
                <path d="M3 21h18v-2H3v2zm2-4h6V3H5v14zm2-12h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2zm6-6h6v10h-6V7zm2 2v2h2V9h-2zm0 4v2h2v-2h-2z" />
              </svg>
            </div>
            <div class="nv-field-box">
              <label>Contrato</label>
              <select
                [ngModel]="state.selectedContractId()"
                (ngModelChange)="selectContractForVisit($event)"
              >
                @for (c of state.contracts().slice(0, 10); track c.id) {
                  <option [value]="c.id">
                    {{ c.name }} — {{ c.unit }} ({{ c.division }})
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- CAMPO 2: DATA E HORÁRIO -->
          <div class="nv-field-row">
            <div class="nv-field-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#18181b">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm-12-8h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
              </svg>
            </div>
            <div class="nv-field-box">
              <label>
                {{ visitMode() === 'agendada' ? 'Data e horário do agendamento' : 'Data e horário' }}
              </label>
              <div class="nv-datetime-wrap">
                <input
                  type="text"
                  [(ngModel)]="visitDateTime"
                  placeholder="24/04/2025 10:00"
                />
                <span class="cal-mini-ico">📅</span>
              </div>
            </div>
          </div>

          <!-- CAMPO 3: RESUMO DA VISITA + CAMPOS DA DIVISÃO -->
          <div class="nv-field-row align-top">
            <div class="nv-field-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#18181b">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </div>
            <div class="nv-field-box">
              <label>
                {{
                  visitMode() === 'agendada'
                    ? 'Pauta / Resumo do agendamento (' + currentDivisionMeta().code + ')'
                    : 'Resumo da visita (' + currentDivisionMeta().code + ')'
                }}
              </label>
              <textarea
                rows="3"
                [(ngModel)]="visitSummary"
                placeholder="Descreva os principais pontos da visita..."
              ></textarea>

              @for (field of currentDivisionMeta().specificFields; track field.key) {
                <div class="div-sub-input mt-12">
                  <small>{{ field.label }} ({{ currentDivisionMeta().code }}):</small>
                  <input
                    type="text"
                    [(ngModel)]="divisionFieldValues[field.key]"
                    [placeholder]="field.placeholder"
                  />
                </div>
              }

              <div class="div-sub-input mt-12">
                <small>Melhoria ou recomendação registrada:</small>
                <input
                  type="text"
                  [(ngModel)]="visitImprovement"
                  placeholder="Ex.: Reorganização do fluxo de triagem na portaria"
                />
              </div>

              @if (visitActivityType() === 'problema' || visitHasPendingAction) {
                <div class="problem-extra-box mt-12">
                  <small class="red-txt">⚠ Ação corretiva com responsável e prazo:</small>
                  <div class="two-col-grid mt-8">
                    <input
                      type="text"
                      [(ngModel)]="visitPendingResponsible"
                      placeholder="Responsável (ex.: Equipe técnica)"
                    />
                    <input
                      type="text"
                      [(ngModel)]="visitPendingDeadline"
                      placeholder="Prazo (ex.: 05/11/2026)"
                    />
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- CAMPO 4: ADICIONAR FOTO -->
          <div class="nv-field-row align-top">
            <div class="nv-field-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#18181b">
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
            </div>
            <div class="nv-field-box">
              <label>Adicionar foto</label>

              <label class="photo-dropzone-box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden-file-input"
                  (change)="onPhotosSelected($event)"
                />
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#6b7280">
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                </svg>
                <span>Toque para adicionar foto</span>
              </label>

              <div class="quick-photo-presets">
                <span>Ou anexar evidência rápida:</span>
                <button type="button" (click)="addPresetPhoto('/assets/p13_img_7.png')">
                  + Portaria
                </button>
                <button type="button" (click)="addPresetPhoto('/assets/p13_img_9.png')">
                  + CFTV
                </button>
                <button
                  type="button"
                  (click)="addPresetPhoto('/assets/treinamento-controle-acesso.png')"
                >
                  + Equipe
                </button>
              </div>

              @if (attachedPhotos().length > 0) {
                <div class="attached-photos-preview">
                  @for (img of attachedPhotos(); track $index) {
                    <div class="app-thumb">
                      <img [src]="img" alt="Foto anexada" />
                      <button
                        type="button"
                        class="remove-photo-btn"
                        title="Remover foto"
                        (click)="removeAttachedPhoto($index)"
                      >
                        ✕
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- BOTÃO VERMELHO: SALVAR VISITA / SALVAR AGENDAMENTO -->
          <button
            type="button"
            class="btn-salvar-visita-red"
            (click)="saveConsultantFieldRecord()"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
            </svg>
            <span>
              {{ visitMode() === 'agendada' ? 'Salvar agendamento de visita' : 'Salvar visita' }}
            </span>
          </button>
        </section>

        <!-- CARD DIREITO: AGENDA E HISTÓRICO DE VISITAS REGISTRADAS -->
        <section class="card-panel">
          <div class="panel-top">
            <div>
              <h3>Visitas Agendadas & Registradas</h3>
              <p>Acompanhe os agendamentos e os registros de visitas salvas com foto e resumo.</p>
            </div>
            <span class="badge-green">{{ state.visits().length }} registros</span>
          </div>

          <div class="visits-feed">
            @for (v of state.visits(); track v.id) {
              <div class="visit-feed-card">
                <div class="vfc-head">
                  <div>
                    <span class="div-tag">{{ v.division }}</span>
                    <strong> · {{ v.contractId }} ({{ v.date }} às {{ v.entryTime }})</strong>
                  </div>
                  @if (v.status === 'agendada') {
                    <span class="badge-amber">📅 Agendada</span>
                  } @else {
                    <span class="badge-green">✓ Salva · {{ v.durationMinutes }} min</span>
                  }
                </div>

                <p class="mt-8"><strong>Resumo:</strong> {{ v.summary }}</p>

                @if (v.improvementRegistered) {
                  <small class="block mt-4">
                    <strong>Melhoria:</strong> {{ v.improvementRegistered }}
                  </small>
                }

                @if (v.photos && v.photos.length > 0) {
                  <div class="vfc-photos-row mt-8">
                    @for (ph of v.photos; track $index) {
                      <img [src]="ph" alt="Foto da visita" class="vfc-photo-thumb" />
                    }
                  </div>
                } @else if (v.photoUrl) {
                  <div class="vfc-photos-row mt-8">
                    <img [src]="v.photoUrl" alt="Foto da visita" class="vfc-photo-thumb" />
                  </div>
                }

                @if (v.status === 'agendada') {
                  <button
                    type="button"
                    class="btn-primary mt-12"
                    (click)="completeScheduledVisit(v.id)"
                  >
                    ✓ Concluir e Registrar Visita Agendada
                  </button>
                }
              </div>
            }
          </div>
        </section>
      </div>
    }

    <!-- =================================================================== -->
    <!-- PÁGINA 4: MINHA CARTEIRA & TERMÔMETRO DO CONTRATO (/consultor/carteira) -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'carteira') {
      <div class="contract-panels-duo mb-20">
        <div class="contract-white-screen-card">
          <h2 class="cwsc-title">Minha carteira</h2>

          <div class="cwsc-items-stack">
            @for (c of state.contracts().slice(0, 6); track c.id) {
              <button
                type="button"
                class="portfolio-status-box"
                [attr.data-status]="c.health.overall"
                [class.selected]="state.selectedContractId() === c.id"
                (click)="state.selectContract(c.id)"
              >
                <div class="psb-row">
                  <strong>{{ c.name }} ({{ c.division }})</strong>
                  <span class="psb-unit">{{ c.unit }}</span>
                </div>
                <span>
                  {{ statusLabel(c.health.overall) }} · {{ c.health.rtSummary }}
                </span>
              </button>
            }
          </div>

          <button
            type="button"
            class="btn-salvar-visita-red mt-16"
            (click)="goToVisitsPage(state.selectedContractId(), 'concluida')"
          >
            Abrir {{ state.selectedContract().name }} na Página de Visitas
          </button>
        </div>

        <div class="contract-white-screen-card">
          <span class="cwsc-eyebrow-red">{{ state.selectedContract().division }}</span>
          <h2 class="cwsc-title">{{ state.selectedContract().name }}</h2>

          <div class="cwsc-items-stack">
            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.rh"
            >
              <strong>RH · {{ statusLabel(state.selectedContract().health.rh) }}</strong>
              <span>{{ state.selectedContract().health.rhSummary }}</span>
            </div>

            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.rt"
            >
              <strong>RT · {{ statusLabel(state.selectedContract().health.rt) }}</strong>
              <span>{{ state.selectedContract().health.rtSummary }}</span>
            </div>

            <div
              class="portfolio-status-box static"
              [attr.data-status]="state.selectedContract().health.ra"
            >
              <strong>RA · {{ statusLabel(state.selectedContract().health.ra) }}</strong>
              <span>{{ state.selectedContract().health.raSummary }}</span>
            </div>
          </div>

          <div class="ctc-actions-row mt-16">
            <button
              type="button"
              class="btn-ver-fotos-red"
              (click)="goToTab('ocorrencias', '/consultor/ocorrencias')"
            >
              Ver pendência técnica
            </button>
            <button
              type="button"
              class="btn-ver-relatorio-white"
              (click)="goToVisitsPage(state.selectedContractId(), 'agendada')"
            >
              📅 Agendar / Nova visita
            </button>
          </div>
        </div>
      </div>
    }

    <!-- =================================================================== -->
    <!-- PÁGINA 5: OCORRÊNCIAS & VALIDAÇÃO (/consultor/ocorrencias)          -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'ocorrencias') {
      <div class="card-panel">
        <h3>Central de Coordenação, Validação de Reparos e Publicação ao Cliente</h3>
        <p>
          Confira os relatos recebidos da Central, do Líder de Posto e dos Técnicos Terceirizados,
          valide o reparo e libere a atualização para o Cliente.
        </p>

        <div class="occ-list">
          @for (occ of state.occurrences(); track occ.id) {
            <div class="occ-row-card" [class.overdue]="occ.isOverdue">
              <div class="orc-main">
                <div class="orc-tags">
                  <span class="tag-code">{{ occ.code }}</span>
                  <span class="tag-origin">{{ occ.origin }}</span>
                  <span class="tag-origin">Prioridade {{ occ.priority | uppercase }}</span>
                  @if (occ.isOverdue) {
                    <span class="badge-red">⚠ Prazo Vencido</span>
                  }
                </div>
                <h4>{{ occ.title }} ({{ occ.contractId }})</h4>
                <p>{{ occ.description }}</p>
                <p class="notes">
                  <strong>Notas de Coordenação:</strong> {{ occ.consultantNotes }}
                </p>
                <div class="orc-meta">
                  <span><strong>Responsável:</strong> {{ occ.responsible }}</span>
                  <span><strong>Prazo:</strong> {{ occ.deadline }}</span>
                  <span><strong>Status:</strong> {{ occ.status | uppercase }}</span>
                  <span>
                    <strong>Visível ao Cliente:</strong>
                    {{
                      occ.publishedToClient
                        ? 'Liberado'
                        : 'Restrito (aguardando validação)'
                    }}
                  </span>
                </div>
              </div>

              <div class="orc-side">
                @if (occ.evidencePhoto) {
                  <img [src]="occ.evidencePhoto" alt="Evidência" class="orc-thumb" />
                }
                @if (occ.status !== 'validada') {
                  <button
                    type="button"
                    class="btn-primary"
                    (click)="state.validateAndPublishOccurrence(occ.id)"
                  >
                    ✓ Validar Reparo e Publicar ao Cliente
                  </button>
                } @else {
                  <span class="badge-green">✓ Validado e Publicado</span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- =================================================================== -->
    <!-- PÁGINA 6: PROPOSTAS DE ORÇAMENTO (/consultor/orcamentos)            -->
    <!-- =================================================================== -->
    @if (state.consultantActiveTab() === 'orcamentos') {
      <div class="two-col-grid">
        <div class="card-panel">
          <h3>Nova Proposta de Orçamento / Reforço Operacional</h3>
          <div class="field-group">
            <label>Contrato</label>
            <select
              [ngModel]="state.selectedContractId()"
              (ngModelChange)="state.selectContract($event)"
            >
              @for (c of state.contracts().slice(0, 6); track c.id) {
                <option [value]="c.id">{{ c.name }} — {{ c.unit }}</option>
              }
            </select>
          </div>
          <div class="field-group mt-12">
            <label>Título da Proposta</label>
            <input type="text" [(ngModel)]="newBudgetTitle" />
          </div>
          <div class="field-group mt-12">
            <label>Valor Mensal Adicional (R$)</label>
            <input type="number" [(ngModel)]="newBudgetValue" />
          </div>
          <div class="field-group mt-12">
            <label>Justificativa</label>
            <textarea rows="3" [(ngModel)]="newBudgetJustification"></textarea>
          </div>
          <div class="field-group mt-12">
            <label>Impacto Operacional Esperado</label>
            <textarea rows="2" [(ngModel)]="newBudgetImpact"></textarea>
          </div>
          <button type="button" class="btn-primary full mt-12" (click)="createBudgetProposal()">
            Liberar Proposta para o Cliente
          </button>
        </div>

        <div class="card-panel">
          <h3>Propostas em Acompanhamento</h3>
          <div class="visits-feed">
            @for (b of state.budgets(); track b.id) {
              <div class="visit-feed-card">
                <h4>{{ b.title }} ({{ b.contractId }})</h4>
                <p>
                  <strong>Valor:</strong> R$ {{ b.monthlyValue.toLocaleString('pt-BR') }}/mês ·
                  <strong>Status:</strong> {{ b.status | uppercase }}
                </p>
                <p>{{ b.justification }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ConsultorWorkspaceComponent implements OnInit {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly visitActivityType = signal<'visita' | 'treinamento' | 'problema'>('visita');
  readonly visitMode = signal<'concluida' | 'agendada'>('concluida');

  visitDateTime = '24/04/2025 10:00';
  visitSummary = 'Revisão do acesso e orientação da equipe na portaria principal.';
  visitImprovement =
    'Reorganização do fluxo de triagem de visitantes e prestadores no horário de pico.';
  visitHasPendingAction = false;
  visitPendingDescription = 'Falha intermitente no leitor biométrico da portaria';
  visitPendingResponsible = 'Equipe técnica';
  visitPendingDeadline = '05/11/2026';

  readonly attachedPhotos = signal<string[]>(['/assets/p13_img_7.png']);

  divisionFieldValues: Record<string, string> = {
    revisaoAcesso: 'Revisão do acesso e orientação da equipe',
    efetivoPosto: 'Efetivo completo (4/4)',
    etapaImplantacao: 'Entrega da fase 2 concluída',
    pendenciaImplantacao: 'Homologação dos leitores concluída',
    equipamentoAvaliado: 'Câmera CFTV 03 · Portaria Principal',
    statusRestabelecimento: 'Conector substituído e testado',
    rotinaLogistica: 'Docas e controle de lacres sem desvios',
    protocoloVip: 'Rota e protocolo executivo validados',
    auditoriaPortaria: 'Clausura e botão de pânico testados',
    conformidadeP950: '100% aderente ao checklist P950',
    temaCapacitacao: 'Controle de acesso e abordagem — 9 participantes',
  };

  newBudgetTitle = 'Reforço da equipe';
  newBudgetValue = 2000;
  newBudgetJustification =
    'Cobrir o acesso principal entre 17h e 20h para eliminar fila de saída.';
  newBudgetImpact = 'Redução do tempo de espera na portaria e maior rigor na identificação.';

  readonly currentDivisionMeta = computed(
    () =>
      this.state.divisions.find((d) => d.code === this.state.selectedDivision()) ??
      this.state.divisions[1]
  );

  readonly contractsInSelectedDivision = computed(() => {
    const div = this.state.selectedDivision();
    const matching = this.state.contracts().filter((c) => c.division === div);
    return matching.length > 0 ? matching : this.state.contracts().slice(0, 3);
  });

  readonly visitsInSelectedDivision = computed(() =>
    this.state.visits().filter((v) => v.division === this.state.selectedDivision())
  );

  ngOnInit(): void {
    this.state.activeRole.set('consultor');

    // Sincroniza a página conforme a rota ativa (/consultor, /consultor/area/:division, /consultor/visitas, etc.)
    this.route.paramMap.subscribe((params) => {
      const divParam = params.get('division') as DivisionCode | null;
      const url = this.router.url;
      if (divParam) {
        this.applyDivisionSelection(divParam);
        this.state.consultantActiveTab.set('area-detalhe');
      } else if (url.startsWith('/consultor/visitas')) {
        this.state.consultantActiveTab.set('nova-visita');
      } else if (url.startsWith('/consultor/carteira')) {
        this.state.consultantActiveTab.set('carteira');
      } else if (url.startsWith('/consultor/ocorrencias')) {
        this.state.consultantActiveTab.set('ocorrencias');
      } else if (url.startsWith('/consultor/orcamentos')) {
        this.state.consultantActiveTab.set('orcamentos');
      }
    });
  }

  goToTab(
    tab:
      | 'minhas-areas'
      | 'area-detalhe'
      | 'nova-visita'
      | 'carteira'
      | 'ocorrencias'
      | 'orcamentos',
    routePath: string
  ): void {
    this.state.consultantActiveTab.set(tab);
    this.router.navigate([routePath]);
  }

  openAreaPage(divCode: DivisionCode): void {
    this.applyDivisionSelection(divCode);
    this.state.consultantActiveTab.set('area-detalhe');
    this.router.navigate(['/consultor/area', divCode]);
  }

  private applyDivisionSelection(divCode: DivisionCode): void {
    this.state.selectedDivision.set(divCode);
    const matching = this.state.contracts().filter((c) => c.division === divCode);
    if (matching.length > 0) {
      this.state.selectContract(matching[0].id);
    }
    if (divCode === 'Treinamento') {
      this.visitActivityType.set('treinamento');
    } else {
      this.visitActivityType.set('visita');
    }
  }

  openTrainingModule(): void {
    this.router.navigate(['/treinamento']);
  }

  selectContractForVisit(contractId: string): void {
    this.state.selectContract(contractId);
    const found = this.state.contracts().find((c) => c.id === contractId);
    if (found) {
      this.state.selectedDivision.set(found.division);
    }
  }

  goToVisitsPage(contractId: string, mode: 'agendada' | 'concluida'): void {
    this.selectContractForVisit(contractId);
    this.visitMode.set(mode);
    this.visitActivityType.set('visita');
    this.state.consultantActiveTab.set('nova-visita');
    this.router.navigate(['/consultor/visitas']);
  }

  completeScheduledVisit(visitId: string): void {
    this.state.visits.update((list) =>
      list.map((v) =>
        v.id === visitId
          ? { ...v, status: 'concluida', durationMinutes: 45, exitTime: 'Concluída' }
          : v
      )
    );
    this.state.showToast('Visita agendada marcada como realizada e enviada para o histórico do cliente!');
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.attachedPhotos.update((list) => [...list, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  addPresetPhoto(url: string): void {
    if (!this.attachedPhotos().includes(url)) {
      this.attachedPhotos.update((list) => [...list, url]);
    }
  }

  removeAttachedPhoto(index: number): void {
    this.attachedPhotos.update((list) => list.filter((_, i) => i !== index));
  }

  statusLabel(status: HealthStatus): string {
    if (status === 'em-dia') return 'Em dia';
    if (status === 'atencao') return 'Atenção';
    return 'Crítico';
  }

  saveConsultantFieldRecord(): void {
    if (!this.visitSummary.trim()) {
      this.state.showToast('Preencha o resumo da visita antes de salvar.');
      return;
    }
    this.state.registerConsultantVisit({
      contractId: this.state.selectedContractId(),
      division: this.state.selectedDivision(),
      activityType: this.visitActivityType(),
      dateTime: this.visitDateTime,
      visitMode: this.visitMode(),
      summary: this.visitSummary.trim(),
      improvementRegistered: this.visitImprovement.trim(),
      photos: this.attachedPhotos(),
      pendingIssueDescription:
        this.visitActivityType() === 'problema' || this.visitHasPendingAction
          ? this.visitPendingDescription
          : undefined,
      pendingResponsible:
        this.visitActivityType() === 'problema' || this.visitHasPendingAction
          ? this.visitPendingResponsible
          : undefined,
      pendingDeadline:
        this.visitActivityType() === 'problema' || this.visitHasPendingAction
          ? this.visitPendingDeadline
          : undefined,
      divisionFields: { ...this.divisionFieldValues },
    });
  }

  createBudgetProposal(): void {
    if (!this.newBudgetTitle.trim()) return;
    this.state.budgets.update((list) => [
      {
        id: `ORC-0${list.length + 1}`,
        contractId: this.state.selectedContractId(),
        title: this.newBudgetTitle.trim(),
        monthlyValue: Number(this.newBudgetValue) || 2000,
        justification: this.newBudgetJustification.trim(),
        impact: this.newBudgetImpact.trim(),
        status: 'em-aprovacao-cliente',
        comments: [],
        history: [
          {
            step: 'Proposta criada pelo Consultor e liberada ao Cliente',
            date: 'Agora',
            actor: 'Carlos Mendes (Consultor)',
          },
        ],
      },
      ...list,
    ]);
    this.state.showToast('Proposta de orçamento enviada e liberada para decisão do Cliente!');
  }
}
