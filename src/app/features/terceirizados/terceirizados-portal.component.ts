import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-terceirizados-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (state.thirdPartyActiveTab() === 'ordens-servico') {
      <div class="two-col-grid">
        <div class="card-panel">
          <h3>Ordem de Serviço Técnica (Instalação, Manutenção e Reparo)</h3>
          <div class="field-group mt-12">
            <label>Chamado vinculado</label>
            <select [(ngModel)]="selectedTechOccurrenceId">
              @for (o of state.occurrences(); track o.id) {
                <option [value]="o.id">{{ o.code }} — {{ o.title }} ({{ o.contractId }})</option>
              }
            </select>
          </div>

          <div class="field-group mt-12">
            <label>Horário de Entrada no Posto</label>
            <div class="inline-action">
              <input type="text" [(ngModel)]="techCheckInTime" />
              <button
                type="button"
                class="btn-secondary"
                (click)="state.showToast('Entrada técnica registrada no posto às ' + techCheckInTime)"
              >
                Confirmar Entrada
              </button>
            </div>
          </div>

          <div class="field-group mt-12">
            <label>Checklist Técnico Obrigatório</label>
            <div class="checklist-box">
              @for (item of techChecklist; track item.label) {
                <label class="check-row">
                  <input type="checkbox" [(ngModel)]="item.checked" />
                  <span>{{ item.label }}</span>
                </label>
              }
            </div>
          </div>

          <div class="field-group mt-12">
            <label>Serviço executado</label>
            <textarea rows="2" [(ngModel)]="techServiceDescription"></textarea>
          </div>

          <label class="check-row highlight-check mt-12">
            <input type="checkbox" [(ngModel)]="techHasImpediment" />
            <span>
              Registrar impedimento técnico (quando o reparo depende de orçamento ou peça)
            </span>
          </label>

          @if (techHasImpediment) {
            <div class="field-group mt-12">
              <label>Descrição do impedimento</label>
              <input type="text" [(ngModel)]="techImpedimentReason" />
            </div>
          }

          <div class="upload-box mt-12">📸 Evidência fotográfica do equipamento anexada</div>

          <button type="button" class="btn-primary full mt-12" (click)="saveTechnicalVisit()">
            Registrar Saída e Enviar para Validação do Consultor
          </button>
        </div>

        <div class="card-panel">
          <h3>Status das Ordens de Serviço</h3>
          <div class="visits-feed">
            @for (o of state.occurrences(); track o.id) {
              <div class="visit-feed-card">
                <div class="vfc-head">
                  <strong>{{ o.code }} · {{ o.equipment }}</strong>
                  <span class="badge-amber">{{ o.status | uppercase }}</span>
                </div>
                <p>{{ o.title }}</p>
                <small>Prazo: {{ o.deadline }} · {{ o.consultantNotes }}</small>
              </div>
            }
          </div>
        </div>
      </div>
    }

    @if (state.thirdPartyActiveTab() === 'supervisao-posto') {
      <div class="card-panel max-700">
        <h3>Inspeção do Supervisor da Empresa de Segurança</h3>
        <p>
          Registre entrada no posto, verifique equipe, rondas e livro de posto e anexe evidência.
        </p>
        <div class="field-group mt-12">
          <label>Verificação de equipe, rondas e livro de posto</label>
          <textarea rows="3" [(ngModel)]="supervisorPostNotes"></textarea>
        </div>
        <div class="field-group mt-12">
          <label>Pendências identificadas no posto (opcional)</label>
          <input
            type="text"
            [(ngModel)]="supervisorPendingNotes"
            placeholder="Deixe em branco se não houver pendências..."
          />
        </div>
        <button type="button" class="btn-primary mt-12" (click)="saveSupervisorVisit()">
          Anexar Foto, Registrar Saída e Notificar Consultor
        </button>
      </div>
    }

    @if (state.thirdPartyActiveTab() === 'meu-sla') {
      <div class="card-panel">
        <h3>Indicadores de SLA Mensal por Empresa e Contrato</h3>
        <p>Nota calculada pelo % de entregas concluídas no prazo com checklist e foto anexada.</p>

        <table class="data-table mt-12">
          <thead>
            <tr>
              <th>Empresa Terceirizada</th>
              <th>Serviço</th>
              <th>Contrato</th>
              <th>Nota SLA</th>
              <th>Horários (Prazo vs. Real)</th>
              <th>Multa Contratual</th>
            </tr>
          </thead>
          <tbody>
            @for (s of state.thirdPartySLAs(); track s.id) {
              <tr>
                <td><strong>{{ s.companyName }}</strong></td>
                <td>{{ s.serviceType }}</td>
                <td>{{ s.contractId }}</td>
                <td>
                  <span
                    class="status-badge"
                    [attr.data-status]="
                      s.monthlyScorePercent >= 95
                        ? 'em-dia'
                        : s.monthlyScorePercent >= 85
                        ? 'atencao'
                        : 'critico'
                    "
                  >
                    {{ s.monthlyScorePercent }}%
                  </span>
                </td>
                <td>
                  Prazo {{ s.scheduledDeadline }} · Fim {{ s.actualEndTime }}
                  @if (s.delayMinutes > 0) {
                    <strong class="red"> (Atraso: {{ s.delayMinutes }} min)</strong>
                  }
                </td>
                <td>
                  @if (s.fineAmount > 0) {
                    <strong>R$ {{ s.fineAmount }},00 ({{ s.fineStatus }})</strong>
                  } @else {
                    <span>Sem multa</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class TerceirizadosPortalComponent implements OnInit {
  readonly state = inject(OlamStateService);

  selectedTechOccurrenceId = 'OC-01';
  techCheckInTime = '09:12';
  techServiceDescription =
    'Substituição de conector BNC blindado e reajuste de foco da Câmera CFTV 03.';
  techChecklist = [
    { label: 'Equipamento e falha inspecionados no local', checked: true },
    { label: 'Reparo / substituição de componente executado', checked: true },
    { label: 'Teste de transmissão de vídeo com a Central OK', checked: true },
    { label: 'Evidência fotográfica registrada', checked: true },
  ];
  techHasImpediment = false;
  techImpedimentReason =
    'Necessária passagem de novo cabo UTP blindado (aguardando autorização).';

  supervisorPostNotes =
    'Efetivo completo no posto, rondas eletrônicas conferidas e livro de posto assinado.';
  supervisorPendingNotes = '';

  ngOnInit(): void {
    this.state.activeRole.set('terceirizados');
  }

  saveTechnicalVisit(): void {
    const note = this.techHasImpediment
      ? this.techImpedimentReason
      : this.techServiceDescription;
    this.state.completeTechnicalService(
      this.selectedTechOccurrenceId,
      note,
      this.techHasImpediment
    );
  }

  saveSupervisorVisit(): void {
    this.state.registerConsultantVisit({
      contractId: this.state.selectedContractId(),
      division: 'MOKPAT',
      summary: `Supervisão de Posto: ${this.supervisorPostNotes}`,
      improvementRegistered: 'Verificação de efetivo, rondas e livro de posto concluída.',
      pendingIssueDescription: this.supervisorPendingNotes.trim() || undefined,
      pendingResponsible: 'Consultor do Contrato',
      pendingDeadline: 'Hoje',
      divisionFields: { revisaoAcesso: this.supervisorPostNotes },
    });
  }
}

