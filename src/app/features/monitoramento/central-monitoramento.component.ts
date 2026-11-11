import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OlamStateService } from '../../services/olam-state.service';

@Component({
  selector: 'app-central-monitoramento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (state.centralActiveTab() === 'painel-monitoramento') {
      <div class="card-panel">
        <div class="panel-top">
          <div>
            <h3>Console de Monitoramento de Eventos e CFTV</h3>
            <p>Acompanhamento em tempo real das ocorrências abertas até a validação final.</p>
          </div>
          <button type="button" class="btn-primary" (click)="state.centralActiveTab.set('novo-evento')">
            🚨 Registrar Nova Falha / Ocorrência
          </button>
        </div>

        <div class="occ-list">
          @for (occ of state.occurrences(); track occ.id) {
            <div class="occ-row-card">
              <div>
                <div class="orc-tags">
                  <span class="tag-code">{{ occ.code }}</span>
                  <span class="tag-origin">Prioridade {{ occ.priority | uppercase }}</span>
                </div>
                <h4>{{ occ.title }} — {{ occ.location }} ({{ occ.contractId }})</h4>
                <p>
                  {{ occ.description }} · <strong>Providência:</strong> {{ occ.immediateAction }}
                </p>
                <small>
                  Responsável acionado: {{ occ.responsible }} · Criado em {{ occ.createdAt }}
                </small>
              </div>
              <span
                class="status-badge"
                [attr.data-status]="occ.status === 'validada' ? 'em-dia' : 'atencao'"
              >
                {{
                  occ.status === 'validada'
                    ? 'Câmera Online · Encerrado'
                    : 'Em Atendimento Técnico'
                }}
              </span>
            </div>
          }
        </div>
      </div>
    }

    @if (state.centralActiveTab() === 'novo-evento') {
      <div class="card-panel max-700">
        <h3>Registrar Falha Técnica ou Ocorrência na Central</h3>
        <p>
          Falhas técnicas alimentam o indicador RT e acionam o consultor. Ocorrências graves enviam
          alerta imediato à Alta Gestão.
        </p>

        <div class="field-group mt-12">
          <label>Contrato</label>
          <select [(ngModel)]="centralContractId">
            @for (c of state.contracts().slice(0, 6); track c.id) {
              <option [value]="c.id">{{ c.name }} — {{ c.unit }}</option>
            }
          </select>
        </div>

        <div class="field-group mt-12">
          <label>Local / Posto</label>
          <input type="text" [(ngModel)]="centralLocation" />
        </div>

        <div class="field-group mt-12">
          <label>Equipamento / Câmera</label>
          <input type="text" [(ngModel)]="centralEquipment" />
        </div>

        <div class="field-group mt-12">
          <label>Prioridade e Escalonamento</label>
          <select [(ngModel)]="centralPriority">
            <option value="rotina">Falha técnica de rotina (Encaminha ao Consultor)</option>
            <option value="alta">
              Alta Prioridade · CFTV / Acesso (Encaminha ao Consultor e RT)
            </option>
            <option value="grave">
              Ocorrência Grave (Alerta Imediato para Alta Gestão + Consultor)
            </option>
          </select>
        </div>

        <div class="field-group mt-12">
          <label>Descrição do Evento</label>
          <input type="text" [(ngModel)]="centralDescription" />
        </div>

        <div class="field-group mt-12">
          <label>Providência Imediata</label>
          <input type="text" [(ngModel)]="centralImmediateAction" />
        </div>

        <div class="upload-box mt-12">📸 Captura da câmera anexada à ocorrência</div>

        <button type="button" class="btn-primary full mt-12" (click)="saveCentralEvent()">
          Registrar e Acionar Responsável
        </button>
      </div>
    }
  `,
})
export class CentralMonitoramentoComponent implements OnInit {
  readonly state = inject(OlamStateService);

  centralContractId = 'CT-B';
  centralLocation = 'Portaria Principal · Unidade Loja 24';
  centralEquipment = 'CFTV 03';
  centralPriority: 'rotina' | 'alta' | 'grave' = 'alta';
  centralDescription = 'Câmera fora de operação (perda de sinal de vídeo)';
  centralImmediateAction = 'Suporte técnico acionado e alerta encaminhado ao consultor';

  ngOnInit(): void {
    this.state.activeRole.set('monitoramento');
  }

  saveCentralEvent(): void {
    this.state.registerCentralOccurrence({
      contractId: this.centralContractId,
      location: this.centralLocation,
      equipment: this.centralEquipment,
      priority: this.centralPriority,
      description: this.centralDescription,
      immediateAction: this.centralImmediateAction,
    });
    this.state.centralActiveTab.set('painel-monitoramento');
  }
}

