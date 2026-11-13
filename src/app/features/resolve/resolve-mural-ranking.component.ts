import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DivisionCode } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';
import { ResolveNavbarComponent } from './resolve-navbar.component';

@Component({
  selector: 'app-resolve-mural',
  standalone: true,
  imports: [CommonModule, RouterLink, ResolveNavbarComponent],
  template: `
    <div class="mk-resolve-shell">
      <app-resolve-navbar />

      <main class="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span class="mk-section-eyebrow">MURAL DE RECONHECIMENTO · GRUPO MOKED</span>
            <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-moked-ink mt-1">
              Mural de elogios e destaques em campo
            </h1>
            <p class="text-sm text-moked-muted mt-1">
              Boas práticas e reconhecimentos enviados por clientes, líderes e consultores em toda a operação.
            </p>
          </div>
          <a routerLink="/registrar" [queryParams]="{ tipo: 'elogio' }" class="mk-btn mk-btn-accent">
            + Enviar um elogio agora
          </a>
        </div>

        <!-- CHIPS DE DIVISÃO -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            class="mk-filter-chip"
            [class.active]="divisionFilter() === 'Todas'"
            (click)="divisionFilter.set('Todas')"
          >
            Todas as divisões ({{ state.muralPraises().length }})
          </button>
          @for (div of ['MOKPAT', 'MOKTEC', 'MOKLOG', 'Treinamento']; track div) {
            <button
              type="button"
              class="mk-filter-chip"
              [class.active]="divisionFilter() === div"
              (click)="divisionFilter.set($any(div))"
            >
              {{ div }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (praise of filteredPraises(); track praise.id) {
            <article class="mk-surface p-6 flex flex-col justify-between gap-4">
              <div>
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div class="flex items-center gap-3">
                    <span class="mk-avatar" [attr.data-tone]="praise.tone">
                      {{ initials(praise.recipient) }}
                    </span>
                    <div>
                      <strong class="block text-sm font-extrabold text-moked-ink">
                        Para: {{ praise.recipient }}
                      </strong>
                      <small class="text-xs text-moked-muted">{{ praise.contractId }} · {{ praise.division }}</small>
                    </div>
                  </div>
                  <span class="mk-chip mk-chip-elogio">Elogio</span>
                </div>

                <h2 class="font-display text-lg font-bold text-moked-ink mb-1.5">
                  {{ praise.title }}
                </h2>
                <p class="text-sm text-moked-muted leading-relaxed">
                  {{ praise.message }}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div class="text-xs text-slate-500">
                  Por <strong>{{ praise.author }}</strong> · {{ praise.date }}
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                  [class.bg-rose-50]="praise.likedByMe"
                  [class.border-moked-crimson]="praise.likedByMe"
                  [class.text-moked-crimson]="praise.likedByMe"
                  [class.bg-slate-50]="!praise.likedByMe"
                  [class.border-slate-200]="!praise.likedByMe"
                  (click)="state.toggleMuralLike(praise.id)"
                >
                  <span>👏</span>
                  <span>{{ praise.likes }}</span>
                </button>
              </div>
            </article>
          }
        </div>
      </main>
    </div>
  `,
})
export class ResolveMuralComponent {
  readonly state = inject(OlamStateService);
  readonly divisionFilter = signal<DivisionCode | 'Todas'>('Todas');

  readonly filteredPraises = computed(() => {
    const f = this.divisionFilter();
    return this.state
      .muralPraises()
      .filter((p) => f === 'Todas' || p.division === f);
  });

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('');
  }
}

