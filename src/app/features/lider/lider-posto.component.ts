import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-lider-posto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lider-workspace-shell">
      <!-- =================================================================== -->
      <!-- 1. PÁGINA INICIAL: MEU TURNO (RESUMO OPERACIONAL DO POSTO)          -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'meu-turno') {
        <section class="page-hero">
          <div class="hero-copy">
            <span class="badge-pill">03 | LÍDER DE POSTO · MEU TURNO</span>
            <h2>Resumo do Posto · {{ state.leaderSelectedPost() }}</h2>
            <p>
              Contrato ativo: <strong>{{ state.selectedContract().name }}</strong> —
              {{ state.selectedContract().unit }}. Utilize o menu lateral para registrar falta ou
              atraso, treinamento, ocorrência ou turno sem alteração.
            </p>
          </div>
          <div class="hero-status-box" data-status="em-dia">
            <span class="label">Situação do turno</span>
            <strong>{{ state.leaderSelectedPost() }}</strong>
            <small>Plantão ativo · {{ contractShiftRecords().length }} registro(s) no turno</small>
          </div>
        </section>

        <section class="kpi-grid-4 mt-16">
          <div class="kpi-card">
            <span class="kpi-label">Posto Selecionado</span>
            <strong>{{ state.leaderSelectedPost() }}</strong>
            <small>{{ state.selectedContract().unit }}</small>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Contrato Ativo</span>
            <strong>{{ state.selectedContract().id }}</strong>
            <small>{{ state.selectedContract().name }}</small>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Pendências no Posto</span>
            <strong>{{ contractOccurrences().length }}</strong>
            <small>Ocorrências e reparos em acompanhamento</small>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Livro Digital do Turno</span>
            <strong>{{ contractShiftRecords().length }}</strong>
            <small>Registros enviados ao consultor</small>
          </div>
        </section>

        <div class="two-col-grid mt-20">
          <div class="card-panel">
            <h3>Últimos Registros do Turno</h3>
            <div class="visits-feed mt-12">
              @for (sh of contractShiftRecords().slice(0, 3); track sh.id) {
                <div class="visit-feed-card">
                  <div class="vfc-head">
                    <strong>{{ formatShiftType(sh.type) }} · {{ sh.date }} às {{ sh.time }}</strong>
                    <span
                      class="status-badge"
                      [attr.data-status]="sh.status === 'validado' ? 'em-dia' : 'atencao'"
                    >
                      {{ sh.status === 'validado' ? 'VALIDADO' : 'ENVIADO' }}
                    </span>
                  </div>
                  <p>{{ sh.description }}</p>
                </div>
              } @empty {
                <p class="muted-empty">Nenhum registro lançado neste turno ainda.</p>
              }
            </div>
          </div>

          <div class="card-panel">
            <h3>Pendências Abertas do Posto</h3>
            <div class="visits-feed mt-12">
              @for (occ of contractOccurrences().slice(0, 3); track occ.id) {
                <div class="visit-feed-card">
                  <div class="vfc-head">
                    <strong>{{ occ.title }}</strong>
                    <span
                      class="status-badge"
                      [attr.data-status]="occ.status === 'validada' ? 'em-dia' : 'atencao'"
                    >
                      {{ occ.status === 'validada' ? 'Validada' : 'Em andamento' }}
                    </span>
                  </div>
                  <p>{{ occ.description }}</p>
                </div>
              } @empty {
                <p class="muted-empty">Nenhuma pendência em aberto para este posto.</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 2. PÁGINA: FALTA OU ATRASO                                          -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'falta-atraso') {
        <section class="page-hero">
          <div class="hero-copy">
            <span class="badge-pill">03 | LÍDER DE POSTO · FALTA OU ATRASO</span>
            <h2>Registrar Falta ou Atraso no Posto</h2>
            <p>
              Posto ativo: <strong>{{ state.leaderSelectedPost() }}</strong> ·
              {{ state.selectedContract().name }} ({{ state.selectedContract().unit }}).
            </p>
          </div>
          <div class="hero-status-box" data-status="atencao">
            <span class="label">Destino do registro</span>
            <strong>Consultor + Livro Digital</strong>
            <small>Faltas críticas geram alerta imediato</small>
          </div>
        </section>

        <div class="card-panel">
          <div class="mlpc-form-stack">
            <div class="two-col-grid">
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">🕒</span>
                <div class="mlpc-field-box">
                  <label>Tipo de registro</label>
                  <select [(ngModel)]="absenceType">
                    <option value="falta">Falta no posto</option>
                    <option value="atraso">Atraso na rendição</option>
                  </select>
                </div>
              </div>

              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📍</span>
                <div class="mlpc-field-box">
                  <label>Posto</label>
                  <select
                    [ngModel]="state.leaderSelectedPost()"
                    (ngModelChange)="state.leaderSelectedPost.set($event)"
                  >
                    @for (p of availablePosts; track p) {
                      <option [value]="p">{{ p }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="two-col-grid">
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">👤</span>
                <div class="mlpc-field-box">
                  <label>Equipe e horário (Colaborador)</label>
                  <input
                    type="text"
                    placeholder="Identifique o colaborador..."
                    [(ngModel)]="leaderEmployeeName"
                  />
                </div>
              </div>

              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📅</span>
                <div class="mlpc-field-box two-inputs">
                  <div>
                    <label>Data</label>
                    <input type="text" [(ngModel)]="leaderRecordDate" />
                  </div>
                  <div>
                    <label>Horário constatado</label>
                    <input type="text" [(ngModel)]="leaderShiftTime" />
                  </div>
                </div>
              </div>
            </div>

            <div class="mlpc-field-row">
              <span class="mlpc-field-ico">🔧</span>
              <div class="mlpc-field-box">
                <label>Cobertura / Providência no posto</label>
                <textarea
                  rows="2"
                  placeholder="Informe a cobertura ou reserva acionada..."
                  [(ngModel)]="leaderAbsenceAction"
                ></textarea>
              </div>
            </div>

            <label class="mlpc-critical-check">
              <input type="checkbox" [(ngModel)]="leaderCriticalAbsence" />
              <span>Falta crítica no posto (disparar alerta imediato ao Consultor)</span>
            </label>

            <button
              type="button"
              class="mlpc-submit-red"
              (click)="submitAbsenceOrDelay()"
            >
              <span>✓</span> Salvar registro
            </button>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 3. PÁGINA: TREINAMENTO DO TURNO                                     -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'treinamento') {
        <section class="page-hero">
          <div class="hero-copy">
            <span class="badge-pill">03 | LÍDER DE POSTO · TREINAMENTO</span>
            <h2>Registrar Treinamento no Posto</h2>
            <p>
              Posto ativo: <strong>{{ state.leaderSelectedPost() }}</strong> ·
              {{ state.selectedContract().name }} ({{ state.selectedContract().unit }}).
            </p>
          </div>
          <div class="hero-status-box" data-status="em-dia">
            <span class="label">Destino do registro</span>
            <strong>Livro Digital + Treinamento</strong>
            <small>Comprovante e equipe participante</small>
          </div>
        </section>

        <div class="card-panel">
          <div class="mlpc-form-stack">
            <div class="two-col-grid">
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📍</span>
                <div class="mlpc-field-box">
                  <label>Posto</label>
                  <select
                    [ngModel]="state.leaderSelectedPost()"
                    (ngModelChange)="state.leaderSelectedPost.set($event)"
                  >
                    @for (p of availablePosts; track p) {
                      <option [value]="p">{{ p }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">🎓</span>
                <div class="mlpc-field-box">
                  <label>Atividade (Tema do treinamento)</label>
                  <input
                    type="text"
                    placeholder="Informe o tema do treinamento..."
                    [(ngModel)]="leaderTrainingTheme"
                  />
                </div>
              </div>
            </div>

            <div class="two-col-grid">
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">👥</span>
                <div class="mlpc-field-box">
                  <label>Participação (Equipe presente no turno)</label>
                  <textarea
                    rows="4"
                    placeholder="Registre a equipe presente no treinamento..."
                    [(ngModel)]="leaderTrainingParticipants"
                  ></textarea>
                </div>
              </div>

              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📷</span>
                <div class="mlpc-field-box">
                  <label>Foto / evidência do treinamento</label>
                  <label class="mlpc-photo-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      (change)="onLeaderPhotoSelected($event)"
                    />
                    <span class="cam-big">📷</span>
                    <span>Toque para adicionar foto</span>
                  </label>
                  @if (leaderPhotos().length > 0) {
                    <div class="mlpc-photo-thumbs">
                      @for (ph of leaderPhotos(); track $index) {
                        <div class="mlpc-thumb-item">
                          <img [src]="ph" alt="Evidência" />
                          <button type="button" (click)="removeLeaderPhoto($index)">✕</button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mlpc-submit-red"
              (click)="submitShiftTraining()"
            >
              <span>✓</span> Salvar registro
            </button>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 4. PÁGINA: NOVA OCORRÊNCIA                                          -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'ocorrencia') {
        <section class="page-hero">
          <div class="hero-copy">
            <span class="badge-pill">03 | LÍDER DE POSTO · OCORRÊNCIA</span>
            <h2>Comunicar Ocorrência no Posto</h2>
            <p>
              Posto ativo: <strong>{{ state.leaderSelectedPost() }}</strong> ·
              {{ state.selectedContract().name }} ({{ state.selectedContract().unit }}).
            </p>
          </div>
          <div class="hero-status-box" data-status="atencao">
            <span class="label">Fluxo de atendimento</span>
            <strong>Consultor + Pendências do Posto</strong>
            <small>Registro direto com evidência fotográfica</small>
          </div>
        </section>

        <div class="card-panel">
          <div class="mlpc-form-stack">
            <div class="two-col-grid">
              <!-- TIPO -->
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📄</span>
                <div class="mlpc-field-box">
                  <label>Tipo</label>
                  <select [(ngModel)]="leaderIncidentCategory">
                    <option value="Acesso indevido">Acesso indevido</option>
                    <option value="Câmera fora do ar">Câmera fora do ar</option>
                    <option value="Falha em equipamento do posto">Falha em equipamento do posto</option>
                    <option value="Tentativa de invasão / Ocorrência grave">Tentativa de invasão / Ocorrência grave</option>
                    <option value="Não conformidade no posto">Não conformidade no posto</option>
                  </select>
                </div>
              </div>

              <!-- DATA E HORÁRIO -->
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">🕒</span>
                <div class="mlpc-field-box two-inputs">
                  <div>
                    <label>Data</label>
                    <input type="text" [(ngModel)]="leaderIncidentDate" />
                  </div>
                  <div>
                    <label>Horário</label>
                    <input type="text" [(ngModel)]="leaderIncidentTime" />
                  </div>
                </div>
              </div>
            </div>

            <div class="two-col-grid">
              <!-- O QUE ACONTECEU? -->
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">💬</span>
                <div class="mlpc-field-box">
                  <label>O que aconteceu?</label>
                  <textarea
                    rows="3"
                    placeholder="Descreva o ocorrido..."
                    [(ngModel)]="leaderIncidentDescription"
                  ></textarea>
                </div>
              </div>

              <!-- PROVIDÊNCIA IMEDIATA -->
              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">🔧</span>
                <div class="mlpc-field-box">
                  <label>Providência imediata</label>
                  <textarea
                    rows="3"
                    placeholder="Informe a providência tomada..."
                    [(ngModel)]="leaderImmediateAction"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- FOTO / EVIDÊNCIA -->
            <div class="mlpc-field-row">
              <span class="mlpc-field-ico">📷</span>
              <div class="mlpc-field-box">
                <label>Foto / evidência</label>
                <label class="mlpc-photo-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    (change)="onLeaderPhotoSelected($event)"
                  />
                  <span class="cam-big">📷</span>
                  <span>Toque para adicionar foto</span>
                </label>

                <div class="mlpc-preset-row">
                  <button
                    type="button"
                    class="mlpc-preset-btn"
                    (click)="addPresetPhoto('/assets/p13_img_8.png')"
                  >
                    + Foto Portaria / CFTV
                  </button>
                  <button
                    type="button"
                    class="mlpc-preset-btn"
                    (click)="addPresetPhoto('/assets/p13_img_9.png')"
                  >
                    + Foto Evidência Local
                  </button>
                </div>

                @if (leaderPhotos().length > 0) {
                  <div class="mlpc-photo-thumbs">
                    @for (ph of leaderPhotos(); track $index) {
                      <div class="mlpc-thumb-item">
                        <img [src]="ph" alt="Evidência da ocorrência" />
                        <button type="button" (click)="removeLeaderPhoto($index)">✕</button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- BOTÃO VERMELHO ENVIAR REGISTRO -->
            <button
              type="button"
              class="mlpc-submit-red"
              (click)="submitIncident()"
            >
              <span>✓</span> Enviar registro
            </button>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 5. PÁGINA: TURNO SEM ALTERAÇÃO                                      -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'sem-alteracao') {
        <section class="page-hero">
          <div class="hero-copy">
            <span class="badge-pill">03 | LÍDER DE POSTO · TURNO SEM ALTERAÇÃO</span>
            <h2>Conferência e Encerramento do Turno</h2>
            <p>
              Posto ativo: <strong>{{ state.leaderSelectedPost() }}</strong> ·
              {{ state.selectedContract().name }} — {{ state.selectedContract().unit }}.
            </p>
          </div>
          <div class="hero-status-box" data-status="em-dia">
            <span class="label">Período</span>
            <strong>{{ leaderShiftPeriod }}</strong>
            <small>{{ leaderRecordDate }} · {{ leaderShiftTime }}</small>
          </div>
        </section>

        <div class="card-panel">
          <div class="mlpc-form-stack">
            <div class="two-col-grid">
              <div class="mlpc-summary-check-card">
                <h4>Conferir os dados do turno</h4>
                <div class="mlpc-kv">
                  <span>Posto:</span>
                  <strong>{{ state.leaderSelectedPost() }}</strong>
                </div>
                <div class="mlpc-kv">
                  <span>Contrato:</span>
                  <strong>{{ state.selectedContract().name }} — {{ state.selectedContract().unit }}</strong>
                </div>
                <div class="mlpc-kv">
                  <span>Turno:</span>
                  <strong>{{ leaderShiftPeriod }}</strong>
                </div>
                <div class="mlpc-kv">
                  <span>Responsável no posto:</span>
                  <strong>Sérgio Oliveira (Líder de Posto)</strong>
                </div>
                <div class="mlpc-kv">
                  <span>Data e horário:</span>
                  <strong>{{ leaderRecordDate }} · {{ leaderShiftTime }}</strong>
                </div>
              </div>

              <div class="mlpc-field-row">
                <span class="mlpc-field-ico">📝</span>
                <div class="mlpc-field-box">
                  <label>Resumo da passagem de turno</label>
                  <textarea
                    rows="5"
                    [(ngModel)]="leaderRegularShiftNote"
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mlpc-submit-red"
              (click)="submitRegularShift()"
            >
              <span>✓</span> Confirmar registro
            </button>
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 6. PÁGINA: PENDÊNCIAS DO POSTO (OCORRÊNCIAS EM ACOMPANHAMENTO)      -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'pendencias') {
        <div class="card-panel">
          <div class="panel-head-flex">
            <div>
              <h3>Pendências e Ocorrências em Acompanhamento no Posto</h3>
              <p>
                Acompanhe o status das ocorrências abertas no {{ state.leaderSelectedPost() }} ({{ state.selectedContract().name }}) e a validação do consultor.
              </p>
            </div>
            <button
              type="button"
              class="btn-primary"
              (click)="goToScreen('ocorrencia', '/lider/ocorrencia')"
            >
              + Comunicar Nova Ocorrência
            </button>
          </div>

          <div class="occ-list mt-16">
            @for (occ of contractOccurrences(); track occ.id) {
              <div class="occ-row-card">
                <div>
                  <div class="occ-badges-line">
                    <span class="tag-code">{{ occ.code }}</span>
                    <span class="tag-origin">{{ occ.origin }}</span>
                    <span class="tag-loc">📍 {{ occ.location }}</span>
                  </div>
                  <h4>{{ occ.title }}</h4>
                  <p>{{ occ.description }}</p>
                  <p class="leader-status-highlight">
                    <strong>Status no posto:</strong> {{ occ.leaderStatusText }}
                  </p>
                  <small>
                    Providência imediata: {{ occ.immediateAction }} · Responsável: {{ occ.responsible }} · Prazo: {{ occ.deadline }}
                  </small>
                </div>
                <div class="occ-right-col">
                  <span
                    class="status-badge"
                    [attr.data-status]="occ.status === 'validada' ? 'em-dia' : 'atencao'"
                  >
                    {{
                      occ.status === 'validada'
                        ? 'Validada pelo Consultor'
                        : occ.status === 'aguardando-validacao'
                          ? 'Em análise pelo Consultor'
                          : 'Aguardando Reparo'
                    }}
                  </span>
                  @if (occ.evidencePhoto) {
                    <img [src]="occ.evidencePhoto" alt="Evidência" class="occ-mini-thumb" />
                  }
                </div>
              </div>
            } @empty {
              <p class="muted-empty">Nenhuma pendência em aberto para este posto.</p>
            }
          </div>
        </div>
      }

      <!-- =================================================================== -->
      <!-- 7. PÁGINA: LIVRO DIGITAL DO TURNO (HISTÓRICO DE REGISTROS)          -->
      <!-- =================================================================== -->
      @if (state.leaderActiveTab() === 'historico') {
        <div class="card-panel">
          <div class="panel-head-flex">
            <div>
              <h3>Livro Digital do Turno · {{ state.leaderSelectedPost() }}</h3>
              <p>Histórico completo de registros enviados pelo Líder de Posto ao Consultor da Moked.</p>
            </div>
            <button
              type="button"
              class="btn-outline-sm"
              (click)="goToScreen('meu-turno', '/lider')"
            >
              ← Voltar para Meu Turno
            </button>
          </div>

          <div class="visits-feed mt-16">
            @for (sh of contractShiftRecords(); track sh.id) {
              <div class="visit-feed-card">
                <div class="vfc-head">
                  <strong>
                    {{ formatShiftType(sh.type) }} · {{ sh.postName }} · {{ sh.date }} às {{ sh.time }}
                  </strong>
                  <span
                    class="status-badge"
                    [attr.data-status]="sh.status === 'validado' ? 'em-dia' : 'atencao'"
                  >
                    {{ sh.status === 'validado' ? 'VALIDADO' : 'ENVIADO AO CONSULTOR' }}
                  </span>
                </div>
                <p>{{ sh.description }}</p>
                @if (sh.immediateAction) {
                  <small class="block-mt">
                    <strong>Providência / Detalhe:</strong> {{ sh.immediateAction }}
                  </small>
                }
                @if (sh.photoUrl) {
                  <div class="sh-photo-row mt-8">
                    <img [src]="sh.photoUrl" alt="Evidência do turno" class="sh-thumb" />
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class LiderPostoComponent implements OnInit, OnDestroy {
  readonly state = inject(OlamStateService);
  private readonly router = inject(Router);
  private routeSub?: Subscription;

  readonly availablePosts = [
    'Posto Exemplo',
    'Posto Exemplo · Portaria Principal',
    'Posto 02 · Docas e Expedição',
    'Posto 03 · Perímetro e Eclusa',
  ];

  // Campos de Falta ou Atraso (Slide 37)
  absenceType: 'falta' | 'atraso' = 'falta';
  leaderEmployeeName = 'Vigilante Marcos Silva';
  leaderRecordDate = '01/11';
  leaderShiftTime = '06:15';
  leaderAbsenceAction = 'Reserva técnica acionada e consultor do contrato avisado.';
  leaderCriticalAbsence = true;

  // Campos de Treinamento do Turno (Slide 38)
  leaderTrainingTheme = 'Controle de acesso e procedimento de bloqueio na portaria';
  leaderTrainingParticipants = '4 colaboradores presentes no turno diurno (Ana, Carla, Diego e Fábio)';

  // Campos de Nova Ocorrência (Slides 34, 36 e 39)
  leaderIncidentCategory = 'Acesso indevido';
  leaderIncidentDate = '01/11';
  leaderIncidentTime = '14:20';
  leaderIncidentDescription = 'Tentativa de entrada sem autorização.';
  leaderImmediateAction = 'Acesso bloqueado e consultor avisado.';

  // Campos de Turno sem alteração (Slide 40)
  leaderShiftPeriod = 'Diurno (06h às 18h)';
  leaderRegularShiftNote =
    'Turno encerrado sem alterações. Efetivo completo, CFTV e controle de acesso conferidos.';

  // Fotos anexadas pelo Líder
  readonly leaderPhotos = signal<string[]>(['/assets/p13_img_8.png']);

  readonly contractOccurrences = computed(() =>
    this.state
      .occurrences()
      .filter((o) => o.contractId === this.state.selectedContractId())
  );

  readonly contractShiftRecords = computed(() =>
    this.state
      .shiftRecords()
      .filter((s) => s.contractId === this.state.selectedContractId())
  );

  ngOnInit(): void {
    this.state.activeRole.set('lider');
    this.syncTabFromUrl(this.router.url);

    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev) => {
        this.syncTabFromUrl(ev.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private syncTabFromUrl(url: string): void {
    if (url.includes('/lider/falta-atraso')) {
      this.state.leaderActiveTab.set('falta-atraso');
    } else if (url.includes('/lider/treinamento')) {
      this.state.leaderActiveTab.set('treinamento');
    } else if (url.includes('/lider/ocorrencia')) {
      this.state.leaderActiveTab.set('ocorrencia');
    } else if (url.includes('/lider/sem-alteracao')) {
      this.state.leaderActiveTab.set('sem-alteracao');
    } else if (url.includes('/lider/pendencias')) {
      this.state.leaderActiveTab.set('pendencias');
    } else if (url.includes('/lider/historico')) {
      this.state.leaderActiveTab.set('historico');
    } else {
      this.state.leaderActiveTab.set('meu-turno');
    }
  }

  goToScreen(
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
  }

  onLeaderPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.leaderPhotos.update((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  addPresetPhoto(url: string): void {
    if (!this.leaderPhotos().includes(url)) {
      this.leaderPhotos.update((prev) => [...prev, url]);
    }
  }

  removeLeaderPhoto(index: number): void {
    this.leaderPhotos.update((prev) => prev.filter((_, i) => i !== index));
  }

  submitAbsenceOrDelay(): void {
    const label = this.absenceType === 'falta' ? 'Falta no posto' : 'Atraso na rendição';
    this.state.registerLeaderShiftEntry({
      type: this.absenceType,
      postName: this.state.leaderSelectedPost(),
      date: this.leaderRecordDate,
      time: this.leaderShiftTime,
      employeeName: this.leaderEmployeeName,
      isCritical: this.leaderCriticalAbsence,
      description: `${label}: ${this.leaderEmployeeName} (${this.leaderRecordDate} às ${this.leaderShiftTime})`,
      immediateAction: this.leaderAbsenceAction,
    });
    this.goToScreen('historico', '/lider/historico');
  }

  submitShiftTraining(): void {
    this.state.registerLeaderShiftEntry({
      type: 'treinamento',
      postName: this.state.leaderSelectedPost(),
      date: this.leaderRecordDate,
      time: this.leaderShiftTime,
      description: `Treinamento do turno: ${this.leaderTrainingTheme}`,
      immediateAction: `Participação: ${this.leaderTrainingParticipants}`,
      photos: this.leaderPhotos(),
    });
    this.goToScreen('historico', '/lider/historico');
  }

  submitIncident(): void {
    this.state.registerLeaderShiftEntry({
      type: 'ocorrencia',
      postName: this.state.leaderSelectedPost(),
      date: this.leaderIncidentDate,
      time: this.leaderIncidentTime,
      incidentCategory: this.leaderIncidentCategory,
      isCritical:
        this.leaderIncidentCategory.includes('grave') ||
        this.leaderIncidentCategory.includes('Acesso indevido'),
      description: `${this.leaderIncidentCategory}: ${this.leaderIncidentDescription}`,
      immediateAction: this.leaderImmediateAction,
      photos: this.leaderPhotos(),
    });
    this.goToScreen('pendencias', '/lider/pendencias');
  }

  submitRegularShift(): void {
    this.state.registerLeaderShiftEntry({
      type: 'sem-alteracao',
      postName: this.state.leaderSelectedPost(),
      shift: this.leaderShiftPeriod,
      date: this.leaderRecordDate,
      time: this.leaderShiftTime,
      description: this.leaderRegularShiftNote,
      immediateAction: 'Encerramento regular confirmado pelo Líder de Posto.',
    });
    this.goToScreen('historico', '/lider/historico');
  }

  formatShiftType(type: string): string {
    switch (type) {
      case 'falta':
        return 'FALTA NO POSTO';
      case 'atraso':
        return 'ATRASO NA RENDIÇÃO';
      case 'treinamento':
        return 'TREINAMENTO DO TURNO';
      case 'ocorrencia':
        return 'OCORRÊNCIA / FORA DO PADRÃO';
      case 'sem-alteracao':
        return 'TURNO SEM ALTERAÇÃO';
      default:
        return type.toUpperCase();
    }
  }
}
