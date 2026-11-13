import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-resolve-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="mk-nav">
      <div class="mk-nav-inner">
        <a routerLink="/home" class="mk-nav-brand">
          <span class="mk-nav-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L4 5.5v6.2c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8V5.5L12 2z" />
              <polyline points="9 12.2 11.2 14.4 15.5 9.8" />
            </svg>
          </span>
          <span class="mk-nav-brand-name">
            <b>Moked</b> <span>Resolve</span>
          </span>
        </a>

        <nav class="mk-nav-links" aria-label="Navegação Moked Resolve">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="mk-nav-link">
            Início
          </a>
          <a routerLink="/resolve" routerLinkActive="active" class="mk-nav-link">
            Canal Resolve
          </a>
          <a routerLink="/registrar" routerLinkActive="active" class="mk-nav-link">
            Registrar
          </a>
          <a routerLink="/acompanhar" routerLinkActive="active" class="mk-nav-link">
            Acompanhar
          </a>
          <a routerLink="/mural" routerLinkActive="active" class="mk-nav-link">
            Mural
          </a>
          <a routerLink="/ranking" routerLinkActive="active" class="mk-nav-link">
            Ranking
          </a>
        </nav>

        <div class="mk-nav-cta-row">
          <a routerLink="/login" class="mk-btn mk-btn-primary mk-btn-sm hidden lg:inline-flex">
            <span>Entrar (Login)</span>
          </a>
          <a routerLink="/registrar" class="mk-btn mk-btn-accent mk-btn-sm hidden lg:inline-flex">
            <span>+ Registrar</span>
          </a>
          <button
            type="button"
            class="mk-nav-mobile-btn lg:hidden"
            aria-label="Alternar menu de navegação"
            [attr.aria-expanded]="mobileOpen()"
            (click)="mobileOpen.set(!mobileOpen())"
          >
            @if (mobileOpen()) {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            }
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="mk-nav-mobile-drawer">
          <div class="grid grid-cols-2 gap-2 mb-2 lg:hidden">
            <a routerLink="/login" (click)="mobileOpen.set(false)" class="!bg-rose-600 !text-white !justify-center text-center font-bold !border-rose-500">
              Entrar (Login)
            </a>
            <a routerLink="/registrar" (click)="mobileOpen.set(false)" class="!bg-slate-900 !text-rose-400 !justify-center text-center font-bold !border-slate-700">
              + Registrar
            </a>
          </div>
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="mobileOpen.set(false)">
            <span>Início (Pré-Login)</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
          <a routerLink="/resolve" routerLinkActive="active" (click)="mobileOpen.set(false)">
            <span>Canal Moked Resolve</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
          <a routerLink="/registrar" routerLinkActive="active" (click)="mobileOpen.set(false)">
            <span>Registrar chamado / ocorrência</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
          <a routerLink="/acompanhar" routerLinkActive="active" (click)="mobileOpen.set(false)">
            <span>Acompanhar protocolo</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
          <a routerLink="/mural" routerLinkActive="active" (click)="mobileOpen.set(false)">
            <span>Mural de elogios</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
          <a routerLink="/ranking" routerLinkActive="active" (click)="mobileOpen.set(false)">
            <span>Ranking operacional</span>
            <span class="text-xs text-slate-500">→</span>
          </a>
        </div>
      }
    </header>
  `,
})
export class ResolveNavbarComponent {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  readonly mobileOpen = signal(false);

  goToOperacao(): void {
    this.state.isLoggedIn.set(true);
    const role = this.state.activeRole();
    this.router.navigateByUrl('/' + role);
  }
}

