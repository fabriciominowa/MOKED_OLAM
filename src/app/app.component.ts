import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/layout/sidebar.component';
import { TopbarComponent } from './core/layout/topbar.component';
import { WhatsappDrawerComponent } from './core/layout/whatsapp-drawer.component';
import { OlamStateService } from './services/olam-state.service';

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
  readonly showWhatsappDrawer = signal<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
}
