import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DivisionCode, UserRole } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { MokedShield3dComponent, Shield3DMode } from '../../shared/components/moked-shield-3d.component';
import { ResolveNavbarComponent } from '../resolve/resolve-navbar.component';

interface ClientCaseView {
  id: string;
  code: string;
  segment: 'corporativo' | 'varejo' | 'logistica';
  segmentLabel: string;
  clientTitle: string;
  unit: string;
  address: string;
  division: DivisionCode;
  slaScore: number;
  headcount: number;
  highlight: string;
  overallHealth: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ResolveNavbarComponent,
    MokedShield3dComponent,
  ],
  template: `
    <div #shell class="mk-resolve-shell mk-lp-shell">
      <app-resolve-navbar />

      <!-- 1. PÁGINA INICIAL / HERO EXECUTIVO COM GLOBO HOLOGRÁFICO 3D THREE.JS -->
      <!-- 1. PÁGINA INICIAL / HERO FULL-BLEED 100% 3D IMMERSIVE -->
      <section class="mk-lp-hero-dark">
        <!-- PALCO 3D IMERSIVO FULL-BLEED (OCUPA 100% DA LARGURA E ALTURA DA TELA) -->
        <app-moked-shield-3d
          class="absolute inset-0 w-full h-full z-0 pointer-events-auto"
          [mode]="hero3dMode()"
          #shield3dComp
        />

        <div class="mk-hero-grid items-center">
          <div class="mk-stagger relative z-10 w-full">
            <!-- IDENTIDADE GRUPO MOKED NO HERO -->
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div class="flex items-center gap-3">
                <span class="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-950/80 border border-rose-400/40 shrink-0">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M12 2L4 5.5v6.2c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8V5.5L12 2z" />
                    <polyline points="9 12.2 11.2 14.4 15.5 9.8" />
                  </svg>
                </span>
                <div>
                  <div class="font-display text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                    MOK<span class="text-rose-500">ED</span>
                  </div>
                  <div class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400 mt-1">
                    Grupo Moked · 360°
                  </div>
                </div>
              </div>

              <div class="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-200 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Segurança, Eletrônica &amp; Facilities</span>
              </div>
            </div>

            <h1 class="font-display font-black tracking-tight text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] sm:leading-[1.02] text-white max-w-4xl">
              Fator humano, tecnologia 3D e <span class="text-rose-500">confiança comprovada</span> em cada contrato.
            </h1>

            <p class="text-slate-300 text-sm sm:text-lg lg:text-xl leading-relaxed max-w-2xl mt-4 sm:mt-6 font-normal">
              Portal oficial do <strong class="text-white">Grupo Moked</strong> antes do login. Conheça nossa empresa, clientes atendidos, as 8 divisões operacionais e o canal <strong class="text-white">Moked Resolve</strong>.
            </p>

            <div class="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3.5 mt-6 sm:mt-8">
              <a routerLink="/login" class="mk-btn mk-btn-accent text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 shadow-xl shadow-rose-950/60 w-full sm:w-auto text-center justify-center">
                <span>Entrar no Portal (Login)</span>
                <span aria-hidden="true">→</span>
              </a>
              <button
                type="button"
                (click)="scrollToSection('contato')"
                class="mk-btn mk-btn-hero-white text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 shadow-xl cursor-pointer w-full sm:w-auto text-center justify-center"
              >
                <span>Solicitar Proposta</span>
              </button>
              <a
                routerLink="/registrar"
                class="mk-btn text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-900/90 text-white border border-slate-700 hover:border-slate-500 backdrop-blur-md cursor-pointer w-full sm:w-auto text-center justify-center"
              >
                <span>Canal Moked Resolve</span>
              </a>
            </div>

            <!-- NAVEGAÇÃO RÁPIDA ENTRE AS SEÇÕES -->
            <div class="flex flex-wrap gap-1.5 sm:gap-2 mt-5 sm:mt-7">
              @for (nav of sectionLinks; track nav.id) {
                <button
                  type="button"
                  (click)="scrollToSection(nav.id)"
                  class="text-[11px] sm:text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  {{ nav.label }}
                </button>
              }
            </div>

            <div class="grid grid-cols-3 gap-2 sm:gap-5 mt-6 sm:mt-9 pt-5 sm:pt-7 border-t border-slate-800/80 max-w-xl">
              <div>
                <div class="font-display text-xl sm:text-3xl lg:text-4xl font-black text-white">{{ state.contracts().length }}+</div>
                <div class="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-tight">Contratos ativos</div>
              </div>
              <div>
                <div class="font-display text-xl sm:text-3xl lg:text-4xl font-black text-emerald-400">{{ avgSlaCompliance() }}%</div>
                <div class="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-tight">SLA em campo</div>
              </div>
              <div>
                <div class="font-display text-xl sm:text-3xl lg:text-4xl font-black text-rose-400">{{ state.dbTotalRecords() }}</div>
                <div class="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-tight">Registros ativos</div>
              </div>
            </div>
          </div>

          <!-- ESPAÇO DIREITO 100% LIMPO: SEM CARDS NEM OBSTÁCULOS, VISÃO TOTAL DA PLACA-MÃE E CIRCUITOS 3D MOKED -->
          <div class="relative z-10 hidden lg:block pointer-events-none min-h-[580px] xl:min-h-[680px]" aria-hidden="true"></div>
        </div>
      </section>

      <!-- TRANSIÇÃO 3D IMERSIVA: LOGO MOKED SURGE DO FUNDO EM GIRO 360° + ZOOM ATÉ FRASE DE EFEITO (SEM CARDS LATERAIS) -->
      <section #logoStage class="mk-logo-parallax-track" aria-label="Transição 3D da Logo Moked">
        <div class="mk-logo-sticky-viewport">
          <!-- ILUMINAÇÃO VOLUMÉTRICA DE PROFUNDIDADE -->
          <div class="mk-globe-depth-ambient" aria-hidden="true"></div>

          <!-- BARRA SUPERIOR HUD (OCUPA 100% DA LARGURA NO TOPO) -->
          <div class="w-full border-b border-slate-800/80 pb-2 px-3 z-20 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/70 backdrop-blur-md rounded-xl">
            <div class="flex items-center gap-2">
              <span class="text-rose-500 font-extrabold tracking-wider">// REDE GLOBAL MOKED</span>
              <span class="hidden sm:inline text-slate-600">|</span>
              <span class="hidden sm:inline text-slate-300 font-semibold">CCO 24H · MONITORAMENTO TRIPARTITE &amp; PROTEÇÃO INTEGRADA</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-slate-400 hidden sm:inline">TELEMETRIA:</span>
              <span class="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                100% OPERACIONAL
              </span>
            </div>
          </div>

          <!-- PALCO CENTRAL 100% LIMPO & SEM CARDS LATERAIS: LOGO MOKED 3D + FRASE DE EFEITO -->
          <div class="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center py-6 px-4">
            <!-- HALO DE PROFUNDIDADE VOLUMÉTRICO -->
            <div class="mk-logo-depth-glow" aria-hidden="true"></div>

            <!-- LOGO PRINCIPAL: ESCUDO 3D FLUTUANDO NO NÚCLEO DO GLOBO (PARTE SUPERIOR) -->
            <div class="mk-logo-emerge-core mb-4">
              <div class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[28px] sm:rounded-[34px] bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 flex items-center justify-center shadow-[0_20px_50px_rgba(200,16,46,0.65)] border-2 border-rose-400/60 mb-3 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white drop-shadow-md">
                  <path d="M12 2L4 5.5v6.2c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8V5.5L12 2z" />
                  <polyline points="9 12.2 11.2 14.4 15.5 9.8" />
                </svg>
              </div>
              <div class="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]">
                MOK<span class="text-rose-500">ED</span>
              </div>
              <div class="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.38em] text-slate-300 mt-2.5">
                Grupo Moked · Governança Global 360°
              </div>
            </div>

            <!-- FRASE DE EFEITO POSICIONADA CLARAMENTE ABAIXO DA LOGO (SEM SOBREPOSIÇÃO) -->
            <div class="mk-impact-phrase-layer px-4 w-full">
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-600/25 border border-rose-500/50 text-rose-300 text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 shadow-lg backdrop-blur-md">
                <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                <span>Grupo Moked · Excelência que Protege</span>
              </div>
              <h2 class="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] max-w-xl mx-auto">
                Segurança não se promete. <span class="text-rose-500">Se comprova em cada segundo.</span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed font-medium drop-shadow-md">
                Governança humana, tecnologia ininterrupta 24 horas e transparência total antes mesmo de entrar.
              </p>
              <div class="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10.5px] font-bold text-slate-200">
                  🛡️ Vigilância 24/7
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10.5px] font-bold text-slate-200">
                  ⚡ CCO Integrado
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10.5px] font-bold text-slate-200">
                  🤝 Governança Humana
                </span>
              </div>
            </div>
          </div>

          <!-- BARRA INFERIOR TELEMÉTRICA (OCUPA 100% DA LARGURA NA BASE) -->
          <div class="w-full border-t border-slate-800/80 pt-2.5 pb-2 px-3 z-20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 bg-slate-950/70 backdrop-blur-md rounded-xl">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-slate-300 font-bold">STATUS REDE MOKED:</span>
              <span class="text-emerald-400">100% OPERACIONAL</span>
            </div>
            <div class="hidden sm:flex items-center gap-6">
              <span>POSTOS ATIVOS: <strong class="text-white">1.240+</strong></span>
              <span>SLA MÉDIO: <strong class="text-white">94.8%</strong></span>
              <span>CONFORMIDADE: <strong class="text-white">LGPD COMPLIANT</strong></span>
            </div>
            <div class="flex items-center gap-1.5 text-rose-400 font-bold">
              <span>CONHEÇA NOSSA HISTÓRIA</span>
              <span class="animate-bounce">↓</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SOBRE O GRUPO MOKED (QUEM SOMOS, CRONOLOGIA, ABRANGÊNCIA & CERTIFICAÇÕES) -->
      <section id="sobre" class="mk-section mk-cyber-grid-unified border-y border-slate-800/80 mk-logo-next-curtain">
        <div class="mk-section-wrap">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div class="lg:col-span-5 mk-lp-scroll-depth">
              <span class="mk-section-eyebrow">Sobre o Grupo Moked</span>
              <h2 class="mk-section-title mt-3">
                Governança humana e inteligência operacional para proteger seu patrimônio.
              </h2>
              <p class="text-slate-300 text-base leading-relaxed mt-4">
                O <strong class="text-white">Grupo Moked</strong> atua com excelência na segurança patrimonial, segurança eletrônica, portaria, controle de acesso, logística e facilities. Nosso modelo combina equipes altamente treinadas com rastreamento digital contínuo.
              </p>

              <!-- Missão, Visão e Valores (Design Limpo Integrado Sem Cards Flutuantes) -->
              <div class="space-y-3.5 mt-6">
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 border-l-4 border-l-rose-500">
                  <div class="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Missão</span>
                  </div>
                  <p class="text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Proteger vidas, ativos e rotinas corporativas com transparência, prevenção ativa e resposta imediata.
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 border-l-4 border-l-sky-500">
                  <div class="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                    <span>Visão &amp; Valores</span>
                  </div>
                  <p class="text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Ser referência em governança tripartite (<strong class="text-white">RH · RT · RA</strong>), ética, valorização do colaborador, conformidade LGPD e melhoria contínua.
                  </p>
                </div>
              </div>

              <!-- Área de Abrangência & Certificações -->
              <div class="mt-6 p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-white">
                <div class="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Abrangência &amp; Certificações</span>
                </div>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-200">
                    SP Capital &amp; Paulista
                  </span>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-200">
                    Grande SP &amp; ABC
                  </span>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-200">
                    Corredores Logísticos
                  </span>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    Conformidade LGPD &amp; DPO
                  </span>
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                    Reciclagem &amp; Fundo Verba
                  </span>
                </div>
              </div>
            </div>

            <!-- Cronologia + Pilares -->
            <div class="lg:col-span-7 space-y-5">
              <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
                <div class="flex items-center justify-between gap-2 mb-4">
                  <h3 class="font-display text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Cronologia &amp; Evolução Grupo Moked</span>
                  </h3>
                  <span class="text-xs font-mono font-bold text-rose-400 px-2.5 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40">
                    Trajetória Contínua
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  @for (milestone of timelineMilestones; track milestone.year) {
                    <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60">
                      <span class="font-mono text-xs font-extrabold text-rose-400">{{ milestone.year }}</span>
                      <div class="text-sm font-extrabold text-white mt-1">{{ milestone.title }}</div>
                      <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">{{ milestone.detail }}</p>
                    </div>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (pillar of companyPillars; track pillar.title) {
                  <div class="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                        [ngClass]="pillar.badgeClass"
                      >
                        {{ pillar.icon }}
                      </span>
                      <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                        {{ pillar.tag }}
                      </span>
                    </div>
                    <h4 class="font-display text-base font-extrabold text-white mt-3">
                      {{ pillar.title }}
                    </h4>
                    <p class="text-xs text-slate-400 leading-relaxed mt-1.5">
                      {{ pillar.description }}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. NOSSOS SERVIÇOS & 8 DIVISÕES ESPECIALIZADAS -->
      <section id="servicos" class="mk-section mk-cyber-grid-unified border-b border-slate-800/80">
        <div class="mk-section-wrap">
          <div class="mk-section-head">
            <span class="mk-section-eyebrow">Serviços &amp; Soluções Grupo Moked</span>
            <h2 class="mk-section-title mt-3">Portfólio Completo de Segurança, Tecnologia &amp; Facilities</h2>
            <p class="mk-section-sub">
              Unimos vigilância armada e desarmada, monitoramento eletrônico 24h, portaria e logística através de 8 divisões dedicadas.
            </p>
          </div>

          <!-- 4 Grandes Frentes de Serviço em Cards 3D -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            @for (srv of serviceMacroFronts; track srv.title; let idx = $index) {
              <div class="mk-card-3d-creative p-5" [ngClass]="idx % 2 === 0 ? 'mk-float-3d-a' : 'mk-float-3d-b'">
                <div class="flex items-center justify-between gap-2">
                  <span class="mk-3d-pop-badge text-xs font-extrabold uppercase tracking-wider text-rose-400 font-mono">{{ srv.category }}</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 class="mk-3d-pop font-display text-lg font-extrabold text-white mt-2">{{ srv.title }}</h3>
                <p class="mk-3d-pop text-xs text-slate-400 leading-relaxed mt-2">{{ srv.summary }}</p>
              </div>
            }
          </div>

          <!-- 8 Divisões Operacionais em Cards 3D -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (div of state.divisions; track div.code; let idx = $index) {
              <div
                class="mk-card-3d-creative p-5 flex flex-col justify-between"
                [ngClass]="idx % 2 === 0 ? 'mk-float-3d-a' : 'mk-float-3d-b'"
              >
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="mk-3d-pop-badge px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold shadow-sm">
                      {{ div.code }}
                    </span>
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Ativa</span>
                    </span>
                  </div>
                  <h3 class="mk-3d-pop font-display text-base font-extrabold text-white mt-3.5">
                    {{ div.name }}
                  </h3>
                  <p class="mk-3d-pop text-xs text-slate-400 leading-relaxed mt-1.5">
                    {{ div.description }}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                  @for (field of div.specificFields; track field.key) {
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      {{ field.label }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- 4. CLIENTES, SEGMENTOS ATENDIDOS & DEPOIMENTOS (FULL-BLEED 100% UNIFICADO) -->
      <section
        id="clientes"
        class="mk-section mk-cyber-grid-unified border-b border-slate-800/80 relative overflow-hidden"
      >
        <div class="mk-section-wrap relative z-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-extrabold uppercase tracking-wider"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Nossos Clientes &amp; Segmentos</span>
              </span>
              <h2 class="font-display text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-white">
                Quem confia sua segurança ao Grupo Moked
              </h2>
              <p class="text-slate-300 text-sm md:text-base max-w-2xl mt-2">
                Atendemos torres corporativas, redes de varejo 24h, centros logísticos, instituições de ensino e condomínios com gestão auditável em tempo real.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              @for (tab of segmentFilters; track tab.id) {
                <button
                  type="button"
                  (click)="selectedSegment.set(tab.id)"
                  class="px-3.5 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer"
                  [ngClass]="
                    selectedSegment() === tab.id
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500'
                  "
                >
                  {{ tab.label }}
                </button>
              }
            </div>
          </div>

          <!-- Faixa de Segmentos Atendidos -->
          <div class="flex flex-wrap gap-2.5 mb-8">
            @for (partner of referenceSectors; track partner) {
              <span class="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span class="text-emerald-400">✓</span>
                <span>{{ partner }}</span>
              </span>
            }
          </div>

          <!-- Cases Ativos em Cards 3D -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            @for (client of filteredClientCases(); track client.id; let idx = $index) {
              <article
                class="mk-card-3d-creative p-6 flex flex-col justify-between"
                [ngClass]="idx % 2 === 0 ? 'mk-float-3d-a' : 'mk-float-3d-b'"
              >
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="mk-3d-pop-badge text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                      {{ client.segmentLabel }}
                    </span>
                    <span
                      class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                      [ngClass]="
                        client.overallHealth === 'em-dia'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      "
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{{ client.overallHealth === 'em-dia' ? 'Operação Em Dia' : 'Plano Ativo' }}</span>
                    </span>
                  </div>

                  <h3 class="mk-3d-pop font-display text-xl font-extrabold text-white mt-3">
                    {{ client.clientTitle }}
                  </h3>
                  <div class="text-xs font-semibold text-slate-400 mt-1 font-mono">
                    {{ client.unit }} · {{ client.address }}
                  </div>

                  <p class="mk-3d-pop text-sm text-slate-300 leading-relaxed mt-4">
                    {{ client.highlight }}
                  </p>
                </div>

                <div class="mt-5 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div class="rounded-xl bg-slate-950/80 py-2 px-1 border border-slate-800/60">
                    <div class="text-[10px] text-slate-400 uppercase font-bold">Divisão</div>
                    <div class="text-xs font-extrabold text-white mt-0.5 font-mono">{{ client.division }}</div>
                  </div>
                  <div class="rounded-xl bg-slate-950/80 py-2 px-1 border border-slate-800/60">
                    <div class="text-[10px] text-slate-400 uppercase font-bold">Efetivo</div>
                    <div class="text-xs font-extrabold text-white mt-0.5">
                      {{ client.headcount }} prof.
                    </div>
                  </div>
                  <div class="rounded-xl bg-slate-950/80 py-2 px-1 border border-slate-800/60">
                    <div class="text-[10px] text-slate-400 uppercase font-bold">Visitas SLA</div>
                    <div class="text-xs font-extrabold text-emerald-400 mt-0.5 font-mono">
                      {{ client.slaScore }}%
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- 5. MOKED RESOLVE: COMO FUNCIONA (3 CAMINHOS + 3 PASSOS) -->
      <section id="como-funciona" class="mk-section mk-cyber-grid-unified border-b border-slate-800/80">
        <div class="mk-section-wrap">
          <div class="mk-section-head">
            <span class="mk-section-eyebrow">Canal Moked Resolve · Ouvidoria &amp; SLA</span>
            <h2 class="mk-section-title mt-3">Três caminhos rápidos e três passos transparentes</h2>
            <p class="mk-section-sub">
              Críticas, ideias e elogios ajudam a transformar processos, geram histórico auditável e impulsionam o reconhecimento interno — sem precisar de login.
            </p>
          </div>

          <!-- 3 Caminhos em Cards 3D -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <button type="button" class="mk-card-3d-creative mk-float-3d-a p-6 text-left cursor-pointer flex flex-col justify-between" (click)="startResolveWith('ideia')">
              <div>
                <span class="mk-3d-pop-badge mk-chip mk-chip-ideia mk-chip-dot">Ideia / Melhoria</span>
                <h3 class="mk-3d-pop font-display text-lg font-extrabold text-white mt-3">Sugerir melhoria operacional</h3>
                <p class="mk-3d-pop text-xs text-slate-400 mt-2 leading-relaxed">Proponha otimizações de ronda, controle de acesso, checklist P950 ou escala de turnos.</p>
              </div>
              <span class="text-xs font-bold text-rose-400 mt-5 flex items-center gap-1">Registrar ideia →</span>
            </button>

            <button type="button" class="mk-card-3d-creative mk-float-3d-b p-6 text-left cursor-pointer flex flex-col justify-between" (click)="startResolveWith('critica')">
              <div>
                <span class="mk-3d-pop-badge mk-chip mk-chip-critica mk-chip-dot">Crítica / Ocorrência</span>
                <h3 class="mk-3d-pop font-display text-lg font-extrabold text-white mt-3">Relatar ocorrência ou falha técnica</h3>
                <p class="mk-3d-pop text-xs text-slate-400 mt-2 leading-relaxed">Acione consultoria, liderança de posto ou manutenção CFTV/alarme com SLA imediato.</p>
              </div>
              <span class="text-xs font-bold text-rose-400 mt-5 flex items-center gap-1">Abrir ocorrência →</span>
            </button>

            <button type="button" class="mk-card-3d-creative mk-float-3d-a p-6 text-left cursor-pointer flex flex-col justify-between" (click)="startResolveWith('elogio')">
              <div>
                <span class="mk-3d-pop-badge mk-chip mk-chip-elogio mk-chip-dot">Elogio / Reconhecimento</span>
                <h3 class="mk-3d-pop font-display text-lg font-extrabold text-white mt-3">Reconhecer um profissional ou equipe</h3>
                <p class="mk-3d-pop text-xs text-slate-400 mt-2 leading-relaxed">Valorize colaboradores e turmas no Mural Moked e pontue no Ranking de excelência.</p>
              </div>
              <span class="text-xs font-bold text-rose-400 mt-5 flex items-center gap-1">Enviar elogio →</span>
            </button>
          </div>

          <!-- 3 Passos em Cards 3D -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mk-step-conduit-wrap relative">
            <div class="mk-card-3d-creative mk-float-3d-a p-6 relative z-10 shadow-lg">
              <div class="mk-3d-pop-badge font-mono text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>PASSO 01 // PROTOCOLO</span>
              </div>
              <h3 class="mk-3d-pop font-display text-lg font-bold text-white mb-2">Registre em 1 minuto</h3>
              <p class="mk-3d-pop text-sm text-slate-400 leading-relaxed">
                Envie de forma identificada (somando pontos no Ranking) ou <strong class="text-white">anônima</strong> com sigilo total alinhado à LGPD.
              </p>
            </div>
            <div class="mk-card-3d-creative mk-float-3d-b p-6 relative z-10 shadow-lg">
              <div class="mk-3d-pop-badge font-mono text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>PASSO 02 // TRIAGEM CCO</span>
              </div>
              <h3 class="mk-3d-pop font-display text-lg font-bold text-white mb-2">O setor certo responde</h3>
              <p class="mk-3d-pop text-sm text-slate-400 leading-relaxed">
                Gera protocolo único (<span class="font-mono text-rose-400">MKD-XXX</span>) com direcionamento automático para a divisão e controle de prazo.
              </p>
            </div>
            <div class="mk-card-3d-creative mk-float-3d-a p-6 relative z-10 shadow-lg">
              <div class="mk-3d-pop-badge font-mono text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>PASSO 03 // AUDITORIA</span>
              </div>
              <h3 class="mk-3d-pop font-display text-lg font-bold text-white mb-2">Acompanhe &amp; vire destaque</h3>
              <p class="mk-3d-pop text-sm text-slate-400 leading-relaxed">
                Converse pelo histórico do protocolo até o desfecho e acompanhe ideias aprovadas no Mural e conquistas no Ranking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. MURAL DE IDEIAS/DEPOIMENTOS & RANKING DE CONQUISTAS -->
      <section id="mural-ranking" class="mk-section mk-cyber-grid-unified border-b border-slate-800/80">
        <div class="mk-section-wrap">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <!-- Mural Público & Depoimentos -->
            <div class="lg:col-span-7 flex flex-col">
              <div class="flex flex-wrap items-end justify-between gap-4 mb-5">
                <div>
                  <span class="mk-section-eyebrow">Mural Público · Depoimentos &amp; Elogios</span>
                  <h2 class="font-display text-2xl md:text-3xl font-extrabold text-white mt-2">
                    Reconhecimento visível para toda a empresa
                  </h2>
                </div>
                <a routerLink="/mural" class="text-xs font-bold text-rose-400 hover:underline whitespace-nowrap">
                  Abrir Mural →
                </a>
              </div>

              <div class="flex-1 flex flex-col justify-between gap-4">
                @for (praise of featuredPraises(); track praise.id) {
                  <article class="mk-card-3d-creative p-5 shadow-lg">
                    <div class="flex items-center justify-between gap-2 text-xs">
                      <span class="mk-3d-pop-badge px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-extrabold font-mono">
                        {{ praise.division }}
                      </span>
                      <span class="text-slate-400 font-semibold font-mono">{{ praise.date }}</span>
                    </div>
                    <h3 class="mk-3d-pop font-display text-base font-extrabold text-white mt-2.5">
                      {{ praise.title }}
                    </h3>
                    <p class="mk-3d-pop text-sm text-slate-300 leading-relaxed mt-1.5">
                      “{{ praise.message }}”
                    </p>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div class="text-xs">
                        <strong class="text-white">{{ praise.author }}</strong>
                        <span class="text-slate-400"> · {{ praise.authorRole }}</span>
                      </div>
                      <button
                        type="button"
                        (click)="state.toggleMuralLike(praise.id)"
                        class="text-xs font-extrabold px-3 py-1 rounded-full border transition-colors cursor-pointer"
                        [ngClass]="
                          praise.likedByMe
                            ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-950/40'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-rose-400'
                        "
                      >
                        ★ {{ praise.likes }} Aplausos
                      </button>
                    </div>
                  </article>
                }
              </div>
            </div>

            <!-- Ranking & Conquistas -->
            <div class="lg:col-span-5 flex flex-col">
              <div class="flex flex-wrap items-end justify-between gap-4 mb-5">
                <div>
                  <span class="mk-section-eyebrow text-amber-400">Ranking &amp; Conquistas</span>
                  <h2 class="font-display text-2xl md:text-3xl font-extrabold text-white mt-2">
                    Trilha de Engajamento Moked
                  </h2>
                </div>
                <a routerLink="/ranking" class="text-xs font-bold text-rose-400 hover:underline whitespace-nowrap">
                  Ver Ranking →
                </a>
              </div>

              <div class="mk-card-3d-creative p-6 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    +10 pts por registro identificado, +50 pts por ideia implementada e bônus por sequência de entregas.
                  </p>

                  <div class="flex flex-wrap gap-1.5 mt-4">
                    @for (lvl of achievementLevels; track lvl) {
                      <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                        🏅 {{ lvl }}
                      </span>
                    }
                  </div>
                </div>

                <div class="flex-1 flex flex-col justify-between gap-3 mt-5">
                  @for (member of topRankingMembers(); track member.id; let idx = $index) {
                    <div class="mk-card-3d-creative px-4 py-3 flex items-center justify-between gap-3 transition-colors">
                      <div class="flex items-center gap-3 min-w-0">
                        <span
                          class="w-8 h-8 rounded-xl flex items-center justify-center font-display text-sm font-black shrink-0 shadow-sm"
                          [ngClass]="
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                              : idx === 1
                                ? 'bg-slate-300 text-slate-900 shadow-slate-300/20'
                                : 'bg-rose-600/30 text-rose-300 border border-rose-500/30'
                          "
                        >
                          #{{ idx + 1 }}
                        </span>
                        <div class="min-w-0">
                          <div class="text-sm font-extrabold text-white truncate">{{ member.name }}</div>
                          <div class="text-[11px] text-slate-400 truncate font-mono">
                            {{ member.division }} · {{ member.streakDays }} dias em sequência
                          </div>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="font-display text-sm font-extrabold text-amber-300">
                          {{ member.points }} pts
                        </div>
                        <div class="text-[10px] text-emerald-400 font-bold font-mono">
                          {{ member.resolvedCount }} resoluções
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. PERGUNTAS FREQUENTES (FAQ) & LGPD -->
      <section id="faq" class="mk-section mk-cyber-grid-unified border-b border-slate-800/80">
        <div class="mk-section-wrap">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-5">
              <span class="mk-section-eyebrow">FAQ &amp; Privacidade LGPD</span>
              <h2 class="mk-section-title mt-3">Dúvidas Frequentes sobre o Canal &amp; Dados</h2>
              <p class="text-sm text-slate-300 leading-relaxed mt-3">
                Transparência total no tratamento de relatos, envio anônimo, emissão de código exclusivo sem login e contato direto com nosso Encarregado de Dados (DPO).
              </p>
              <div class="mk-card-3d-creative mt-6 p-5 shadow-lg border-l-4 border-l-rose-500">
                <div class="mk-3d-pop text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Canal DPO · LGPD Grupo Moked</span>
                </div>
                <div class="mk-3d-pop text-sm font-bold text-white mt-1.5 font-mono">
                  dpo&#64;grupomoked.com.br
                </div>
                <p class="mk-3d-pop text-xs text-slate-400 mt-2 leading-relaxed">
                  Todos os chamados seguem a Lei nº 13.709/2018 (LGPD), com trilha auditável e sigilo garantido nos envios anônimos.
                </p>
              </div>
            </div>

            <div class="lg:col-span-7 space-y-3">
              @for (item of faqItems; track item.q; let idx = $index) {
                <div class="rounded-2xl overflow-hidden border border-slate-800 bg-[#080f1e] shadow-lg transition-all hover:border-slate-700">
                  <button
                    type="button"
                    (click)="toggleFaq(idx)"
                    class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-display text-base font-extrabold text-white transition-colors cursor-pointer border-none outline-none"
                    style="background-color: #0d162b !important; color: #ffffff !important;"
                  >
                    <span class="text-white font-bold text-base leading-snug drop-shadow-sm" style="color: #ffffff !important;">{{ item.q }}</span>
                    <span class="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 font-mono text-base flex items-center justify-center shrink-0">
                      {{ openFaqIndex() === idx ? '−' : '+' }}
                    </span>
                  </button>
                  @if (openFaqIndex() === idx) {
                    <div class="px-6 pb-5 pt-3 text-sm text-slate-300 leading-relaxed border-t border-slate-800/80" style="background-color: #060b17 !important; color: #cbd5e1 !important;">
                      {{ item.a }}
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- 8. PORTAIS DE LOGIN (7 PERFIS) + CONTATO / ORÇAMENTO & ATENDIMENTO 24H -->
      <section id="contato" class="mk-section mk-cyber-grid-unified">
        <div class="mk-section-wrap space-y-12">
          <!-- Acesso aos 7 Perfis -->
          <div>
            <div class="mk-section-head">
              <span class="mk-section-eyebrow">Acesso Corporativo OLAM 360</span>
              <h2 class="mk-section-title mt-3">Selecione seu Perfil e Faça Login</h2>
              <p class="mk-section-sub">
                Cada perfil acessa os 20 contratos, indicadores RH/RT/RA e planos de ação conforme suas permissões.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (role of state.roles; track role.id) {
                <button
                  type="button"
                  (click)="goToLoginWithRole(role.id)"
                  class="mk-card-3d-creative text-left p-5 hover:border-rose-400 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="mk-3d-pop-badge text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono group-hover:border-rose-500/50 group-hover:text-rose-400">
                        {{ role.code }}
                      </span>
                      <span class="text-sm font-bold text-slate-400 group-hover:text-rose-400 transition-colors">
                        Entrar →
                      </span>
                    </div>
                    <h3 class="mk-3d-pop font-display text-lg font-extrabold text-white mt-3">
                      {{ role.shortLabel }}
                    </h3>
                    <p class="mk-3d-pop text-xs text-slate-400 mt-1 leading-relaxed">
                      {{ role.scopeDescription }}
                    </p>
                  </div>
                </button>
              }

              <a
                routerLink="/resolve"
                class="mk-card-3d-creative p-5 bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 border border-rose-500/40 text-white shadow-lg flex flex-col justify-between"
              >
                <div>
                  <span class="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-800/50 border border-rose-400/30 text-rose-200">
                    Sem Login
                  </span>
                  <h3 class="font-display text-xl font-extrabold mt-3 text-white">Moked Resolve</h3>
                  <p class="text-xs text-rose-200/80 mt-1.5 leading-relaxed">
                    Acesso livre para registrar ideias, críticas ou elogios e acompanhar pelo código de protocolo.
                  </p>
                </div>
                <div class="mt-4 text-xs font-extrabold text-rose-300 flex items-center gap-1">Abrir Moked Resolve →</div>
              </a>
            </div>
          </div>

          <!-- Fale Conosco / Solicitar Proposta + Canais 24h & Matriz -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mk-card-3d-creative p-6 md:p-8 shadow-xl">
            <div class="lg:col-span-6">
              <span class="mk-section-eyebrow">Fale Conosco · Novos Contratos</span>
              <h2 class="font-display text-2xl md:text-3xl font-extrabold text-white mt-2">
                Solicite uma Proposta Comercial Moked
              </h2>
              <p class="text-sm text-slate-300 mt-2 leading-relaxed">
                Precisa de vigilância patrimonial, portaria 24h, CFTV monitorado ou facilities? Envie seus dados para gerarmos um protocolo imediato de atendimento consultivo.
              </p>

              <form (ngSubmit)="submitCommercialContact()" class="space-y-3.5 mt-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Nome / Empresa *</label>
                    <input
                      type="text"
                      name="contactName"
                      [(ngModel)]="contactName"
                      required
                      placeholder="Ex.: Condomínio Paulista / João"
                      class="w-full rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1">Divisão de Interesse</label>
                    <select
                      name="contactDivision"
                      [(ngModel)]="contactDivision"
                      class="w-full rounded-xl border border-slate-700 bg-slate-900 text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                    >
                      @for (div of state.divisions; track div.code) {
                        <option [value]="div.code">{{ div.code }} · {{ div.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Cidade / Endereço da Operação</label>
                  <input
                    type="text"
                    name="contactLocation"
                    [(ngModel)]="contactLocation"
                    placeholder="Ex.: Av. Paulista, São Paulo - SP"
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Escopo desejado *</label>
                  <textarea
                    name="contactMessage"
                    [(ngModel)]="contactMessage"
                    required
                    rows="3"
                    placeholder="Descreva os postos, turnos, câmeras ou necessidades de segurança..."
                    class="w-full rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                  ></textarea>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" class="mk-btn mk-btn-accent cursor-pointer">
                    Enviar Solicitação Comercial →
                  </button>
                  @if (lastContactProtocol()) {
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full">
                      ✓ Protocolo {{ lastContactProtocol() }} registrado!
                    </span>
                  }
                </div>
              </form>
            </div>

            <div class="lg:col-span-6 space-y-4">
              <div class="mk-card-3d-creative text-white p-6">
                <div class="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                  Atendimento 24h &amp; Emergência CCO
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <div class="text-xs text-slate-400">Matriz São Paulo · Capital</div>
                    <div class="font-extrabold text-white mt-0.5">(11) 4004-7790 · CCO 24h</div>
                    <div class="text-xs text-slate-400 mt-0.5">Av. Paulista, 1450 · Bela Vista</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400">Bases Regionais</div>
                    <div class="font-extrabold text-white mt-0.5">Grande SP · Campinas · ABC</div>
                    <div class="text-xs text-slate-400 mt-0.5">Despacho operacional imediato</div>
                  </div>
                </div>
              </div>

              <div class="mk-card-3d-creative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                    Carreiras · Trabalhe Conosco
                  </div>
                  <h3 class="font-display text-lg font-extrabold text-white mt-1">
                    Faça parte das equipes Grupo Moked
                  </h3>
                  <p class="text-xs text-slate-400 mt-1">
                    Vigilantes, controladores de acesso, operadores CCO e técnicos de CFTV.
                  </p>
                </div>
                <a routerLink="/registrar" class="mk-btn mk-btn-primary whitespace-nowrap cursor-pointer">
                  Enviar Candidatura / Ideia →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER CORPORATIVO -->
      <footer class="bg-slate-950 text-slate-300 py-10 px-6 border-t border-slate-800">
        <div class="max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="font-display text-lg font-extrabold text-white">
              Grupo MOK<span class="text-rose-500">ED</span> · Segurança, Tecnologia &amp; Facilities
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Portal Institucional, Clientes &amp; Moked Resolve · LGPD DPO · Base TypeScript ({{ state.dbTotalRecords() }} registros)
            </p>
          </div>
          <div class="flex flex-wrap gap-5 text-xs font-semibold">
            <a routerLink="/login" class="text-white hover:underline">Entrar (Login)</a>
            <a routerLink="/resolve" class="hover:text-white">Moked Resolve</a>
            <a routerLink="/registrar" class="hover:text-white">Registrar Chamado</a>
            <a routerLink="/acompanhar" class="hover:text-white">Acompanhar Protocolo</a>
            <a routerLink="/mural" class="hover:text-white">Mural</a>
            <a routerLink="/ranking" class="hover:text-white">Ranking</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  @ViewChild('shell', { static: true }) shellRef!: ElementRef<HTMLDivElement>;
  @ViewChild('logoStage', { static: true }) logoStageRef!: ElementRef<HTMLElement>;
  @ViewChild(MokedShield3dComponent) shield3dComp?: MokedShield3dComponent;

  readonly hero3dMode = signal<Shield3DMode>('shield');
  readonly selectedSegment = signal<'todos' | 'corporativo' | 'varejo' | 'logistica'>('todos');
  readonly openFaqIndex = signal<number | null>(0);
  readonly lastContactProtocol = signal<string | null>(null);

  contactName = '';
  contactDivision: DivisionCode = 'MOKPAT';
  contactLocation = '';
  contactMessage = '';

  readonly sectionLinks = [
    { id: 'sobre', label: 'Sobre o Grupo' },
    { id: 'servicos', label: 'Serviços & Divisões' },
    { id: 'clientes', label: 'Clientes & Cases' },
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'mural-ranking', label: 'Mural & Ranking' },
    { id: 'faq', label: 'FAQ & LGPD' },
    { id: 'contato', label: 'Contato & Login' },
  ];

  readonly segmentFilters: { id: 'todos' | 'corporativo' | 'varejo' | 'logistica'; label: string }[] = [
    { id: 'todos', label: 'Todos os Segmentos' },
    { id: 'corporativo', label: 'Corporativo & Sedes' },
    { id: 'varejo', label: 'Varejo & Portaria 24h' },
    { id: 'logistica', label: 'Logística & Condomínios' },
  ];

  setHero3dMode(mode: Shield3DMode): void {
    this.hero3dMode.set(mode);
  }

  triggerBoot(): void {
    this.shield3dComp?.rebootSystem();
  }

  readonly referenceSectors = [
    'Torres Corporativas Paulista',
    'Redes de Varejo 24h',
    'Centros Logísticos & Docas',
    'Condomínios Alto Padrão',
    'Instituições de Ensino & Saúde',
  ];

  readonly timelineMilestones = [
    {
      year: 'Fase 01',
      title: 'Segurança Patrimonial & Portaria',
      detail: 'Consolidação de equipes presenciais com supervisão de campo dedicada.',
    },
    {
      year: 'Fase 02',
      title: 'Central CCO 24h & MOKTEC',
      detail: 'Integração de CFTV, alarmes, controle de acesso biométrico e despacho técnico.',
    },
    {
      year: 'Fase 03',
      title: '8 Divisões & Academia Própria',
      detail: 'Especialização por segmento (MOKLOG, MOKIMP, MOKVIP, P950) e reciclagem contínua.',
    },
    {
      year: 'Atual',
      title: 'OLAM 360 & Moked Resolve',
      detail: 'Transparência em tempo real para clientes, diretoria e equipes com trilha LGPD.',
    },
  ];

  readonly serviceMacroFronts = [
    {
      category: 'Vigilância',
      title: 'Segurança Patrimonial & Privada',
      summary: 'Vigilância ostensiva, ronda motorizada, escolta e proteção executiva VSPP.',
    },
    {
      category: 'Eletrônica',
      title: 'Monitoramento & CFTV 24h',
      summary: 'Sensoriamento perimetral, portaria remota, biometria facial e pronto atendimento técnico.',
    },
    {
      category: 'Facilities',
      title: 'Portaria, Recepção & Controle',
      summary: 'Triagem ágil de visitantes e prestadores, recepção corporativa e checklists digitais.',
    },
    {
      category: 'Gestão & Logística',
      title: 'Logística, P950 & Treinamento',
      summary: 'Conferência de carga, prontidão de crise, auditoria RH/RT/RA e reciclagem de equipes.',
    },
  ];

  readonly companyPillars = [
    {
      icon: '🛡️',
      tag: 'Pilar 01',
      title: 'Governança Tripartite (RH · RT · RA)',
      description:
        'Acompanhamento simultâneo de Recursos Humanos, Técnicos e Relacionamento antes de desvios.',
      badgeClass: 'bg-rose-100 text-rose-700',
    },
    {
      icon: '📡',
      tag: 'Pilar 02',
      title: 'Central CCO 24/7 Integrada',
      description:
        'Telemetria contínua de câmeras e ocorrências com acionamento imediato de técnicos em campo.',
      badgeClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      icon: '🎓',
      tag: 'Pilar 03',
      title: 'Capacitação Fundo Verba',
      description:
        'Treinamento presencial contínuo nos postos com controle de presença e cobertura de turnos.',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: '⚡',
      tag: 'Pilar 04',
      title: 'Moked Resolve Transparente',
      description:
        'Canal direto para ideias, críticas e elogios com SLA público, protocolo e ranking de engajamento.',
      badgeClass: 'bg-amber-100 text-amber-700',
    },
  ];

  readonly achievementLevels = [
    'Primeira Voz',
    'Olhar Atento',
    'Voz Crítica',
    'Embaixador',
    'Catalisador',
  ];

  readonly faqItems = [
    {
      q: 'Posso registrar uma manifestação no Moked Resolve sem fazer login ou de forma anônima?',
      a: 'Sim. O canal Moked Resolve funciona antes do login. Ao enviar de forma anônima, nenhum dado pessoal identificável é vinculado ao relato, garantindo sigilo total.',
    },
    {
      q: 'Como acompanho o andamento de um chamado aberto sem login?',
      a: 'Logo após o envio é gerado um código único (ex.: MKD-105). Basta inseri-lo na página Acompanhar Protocolo ou clicar em qualquer item do feed ao vivo.',
    },
    {
      q: 'Como funciona o direcionamento para as divisões da Moked?',
      a: 'O sistema roteia automaticamente sua solicitação conforme a divisão escolhida (MOKPAT, MOKTEC, MOKLOG, etc.) e notifica o consultor responsável com prazo de SLA.',
    },
    {
      q: 'Como funciona o Ranking e as Conquistas de engajamento?',
      a: 'Colaboradores e usuários identificados acumulam pontos por contribuições válidas (+10 pts por registro, +50 pts por ideia aprovada) e sobem pelos níveis Primeira Voz até Catalisador. Registros anônimos não participam do ranking.',
    },
    {
      q: 'Meus dados estão protegidos pela LGPD?',
      a: 'Sim. Todo tratamento segue a LGPD (Lei nº 13.709/2018) com trilhas auditáveis de acesso e canal direto com nosso Encarregado de Dados pelo e-mail dpo@grupomoked.com.br.',
    },
  ];

  readonly totalHeadcount = computed(() =>
    this.state.contracts().reduce((acc, c) => acc + c.teamMetrics.avgHeadcount, 0)
  );

  readonly avgSlaCompliance = computed(() => {
    const list = this.state.contracts();
    if (!list.length) return 94;
    const sum = list.reduce((acc, c) => acc + c.gauges.plannedVisits, 0);
    return Math.round(sum / list.length);
  });

  readonly previewFeed = computed(() =>
    this.state.occurrences().slice(0, 3).map((o) => ({
      code: o.code,
      title: o.title,
      division: o.division,
      status: o.status === 'validada' ? 'Validado' : 'Em andamento',
      kind: o.status === 'validada' ? ('elogio' as const) : ('critica' as const),
    }))
  );

  readonly clientCases = computed<ClientCaseView[]>(() => {
    const baseContracts = this.state.contracts().slice(0, 3);
    const segmentMeta: Record<
      string,
      { segment: 'corporativo' | 'varejo' | 'logistica'; label: string; title: string; highlight: string }
    > = {
      'CT-A': {
        segment: 'corporativo',
        label: 'Corporativo & Sedes',
        title: 'Torre Corporativa Paulista',
        highlight:
          'Controle de acesso biométrico executivo, segurança patrimonial e recepção com zero interrupções críticas no trimestre.',
      },
      'CT-B': {
        segment: 'varejo',
        label: 'Varejo & Portaria 24h',
        title: 'Rede Varejista · Loja 24 Paulista',
        highlight:
          'Operação híbrida de portaria 24h integrada ao CFTV da Central Moked com triagem de 140+ prestadores por dia.',
      },
      'CT-C': {
        segment: 'logistica',
        label: 'Logística & Condomínios',
        title: 'Complexo Logístico & Carga Segura',
        highlight:
          'Monitoramento perimetral, conferência de docas e prontidão MOKLOG com auditoria contínua de rondas e SLA.',
      },
    };

    return baseContracts.map((c) => {
      const meta = segmentMeta[c.id] ?? {
        segment: 'corporativo' as const,
        label: 'Cliente Corporativo',
        title: c.name,
        highlight: c.health.raSummary,
      };
      return {
        id: c.id,
        code: c.code,
        segment: meta.segment,
        segmentLabel: meta.label,
        clientTitle: meta.title,
        unit: c.unit,
        address: c.address,
        division: c.division,
        slaScore: c.gauges.plannedVisits,
        headcount: c.teamMetrics.avgHeadcount,
        highlight: meta.highlight,
        overallHealth: c.health.overall,
      };
    });
  });

  readonly filteredClientCases = computed(() => {
    const seg = this.selectedSegment();
    const cases = this.clientCases();
    return seg === 'todos' ? cases : cases.filter((item) => item.segment === seg);
  });

  readonly featuredPraises = computed(() => this.state.muralPraises().slice(0, 3));
  readonly topRankingMembers = computed(() => this.state.rankingMembers().slice(0, 4));

  private cleanupParallax?: () => void;

  ngAfterViewInit(): void {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    this.ngZone.runOutsideAngular(() => {
      const el = this.shellRef?.nativeElement;
      if (!el) return;

      let rafPending = false;
      let mx = 0;
      let my = 0;
      let sy = 0;
      let lp = 0;

      const commit = () => {
        rafPending = false;
        const spinT = Math.min(lp / 0.65, 1);
        const spinEase = 1 - Math.pow(1 - spinT, 3);
        const spinDeg = spinEase * 360;
        const zoom = 0.45 + spinEase * 0.70 + Math.max(0, lp - 0.65) * 0.25;

        const pt = Math.min(Math.max((lp - 0.50) / 0.28, 0), 1);
        const phraseEase = 1.0;
        const logoAlpha = 1.0;
        const logoBlur = 0;
        const phraseY = 0;
        const phraseBlur = 0;

        el.style.setProperty('--mx', mx.toFixed(4));
        el.style.setProperty('--my', my.toFixed(4));
        el.style.setProperty('--sy', sy.toFixed(4));
        el.style.setProperty('--lp', lp.toFixed(4));
        el.style.setProperty('--spin-deg', spinDeg.toFixed(2));
        el.style.setProperty('--zoom', zoom.toFixed(4));
        el.style.setProperty('--logo-alpha', logoAlpha.toFixed(4));
        el.style.setProperty('--logo-blur', `${logoBlur.toFixed(2)}px`);
        el.style.setProperty('--phrase-alpha', phraseEase.toFixed(4));
        el.style.setProperty('--phrase-y', `${phraseY.toFixed(2)}px`);
        el.style.setProperty('--phrase-blur', `${phraseBlur.toFixed(2)}px`);
      };

      const scheduleCommit = () => {
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(commit);
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        mx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
        my = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
        scheduleCommit();
      };

      const onScroll = () => {
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );
        sy = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

        const stageEl = this.logoStageRef?.nativeElement;
        if (stageEl) {
          const rect = stageEl.getBoundingClientRect();
          const vh = Math.max(window.innerHeight, 1);
          const passed = vh - rect.top;
          const total = vh * 1.35;
          lp = Math.min(Math.max(passed / total, 0), 1);
        }
        scheduleCommit();
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      this.cleanupParallax = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', onScroll);
      };
    });
  }

  ngOnDestroy(): void {
    this.cleanupParallax?.();
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.update((curr) => (curr === index ? null : index));
  }

  trackCode(code: string): void {
    this.router.navigate(['/acompanhar'], { queryParams: { code } });
  }

  startResolveWith(kind: 'ideia' | 'critica' | 'elogio'): void {
    this.router.navigate(['/registrar'], { queryParams: { kind } });
  }

  goToLoginWithRole(role: UserRole): void {
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  submitCommercialContact(): void {
    const name = this.contactName.trim();
    const msg = this.contactMessage.trim();
    if (!name || !msg) return;

    const firstContractId = this.state.contracts()[0]?.id ?? 'CT-A';
    const protocol = this.state.registerResolveTicket({
      kind: 'ideia',
      contractId: firstContractId,
      division: this.contactDivision,
      location: this.contactLocation.trim() || 'São Paulo · Atendimento Comercial',
      title: `Solicitação Comercial: ${name}`,
      description: msg,
      priority: 'alta',
      anonymous: false,
      reporterName: name,
    });

    this.lastContactProtocol.set(protocol);
    this.contactName = '';
    this.contactLocation = '';
    this.contactMessage = '';
  }
}