@Component({
  selector: 'app-resolve-ranking',
  standalone: true,
  imports: [CommonModule, ResolveNavbarComponent],
  template: `
    <div class="mk-resolve-shell">
      <app-resolve-navbar />

      <main class="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <span class="mk-section-eyebrow">ENGAJAMENTO &amp; PERFORMANCE · MOKED RESOLVE</span>
          <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-moked-ink mt-1">
            Ranking operacional e pódio de excelência
          </h1>
          <p class="text-sm text-moked-muted mt-2">
            Reconhecendo líderes, consultores, técnicos e instrutores com maior taxa de resolução no prazo e dias consecutivos sem ocorrências críticas.
          </p>
        </div>

        <!-- PÓDIO TOP 3 -->
        @if (topThree().length >= 3) {
          <section class="mk-podium-row mb-10" aria-label="Pódio Top 3 Moked">
            <!-- 2º LUGAR -->
            <div class="mk-podium-card">
              <div class="mk-podium-medal silver">2º</div>
              <span class="mk-avatar mk-avatar-lg mx-auto" [attr.data-tone]="topThree()[1].tone">
                {{ initials(topThree()[1].name) }}
              </span>
              <h2 class="font-display text-base font-extrabold text-moked-ink mt-2">
                {{ topThree()[1].name }}
              </h2>
              <p class="text-xs text-moked-muted mb-3">{{ topThree()[1].roleLabel }}</p>
              <div class="font-mono text-xl font-extrabold text-moked-ink">
                {{ topThree()[1].points }} pts
              </div>
              <div class="text-xs font-bold text-amber-600 mt-1">
                🔥 {{ topThree()[1].streakDays }} dias em dia
              </div>
            </div>

            <!-- 1º LUGAR -->
            <div class="mk-podium-card border-2 border-moked-crimson shadow-lg">
              <div class="mk-podium-medal gold">1º</div>
              <span class="mk-avatar mk-avatar-xl mx-auto" [attr.data-tone]="topThree()[0].tone">
                {{ initials(topThree()[0].name) }}
              </span>
              <h2 class="font-display text-lg font-extrabold text-moked-ink mt-3">
                {{ topThree()[0].name }}
              </h2>
              <p class="text-xs text-moked-muted mb-3">{{ topThree()[0].roleLabel }}</p>
              <div class="font-mono text-2xl font-extrabold text-moked-crimson">
                {{ topThree()[0].points }} pts
              </div>
              <div class="text-xs font-bold text-emerald-700 mt-1">
                🔥 {{ topThree()[0].streakDays }} dias consecutivos · {{ topThree()[0].resolvedCount }} resolvidos
              </div>
            </div>

            <!-- 3º LUGAR -->
            <div class="mk-podium-card">
              <div class="mk-podium-medal bronze">3º</div>
              <span class="mk-avatar mk-avatar-lg mx-auto" [attr.data-tone]="topThree()[2].tone">
                {{ initials(topThree()[2].name) }}
              </span>
              <h2 class="font-display text-base font-extrabold text-moked-ink mt-2">
                {{ topThree()[2].name }}
              </h2>
              <p class="text-xs text-moked-muted mb-3">{{ topThree()[2].roleLabel }}</p>
              <div class="font-mono text-xl font-extrabold text-moked-ink">
                {{ topThree()[2].points }} pts
              </div>
              <div class="text-xs font-bold text-amber-600 mt-1">
                🔥 {{ topThree()[2].streakDays }} dias em dia
              </div>
            </div>
          </section>
        }

        <!-- TABELA COMPLETA -->
        <section class="mk-surface p-6">
          <h3 class="font-display text-lg font-bold text-moked-ink mb-4">
            Classificação geral da equipe Moked
          </h3>
          <div class="divide-y divide-slate-100">
            @for (m of sortedMembers(); track m.id; let idx = $index) {
              <div class="py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <span class="font-mono text-sm font-extrabold w-7 text-slate-400">
                    #{{ idx + 1 }}
                  </span>
                  <span class="mk-avatar" [attr.data-tone]="m.tone">{{ initials(m.name) }}</span>
                  <div>
                    <strong class="block text-sm font-bold text-moked-ink">{{ m.name }}</strong>
                    <small class="text-xs text-moked-muted">
                      {{ m.roleLabel }} · {{ m.contractLabel }}
                    </small>
                  </div>
                </div>
                <div class="flex items-center gap-4 text-xs">
                  <span class="font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold">
                    {{ m.division }}
                  </span>
                  <span class="font-bold text-amber-600">🔥 {{ m.streakDays }}d</span>
                  <span class="font-mono text-sm font-extrabold text-moked-crimson">
                    {{ m.points }} pts
                  </span>
                </div>
              </div>
            }
          </div>
        </section>
      </main>
    </div>
  `,
})
export class ResolveRankingComponent {
  readonly state = inject(OlamStateService);

  readonly sortedMembers = computed(() =>
    [...this.state.rankingMembers()].sort((a, b) => b.points - a.points)
  );
  readonly topThree = computed(() => this.sortedMembers().slice(0, 3));

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('');
  }
}

