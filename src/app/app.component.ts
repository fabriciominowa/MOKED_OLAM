import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './core/layout/sidebar.component';
import { TopbarComponent } from './core/layout/topbar.component';
import { WhatsappDrawerComponent } from './core/layout/whatsapp-drawer.component';
import { OlamStateService } from './services/olam-state.service';

const PUBLIC_RESOLVE_PATHS = [
  '/home',
  '/resolve',
  '/registrar',
  '/acompanhar',
  '/mural',
  '/ranking',
  '/login',
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    WhatsappDrawerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly showWhatsappDrawer = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly isPublicShell = signal<boolean>(true);

  constructor() {
    this.syncShellMode(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((ev) => this.syncShellMode(ev.urlAfterRedirects));
  }

  private syncShellMode(url: string): void {
    const clean = url.split('?')[0] || '/resolve';
    this.isPublicShell.set(
      clean === '/' || PUBLIC_RESOLVE_PATHS.some((p) => clean.startsWith(p))
    );
  }
}
