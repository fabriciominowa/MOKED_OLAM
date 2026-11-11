import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrainingParticipant, TrainingSession } from '../../models/olam.models';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-treinamento-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- SELETOR RÁPIDO DE CONTRATO PARA VISUALIZAR OS DADOS DE CADA UNIDADE -->
    <div class="trn-contract-filter-bar mb-16">
      <span>Contrato selecionado:</span>
      <div class="filter-pills">
        @for (c of state.contracts().slice(0, 3); track c.id) {
          <button
            type="button"
            [class.active]="state.selectedContractId() === c.id"
            (click)="state.selectedContractId.set(c.id)"
          >
            {{ c.name }} ({{ c.unit }})
          </button>
        }
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- ABA 1: VISÃO EQUIPE & TREINAMENTOS (QUADRO MOKED CLIENTE / EQUIPE   -->
    <!-- + CARDS DE TREINAMENTO COM VER FOTOS E VER RELATÓRIO)               -->
    <!-- =================================================================== -->
    @if (state.trainingActiveTab() === 'visao-equipe') {
      <div class="two-col-grid">
        <!-- COLUNA 1: TELA MOKED CLIENTE / EQUIPE (FIEL À IMAGEM ENVIADA) -->
        <div>
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
        </div>

        <!-- COLUNA 2: CARDS DE TREINAMENTOS REALIZADOS NO CONTRATO -->
        <div class="client-trainings-list">
          @for (trn of contractTrainings(); track trn.id) {
            <article class="client-training-card">
              <div class="ctc-photo-wrap">
                <img [src]="trn.photoUrl" [alt]="trn.title" class="ctc-hero-img" />
              </div>

              <div class="ctc-body">
                <div class="ctc-info-row">
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

                <div class="ctc-actions-row">
                  <button
                    type="button"
                    class="btn-ver-fotos-red"
                    (click)="togglePhotos(trn.id)"
                  >
                    <span class="btn-ico">🖼️</span>
                    <span>Ver fotos</span>
                  </button>

                  <button
                    type="button"
                    class="btn-ver-relatorio-white"
                    (click)="toggleReport(trn.id)"
                  >
                    <span class="btn-ico">📄</span>
                    <span>Ver relatório</span>
                  </button>
                </div>

                @if (activePhotosId() === trn.id) {
                  <div class="ctc-drawer">
                    <div class="panel-top">
                      <strong>Evidências Fotográficas · {{ trn.title }}</strong>
                      <button type="button" class="btn-ghost" (click)="activePhotosId.set(null)">
                        ✕
                      </button>
                    </div>
                    <div class="ctc-photos-grid">
                      <img [src]="trn.photoUrl" alt="Foto principal da turma" />
                      <img src="/assets/p13_img_6.png" alt="Registro em posto" />
                    </div>
                  </div>
                }

                @if (activeReportId() === trn.id) {
                  <div class="ctc-drawer">
                    <div class="panel-top">
                      <strong>Relatório do Treinamento · {{ trn.date }}</strong>
                      <button type="button" class="btn-ghost" (click)="activeReportId.set(null)">
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
      </div>
    }

    <!-- =================================================================== -->
    <!-- ABA 2: LISTA DE PRESENÇA & REPOSIÇÕES                               -->
    <!-- =================================================================== -->
    @if (state.trainingActiveTab() === 'turmas-presenca') {
      <div class="two-col-grid">
        @for (session of contractTrainings(); track session.id) {
          <div class="card-panel">
            <div class="panel-top">
              <div>
                <h3>Lista de Presença · {{ session.title }}</h3>
                <p>
                  {{ session.date }} · Instrutor: {{ session.instructor }} · Contrato:
                  {{ session.contractId }}
                </p>
              </div>
            </div>

            <p class="mb-12">
              Clique no colaborador para registrar presença ou ausência (a presença soma
              <strong>+10 pontos</strong> no cadastro):
            </p>

            <div class="attendance-list">
              @for (p of session.participants; track p.name) {
                <div
                  class="att-row"
                  [class.present]="p.present"
                  [class.absent]="!p.present"
                  (click)="state.toggleTrainingAttendance(session.id, p.name)"
                >
                  <div>
                    <strong>{{ p.name }} ({{ p.role }})</strong>
                    <span>
                      {{
                        p.present
                          ? 'Presente · +' + p.pointsEarned + ' pontos no cadastro'
                          : 'Ausente · Reposição pendente'
                      }}
                    </span>
                  </div>
                  <span class="att-pill">{{ p.present ? 'Presente ✓' : 'Ausente !' }}</span>
                </div>
              }
            </div>
          </div>

          <div class="card-panel">
            <h3>Resumo da Turma e Controle de Reposições</h3>
            <div class="stat-tile mb-12">
              <small>Taxa de Presença da Turma</small>
              <strong>
                {{ presentCount(session) }} de {{ session.participants.length }} presentes ({{
                  presentPercent(session)
                }}%)
              </strong>
            </div>

            @if (absentParticipants(session).length) {
              <h4>Reposições Pendentes por Ausência:</h4>
              @for (abs of absentParticipants(session); track abs.name) {
                <div class="makeup-card">
                  <div>
                    <strong>{{ abs.name }}</strong>
                    <span>Aguardando aula de reposição</span>
                  </div>
                  <button
                    type="button"
                    class="btn-primary"
                    (click)="state.completeTrainingMakeup(session.id, abs.name)"
                  >
                    Registrar Reposição Concluída
                  </button>
                </div>
              }
            } @else {
              <div class="badge-green">
                ✓ 100% da turma treinada — nenhuma reposição pendente!
              </div>
            }

            <img [src]="session.photoUrl" alt="Evidência da Turma" class="trn-banner mt-16" />
          </div>
        }
      </div>
    }

    <!-- =================================================================== -->
    <!-- ABA 3: ABRIR NOVA TURMA                                             -->
    <!-- =================================================================== -->
    @if (state.trainingActiveTab() === 'nova-turma') {
      <div class="card-panel max-700">
        <h3>Abrir Nova Turma de Treinamento ({{ state.selectedContract().name }})</h3>
        <div class="field-group mt-12">
          <label>Tema do Treinamento</label>
          <input type="text" [(ngModel)]="newClassTitle" />
        </div>
        <div class="field-group mt-12">
          <label>Data</label>
          <input type="text" [(ngModel)]="newClassDate" />
        </div>
        <div class="field-group mt-12">
          <label>Instrutor Responsável</label>
          <input type="text" [(ngModel)]="newClassInstructor" />
        </div>
        <div class="field-group mt-12">
          <label>Conteúdo Programático</label>
          <textarea rows="3" [(ngModel)]="newClassContent"></textarea>
        </div>
        <button type="button" class="btn-primary full mt-16" (click)="createNewTrainingSession()">
          Criar Turma e Convocar Equipe
        </button>
      </div>
    }

    <!-- =================================================================== -->
    <!-- ABA 4: COBERTURA & SALDO FV                                         -->
    <!-- =================================================================== -->
    @if (state.trainingActiveTab() === 'saldo-fv') {
      <div class="card-panel">
        <h3>Controle de Cobertura e Saldo de FV por Contrato</h3>
        <table class="data-table mt-12">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Unidade</th>
              <th>Equipe Treinada</th>
              <th>FV Previsto</th>
              <th>FV Usado</th>
              <th>Saldo FV</th>
            </tr>
          </thead>
          <tbody>
            @for (c of state.contracts().slice(0, 6); track c.id) {
              <tr>
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.unit }}</td>
                <td>{{ c.gauges.trainedTeam }}%</td>
                <td>{{ c.fv.planned }}h</td>
                <td>{{ c.fv.used }}h</td>
                <td><strong>{{ c.fv.balance }}h</strong></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class TreinamentoPortalComponent implements OnInit {
  readonly state = inject(OlamStateService);

  readonly activePhotosId = signal<string | null>(null);
  readonly activeReportId = signal<string | null>(null);

  readonly contractTrainings = computed(() =>
    this.state
      .trainings()
      .filter((t) => t.contractId === this.state.selectedContractId())
  );

  newClassTitle = 'Reciclagem Operacional e Controle de Acesso';
  newClassDate = '06/11/2026';
  newClassInstructor = 'Rafael (Equipe de Treinamento)';
  newClassContent =
    'Triagem de visitantes, protocolos de segurança, registro no Olam e resposta a incidentes.';

  ngOnInit(): void {
    // Mantém o perfil 'consultor' quando o consultor acessa o módulo compartilhado de Treinamento
    if (this.state.activeRole() !== 'consultor') {
      this.state.activeRole.set('treinamento');
    }
  }

  togglePhotos(trnId: string): void {
    this.activePhotosId.set(this.activePhotosId() === trnId ? null : trnId);
  }

  toggleReport(trnId: string): void {
    this.activeReportId.set(this.activeReportId() === trnId ? null : trnId);
  }

  createNewTrainingSession(): void {
    if (!this.newClassTitle.trim()) return;
    const newSession: TrainingSession = {
      id: `TRN-0${this.state.trainings().length + 1}`,
      contractId: this.state.selectedContractId(),
      title: this.newClassTitle.trim(),
      date: this.newClassDate,
      instructor: this.newClassInstructor,
      content: this.newClassContent,
      photoUrl: '/assets/treinamento-controle-acesso.png',
      publishedToClient: true,
      participants: [
        {
          name: 'Ana Ribeiro',
          role: 'Portaria Diurna',
          present: true,
          pointsEarned: 10,
          makeupStatus: 'em-dia',
        },
        {
          name: 'Bruno Lima',
          role: 'Portaria Noturna',
          present: true,
          pointsEarned: 10,
          makeupStatus: 'em-dia',
        },
        {
          name: 'Carla Santos',
          role: 'Controle de Acesso',
          present: true,
          pointsEarned: 10,
          makeupStatus: 'em-dia',
        },
      ],
    };
    this.state.trainings.update((list) => [newSession, ...list]);
    this.state.trainingActiveTab.set('visao-equipe');
    this.state.showToast('Nova turma aberta e vinculada ao contrato!');
  }

  presentCount(session: TrainingSession): number {
    return session.participants.filter((p) => p.present).length;
  }

  presentPercent(session: TrainingSession): number {
    if (!session.participants.length) return 0;
    return Math.round((this.presentCount(session) / session.participants.length) * 100);
  }

  absentParticipants(session: TrainingSession): TrainingParticipant[] {
    return session.participants.filter((p) => !p.present);
  }
}
