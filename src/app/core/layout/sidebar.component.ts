import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DivisionCode, UserRole } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <aside class="app-sidebar pdf-style-sidebar" [class.mobile-open]="mobileOpen">
      <div class="sidebar-top-row">
        <div class="sidebar-brand" (click)="closeMenu.emit()">
          <strong class="brand-name moked-wordmark">MOK<span class="red">ED</span></strong>
        </div>

        <button
          type="button"
          class="sidebar-close-btn"
          aria-label="Fechar menu"
          (click)="closeMenu.emit()"
        >
          ✕
        </button>
      </div>

      <!-- CABEÇALHO DO PERFIL NO MESMO ESTILO DO MENU DE REFERÊNCIA -->
      <div class="sidebar-role-hero">
        <div class="srh-text">
          <h2>{{ heroMeta().title }}</h2>
          <span>{{ heroMeta().subtitle }}</span>
        </div>

        @if (heroMeta().avatar) {
          <img
            [src]="heroMeta().avatar"
            [alt]="heroMeta().title"
            class="srh-avatar"
          />
        } @else {
          <div class="srh-client-mark" aria-hidden="true">
            <span>{{ state.selectedContract().id }}</span>
          </div>
        }
      </div>

      <!-- ================================================================= -->
      <!-- 01 | CLIENTE (ACESSO RESTRITO AO CONTRATO A, B OU C)              -->
      <!-- ================================================================= -->
      @if (state.activeRole() === 'cliente') {
        <div class="sidebar-posto-box static-box">
          <div class="spb-ico">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"
              />
            </svg>
          </div>
          <div class="spb-info">
            <small>Contrato exclusivo</small>
            <strong>{{ state.selectedContract().name }}</strong>
          </div>
        </div>

        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.clientActiveTab() === 'inicio'"
            (click)="selectClientTab('inicio')"
          >
            <span class="pnc-ico dark-home">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Início</strong>
              <small>Saúde do contrato e indicadores</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.clientActiveTab() === 'meu-contrato'"
            (click)="selectClientTab('meu-contrato')"
          >
            <span class="pnc-ico red-doc">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#dc2626">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Meu contrato</strong>
              <small>Situação da segurança e equipe</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.clientActiveTab() === 'treinamentos'"
            (click)="selectClientTab('treinamentos')"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Treinamentos</strong>
              <small>Histórico, turmas e evidências</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.clientActiveTab() === 'mais'"
            (click)="selectClientTab('mais')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Linha do Tempo</strong>
              <small>Histórico validado e comunicados</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <div class="sidebar-section-label">ALTERNAR CONTA CLIENTE</div>
          <div class="pdf-nav-list">
            @for (cli of state.clientAccounts; track cli.id) {
              <button
                type="button"
                class="pdf-nav-card"
                [class.active]="state.activeClientAccount() === cli.id"
                (click)="switchClientAccount(cli.id)"
              >
                <span class="pnc-ico dark-briefcase">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#111827">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </span>
                <div class="pnc-text">
                  <strong>{{ cli.shortName }}</strong>
                  <small>{{ cli.contractId }}</small>
                </div>
                <span class="pnc-chevron">›</span>
              </button>
            }

            <button
              type="button"
              class="pdf-nav-card switch-profile-card"
              (click)="goToLogin()"
            >
              <span class="pnc-ico dark-grid">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <div class="pnc-text">
                <strong>Trocar perfil de acesso</strong>
              </div>
              <span class="pnc-chevron">›</span>
            </button>
          </div>
        </div>

      <!-- ================================================================= -->
      <!-- 02 | CONSULTOR (ÁREAS MOKPAT..P950, VISITAS, CARTEIRA, TREINAMENTO)-->
      <!-- ================================================================= -->
      } @else if (state.activeRole() === 'consultor') {
        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="
              isRouteActive('/consultor') &&
              state.consultantActiveTab() === 'minhas-areas'
            "
            (click)="selectConsultantTab('minhas-areas', '/consultor')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Minhas áreas</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="
              isRouteActive('/consultor') &&
              state.consultantActiveTab() === 'nova-visita'
            "
            (click)="selectConsultantTab('nova-visita', '/consultor/visitas')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M12 7v5l3 2" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Visitas e agenda</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="
              isRouteActive('/consultor') &&
              state.consultantActiveTab() === 'carteira'
            "
            (click)="selectConsultantTab('carteira', '/consultor/carteira')"
          >
            <span class="pnc-ico dark-briefcase">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M10 4h4v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4zm0 2v0h4V6h-4z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Meus contratos</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="
              isRouteActive('/consultor') &&
              state.consultantActiveTab() === 'ocorrencias'
            "
            (click)="selectConsultantTab('ocorrencias', '/consultor/ocorrencias')"
          >
            <span class="pnc-ico red-alert">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M1 21h22L12 2 1 21z" fill="#dc2626" />
                <rect x="11" y="9" width="2" height="6" fill="#ffffff" />
                <rect x="11" y="16.5" width="2" height="2" fill="#ffffff" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Ocorrências e validação</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="
              isRouteActive('/consultor') &&
              state.consultantActiveTab() === 'orcamentos'
            "
            (click)="selectConsultantTab('orcamentos', '/consultor/orcamentos')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Orçamentos pendentes</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isRouteActive('/treinamento')"
            (click)="openSharedTrainingModule()"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Treinamento</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-section-label mt-4">
          ÁREAS MOKED
        </div>

        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKPAT')"
            (click)="openConsultantAreaPage('MOKPAT')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#dc2626">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">PAT</span></strong>
              <small>Segurança Patrimonial</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKVIP')"
            (click)="openConsultantAreaPage('MOKVIP')"
          >
            <span class="pnc-ico dark-briefcase">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">VIP</span></strong>
              <small>Proteção Executiva</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKIMP')"
            (click)="openConsultantAreaPage('MOKIMP')"
          >
            <span class="pnc-ico red-doc">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#dc2626">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">IMP</span></strong>
              <small>Implantação</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKLOG')"
            (click)="openConsultantAreaPage('MOKLOG')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">LOG</span></strong>
              <small>Segurança Logística</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKRES')"
            (click)="openConsultantAreaPage('MOKRES')"
          >
            <span class="pnc-ico red-doc">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#dc2626">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-8.5 13.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.1-5.1 1.4 1.4-6.5 6.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">RES</span></strong>
              <small>Segurança Residencial</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('MOKTEC')"
            (click)="openConsultantAreaPage('MOKTEC')"
          >
            <span class="pnc-ico dark-wrench">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.22 0 .43-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>MOK<span class="red">TEC</span></strong>
              <small>Tecnologia e Sistemas</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('P950')"
            (click)="openConsultantAreaPage('P950')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M21 3H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 13H3V5h18v11z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>P950</strong>
              <small>Portaria Remota</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="isConsultantAreaActive('Treinamento')"
            (click)="openConsultantAreaPage('Treinamento')"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Treinamento</strong>
              <small>Capacitação e Turmas</small>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>

      <!-- ================================================================= -->
      <!-- 03 | LÍDER DE POSTO (NO ESTILO EXATO DO MENU DE REFERÊNCIA)        -->
      <!-- ================================================================= -->
      } @else if (state.activeRole() === 'lider') {
        <!-- CAIXA DE POSTO IGUAL AO PRINT DE REFERÊNCIA -->
        <div class="sidebar-posto-box">
          <div class="spb-ico">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="#111827">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"
              />
            </svg>
          </div>
          <div class="spb-info">
            <small>Posto</small>
            <select
              class="spb-select"
              [ngModel]="state.leaderSelectedPost()"
              (ngModelChange)="state.leaderSelectedPost.set($event)"
            >
              @for (post of availablePosts; track post) {
                <option [value]="post">{{ post }}</option>
              }
            </select>
          </div>
          <span class="pnc-chevron">›</span>
        </div>

        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'meu-turno'"
            (click)="selectLeaderTab('meu-turno', '/lider')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="21" height="21" fill="#111827">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Meu turno</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'falta-atraso'"
            (click)="selectLeaderTab('falta-atraso', '/lider/falta-atraso')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M12 7v5l3 2" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Falta ou atraso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'treinamento'"
            (click)="selectLeaderTab('treinamento', '/lider/treinamento')"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Treinamento</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'ocorrencia'"
            (click)="selectLeaderTab('ocorrencia', '/lider/ocorrencia')"
          >
            <span class="pnc-ico red-alert">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M1 21h22L12 2 1 21z" fill="#dc2626" />
                <rect x="11" y="9" width="2" height="6" fill="#ffffff" />
                <rect x="11" y="16.5" width="2" height="2" fill="#ffffff" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Ocorrência</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'sem-alteracao'"
            (click)="selectLeaderTab('sem-alteracao', '/lider/sem-alteracao')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Turno sem alteração</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'pendencias'"
            (click)="selectLeaderTab('pendencias', '/lider/pendencias')"
          >
            <span class="pnc-ico red-doc">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#dc2626">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Pendências do posto</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.leaderActiveTab() === 'historico'"
            (click)="selectLeaderTab('historico', '/lider/historico')"
          >
            <span class="pnc-ico dark-book">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Livro Digital</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>

      <!-- ================================================================= -->
      <!-- 04 | TERCEIRIZADOS (04A TÉCNICO, 04B SUPERVISOR, 04C SLA)         -->
      <!-- ================================================================= -->
      } @else if (state.activeRole() === 'terceirizados') {
        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.thirdPartyActiveTab() === 'ordens-servico'"
            (click)="selectThirdPartyTab('ordens-servico')"
          >
            <span class="pnc-ico dark-wrench">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>04A · Visita Técnica</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.thirdPartyActiveTab() === 'supervisao-posto'"
            (click)="selectThirdPartyTab('supervisao-posto')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M12 7v5l3 2" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>04B · Supervisão de Segurança</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.thirdPartyActiveTab() === 'meu-sla'"
            (click)="selectThirdPartyTab('meu-sla')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>04C · SLA e Multas</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>

      <!-- ================================================================= -->
      <!-- 05 | CENTRAL DE MONITORAMENTO                                     -->
      <!-- ================================================================= -->
      } @else if (state.activeRole() === 'monitoramento') {
        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.centralActiveTab() === 'painel-monitoramento'"
            (click)="selectCentralTab('painel-monitoramento')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M21 3H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 13H3V5h18v11z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Painel de Monitoramento</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.centralActiveTab() === 'novo-evento'"
            (click)="selectCentralTab('novo-evento')"
          >
            <span class="pnc-ico red-alert">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M1 21h22L12 2 1 21z" fill="#dc2626" />
                <rect x="11" y="9" width="2" height="6" fill="#ffffff" />
                <rect x="11" y="16.5" width="2" height="2" fill="#ffffff" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Registrar falha ou ocorrência</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>

      <!-- ================================================================= -->
      <!-- 06 | TREINAMENTO                                                  -->
      <!-- ================================================================= -->
      } @else if (state.activeRole() === 'treinamento') {
        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.trainingActiveTab() === 'visao-equipe'"
            (click)="selectTrainingTab('visao-equipe')"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Equipe e treinamentos</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.trainingActiveTab() === 'turmas-presenca'"
            (click)="selectTrainingTab('turmas-presenca')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Lista de presença e reposições</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.trainingActiveTab() === 'nova-turma'"
            (click)="selectTrainingTab('nova-turma')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M12 7v10M7 12h10" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Abrir nova turma</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.trainingActiveTab() === 'saldo-fv'"
            (click)="selectTrainingTab('saldo-fv')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Cobertura e saldo de FV</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>

      <!-- ================================================================= -->
      <!-- 07 | ALTA GESTÃO (PRESIDÊNCIA E DIRETORES)                        -->
      <!-- ================================================================= -->
      } @else {
        <nav class="pdf-nav-list">
          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'visao-executiva'"
            (click)="selectManagementTab('visao-executiva')"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Visão Executiva</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'atencao-ocorrencias'"
            (click)="selectManagementTab('atencao-ocorrencias')"
          >
            <span class="pnc-ico red-alert">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M1 21h22L12 2 1 21z" fill="#dc2626" />
                <rect x="11" y="9" width="2" height="6" fill="#ffffff" />
                <rect x="11" y="16.5" width="2" height="2" fill="#ffffff" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Atenção Hoje e Ocorrências</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'xray-contrato'"
            (click)="selectManagementTab('xray-contrato')"
          >
            <span class="pnc-ico dark-briefcase">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>X-Ray do Contrato</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'bi-visitas-treinamentos'"
            (click)="selectManagementTab('bi-visitas-treinamentos')"
          >
            <span class="pnc-ico dark-cap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L5 12.68v3.62L12 20l7-3.7v-3.62L12 16.5z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>BI Visitas e Treinamentos</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'decisoes-relatos'"
            (click)="selectManagementTab('decisoes-relatos')"
          >
            <span class="pnc-ico dark-check">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#1f2937" />
                <path d="M8 12.5l2.8 2.8L16.5 9.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Decisões, SLA e Orçamentos</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'auditoria'"
            (click)="selectManagementTab('auditoria')"
          >
            <span class="pnc-ico dark-book">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#111827">
                <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trilha de Auditoria</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>

          <button
            type="button"
            class="pdf-nav-card"
            [class.active]="state.managementActiveTab() === 'modo-tv'"
            (click)="selectManagementTab('modo-tv')"
          >
            <span class="pnc-ico red-circle">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <polygon points="10,8 16,12 10,16" fill="#ffffff" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Sala de Situação (TV)</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </nav>

        <div class="sidebar-role-switcher">
          <button
            type="button"
            class="pdf-nav-card switch-profile-card"
            (click)="goToLogin()"
          >
            <span class="pnc-ico dark-grid">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111827" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div class="pnc-text">
              <strong>Trocar perfil de acesso</strong>
            </div>
            <span class="pnc-chevron">›</span>
          </button>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);

  @Input() mobileOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  readonly availablePosts = [
    'Posto Exemplo',
    'Posto Exemplo · Portaria Principal',
    'Posto 02 · Docas e Expedição',
    'Posto 03 · Perímetro e Eclusa',
  ];

  readonly currentRoleMeta = computed(
    () =>
      this.state.roles.find((r) => r.id === this.state.activeRole()) ??
      this.state.roles[0]
  );

  readonly heroMeta = computed(() => {
    const role = this.state.activeRole();
    switch (role) {
      case 'cliente':
        return {
          title: 'Cliente',
          subtitle: this.state.selectedContract().name,
          avatar: '',
        };
      case 'consultor':
        return {
          title: 'Consultor',
          subtitle: 'Minhas áreas',
          avatar: '/assets/consultor-avatar.png',
        };
      case 'lider':
        return {
          title: 'Líder',
          subtitle: 'Meu turno',
          avatar: '/assets/lider-avatar.png',
        };
      case 'terceirizados':
        return {
          title: 'Terceirizados',
          subtitle: 'Ordens e supervisão',
          avatar: '/assets/terceirizados-avatar.png',
        };
      case 'monitoramento':
        return {
          title: 'Monitoramento',
          subtitle: 'Central CFTV e Rondas',
          avatar: '/assets/monitoramento-avatar.png',
        };
      case 'treinamento':
        return {
          title: 'Treinamento',
          subtitle: 'Turmas e FV',
          avatar: '/assets/treinamento-avatar.png',
        };
      case 'alta-gestao':
      default:
        return {
          title: 'Alta Gestão',
          subtitle: 'Painel executivo BI',
          avatar: '/assets/alta-gestao-avatar.png',
        };
    }
  });

  isRouteActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  isConsultantAreaActive(divCode: DivisionCode): boolean {
    return (
      this.router.url.includes(`/consultor/area/${divCode}`) ||
      (this.state.consultantActiveTab() === 'area-detalhe' &&
        this.state.selectedDivision() === divCode)
    );
  }

  selectClientTab(tab: 'inicio' | 'meu-contrato' | 'treinamentos' | 'mais'): void {
    this.state.clientActiveTab.set(tab);
    this.router.navigate(['/cliente']);
    this.closeMenu.emit();
  }

  switchClientAccount(accountId: 'CLI-A' | 'CLI-B' | 'CLI-C'): void {
    this.state.loginAsClientAccount(accountId);
    this.router.navigate(['/cliente']);
    this.closeMenu.emit();
  }

  selectConsultantTab(
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
    this.closeMenu.emit();
  }

  openConsultantAreaPage(divCode: DivisionCode): void {
    this.state.selectedDivision.set(divCode);
    this.state.consultantActiveTab.set('area-detalhe');
    this.router.navigate(['/consultor/area', divCode]);
    this.closeMenu.emit();
  }

  openSharedTrainingModule(): void {
    this.router.navigate(['/treinamento']);
    this.closeMenu.emit();
  }

  selectLeaderTab(
    tab:
      | 'meu-turno'
      | 'falta-atraso'
      | 'treinamento'
      | 'ocorrencia'
      | 'sem-alteracao'
      | 'pendencias'
      | 'historico',
    routePath: string
  ): void {
    this.state.leaderActiveTab.set(tab);
    this.router.navigate([routePath]);
    this.closeMenu.emit();
  }

  selectThirdPartyTab(tab: 'ordens-servico' | 'supervisao-posto' | 'meu-sla'): void {
    this.state.thirdPartyActiveTab.set(tab);
    this.router.navigate(['/terceirizados']);
    this.closeMenu.emit();
  }

  selectCentralTab(tab: 'painel-monitoramento' | 'novo-evento'): void {
    this.state.centralActiveTab.set(tab);
    this.router.navigate(['/monitoramento']);
    this.closeMenu.emit();
  }

  selectTrainingTab(
    tab: 'visao-equipe' | 'turmas-presenca' | 'nova-turma' | 'saldo-fv'
  ): void {
    this.state.trainingActiveTab.set(tab);
    this.router.navigate(['/treinamento']);
    this.closeMenu.emit();
  }

  selectManagementTab(
    tab:
      | 'visao-executiva'
      | 'atencao-ocorrencias'
      | 'xray-contrato'
      | 'bi-visitas-treinamentos'
      | 'decisoes-relatos'
      | 'auditoria'
      | 'modo-tv'
  ): void {
    this.state.managementActiveTab.set(tab);
    this.router.navigate(['/alta-gestao']);
    this.closeMenu.emit();
  }

  goToLogin(): void {
    this.state.logout();
    this.router.navigate(['/login']);
    this.closeMenu.emit();
  }

  selectRole(role: UserRole): void {
    this.state.setRole(role);
    this.router.navigate(['/' + role]);
    this.closeMenu.emit();
  }
}
