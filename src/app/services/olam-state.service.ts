import { Injectable, computed, effect, signal } from '@angular/core';
import { MokedDatabase } from '../core/database/moked.db';
import {
  MOKED_CLIENT_ACCOUNTS,
  MOKED_DIVISIONS,
  MOKED_ROLES,
  MOKED_USE_CASES,
  MuralPraiseRecord,
  RankingMemberRecord,
  TicketChatMessage,
} from '../core/database/moked.seed';
import {
  AuditLogEntry,
  BudgetProposal,
  Contract,
  DivisionCode,
  DivisionMeta,
  Occurrence,
  RoleMeta,
  ShiftRecord,
  ThirdPartySLA,
  TimelineEvent,
  TrainingSession,
  UseCaseScenario,
  UserRole,
  VisitRecord,
} from '../models/olam.models';

@Injectable({
  providedIn: 'root',
})
export class OlamStateService {
  private readonly initialDb = MokedDatabase.load();

  readonly roles: RoleMeta[] = MOKED_ROLES;
  readonly divisions: DivisionMeta[] = MOKED_DIVISIONS;
  readonly useCases: UseCaseScenario[] = MOKED_USE_CASES;

  // Autenticação e navegação hidratadas da Base TypeScript
  readonly isLoggedIn = signal<boolean>(this.initialDb.session.isLoggedIn);
  readonly currentUserEmail = signal<string>(this.initialDb.session.currentUserEmail);
  readonly activeRole = signal<UserRole>(this.initialDb.session.activeRole);
  readonly selectedContractId = signal<string>(this.initialDb.session.selectedContractId);
  readonly selectedDivision = signal<DivisionCode>(this.initialDb.session.selectedDivision);
  readonly toastMessage = signal<string | null>(null);
  readonly dbLastSyncedAt = signal<string>(this.initialDb.updatedAt);

  readonly activeClientAccount = signal<'CLI-A' | 'CLI-B' | 'CLI-C'>(
    this.initialDb.session.activeClientAccount
  );
  readonly clientActiveTab = signal<'inicio' | 'meu-contrato' | 'treinamentos' | 'mais'>('inicio');

  readonly consultantActiveTab = signal<
    'minhas-areas' | 'area-detalhe' | 'nova-visita' | 'carteira' | 'ocorrencias' | 'orcamentos'
  >('minhas-areas');

  readonly leaderActiveTab = signal<
    | 'meu-turno'
    | 'falta-atraso'
    | 'treinamento'
    | 'ocorrencia'
    | 'sem-alteracao'
    | 'pendencias'
    | 'historico'
  >('meu-turno');
  readonly leaderSelectedPost = signal<string>(this.initialDb.session.leaderSelectedPost);

  readonly thirdPartyActiveTab = signal<'ordens-servico' | 'supervisao-posto' | 'meu-sla'>(
    'ordens-servico'
  );
  readonly centralActiveTab = signal<'painel-monitoramento' | 'novo-evento'>(
    'painel-monitoramento'
  );
  readonly trainingActiveTab = signal<
    'visao-equipe' | 'turmas-presenca' | 'nova-turma' | 'saldo-fv'
  >('visao-equipe');
  readonly managementActiveTab = signal<
    | 'visao-executiva'
    | 'atencao-ocorrencias'
    | 'xray-contrato'
    | 'bi-visitas-treinamentos'
    | 'decisoes-relatos'
    | 'auditoria'
    | 'modo-tv'
  >('visao-executiva');

  readonly clientAccounts = MOKED_CLIENT_ACCOUNTS;

  // Filtros globais do BI (Alta Gestão)
  readonly biPeriodFilter = signal<'Semana' | 'Mês' | 'Trimestre'>('Semana');
  readonly biDivisionFilter = signal<DivisionCode | 'Todas'>('Todas');
  readonly biManagerFilter = signal<'Todos' | 'Gestor A' | 'Gestor B' | 'Gestor C' | 'Gestor D'>('Todos');
  readonly biContractFilter = signal<string>('Todos');

  // Tabelas reativas alimentadas pela Base de Dados TypeScript (moked.db.ts)
  readonly contracts = signal<Contract[]>(this.initialDb.tables.contracts);
  readonly timelineEvents = signal<TimelineEvent[]>(this.initialDb.tables.timelineEvents);
  readonly occurrences = signal<Occurrence[]>(this.initialDb.tables.occurrences);
  readonly visits = signal<VisitRecord[]>(this.initialDb.tables.visits);
  readonly budgets = signal<BudgetProposal[]>(this.initialDb.tables.budgets);
  readonly trainings = signal<TrainingSession[]>(this.initialDb.tables.trainings);
  readonly shiftRecords = signal<ShiftRecord[]>(this.initialDb.tables.shiftRecords);
  readonly thirdPartySLAs = signal<ThirdPartySLA[]>(this.initialDb.tables.thirdPartySLAs);
  readonly auditLogs = signal<AuditLogEntry[]>(this.initialDb.tables.auditLogs);
  readonly muralPraises = signal<MuralPraiseRecord[]>(this.initialDb.tables.muralPraises);
  readonly rankingMembers = signal<RankingMemberRecord[]>(this.initialDb.tables.rankingMembers);
  readonly ticketMessages = signal<TicketChatMessage[]>(this.initialDb.tables.ticketMessages);

  readonly dbTotalRecords = computed(() =>
    MokedDatabase.countRecords({
      contracts: this.contracts(),
      timelineEvents: this.timelineEvents(),
      occurrences: this.occurrences(),
      visits: this.visits(),
      budgets: this.budgets(),
      trainings: this.trainings(),
      shiftRecords: this.shiftRecords(),
      thirdPartySLAs: this.thirdPartySLAs(),
      auditLogs: this.auditLogs(),
      muralPraises: this.muralPraises(),
      rankingMembers: this.rankingMembers(),
      ticketMessages: this.ticketMessages(),
    })
  );

  constructor() {
    effect(() => {
      const updatedAt = new Date().toISOString();
      MokedDatabase.save({
        schemaVersion: 4,
        updatedAt,
        session: {
          isLoggedIn: this.isLoggedIn(),
          activeRole: this.activeRole(),
          currentUserEmail: this.currentUserEmail(),
          selectedContractId: this.selectedContractId(),
          activeClientAccount: this.activeClientAccount(),
          selectedDivision: this.selectedDivision(),
          leaderSelectedPost: this.leaderSelectedPost(),
        },
        tables: {
          contracts: this.contracts(),
          timelineEvents: this.timelineEvents(),
          occurrences: this.occurrences(),
          visits: this.visits(),
          budgets: this.budgets(),
          trainings: this.trainings(),
          shiftRecords: this.shiftRecords(),
          thirdPartySLAs: this.thirdPartySLAs(),
          auditLogs: this.auditLogs(),
          muralPraises: this.muralPraises(),
          rankingMembers: this.rankingMembers(),
          ticketMessages: this.ticketMessages(),
        },
      });
    });
  }

  resetDatabaseToSeed(): void {
    const fresh = MokedDatabase.reset();
    this.contracts.set(fresh.tables.contracts);
    this.timelineEvents.set(fresh.tables.timelineEvents);
    this.occurrences.set(fresh.tables.occurrences);
    this.visits.set(fresh.tables.visits);
    this.budgets.set(fresh.tables.budgets);
    this.trainings.set(fresh.tables.trainings);
    this.shiftRecords.set(fresh.tables.shiftRecords);
    this.thirdPartySLAs.set(fresh.tables.thirdPartySLAs);
    this.auditLogs.set(fresh.tables.auditLogs);
    this.muralPraises.set(fresh.tables.muralPraises);
    this.rankingMembers.set(fresh.tables.rankingMembers);
    this.ticketMessages.set(fresh.tables.ticketMessages);
    this.dbLastSyncedAt.set(fresh.updatedAt);
    this.showToast('Base TypeScript restaurada para o estado inicial Moked.');
  }

  // Computed helpers
  readonly selectedContract = computed(
    () =>
      this.contracts().find((c) => c.id === this.selectedContractId()) ??
      this.contracts()[1]
  );

  readonly clientTimeline = computed(() =>
    this.timelineEvents().filter(
      (e) =>
        e.contractId === this.selectedContractId() && e.publishedToClient
    )
  );

  readonly allContractTimeline = computed(() =>
    this.timelineEvents().filter((e) => e.contractId === this.selectedContractId())
  );

  readonly portfolioSummary = computed(() => {
    const list = this.contracts();
    const emDia = list.filter((c) => c.health.overall === 'em-dia').length;
    const atencao = list.filter((c) => c.health.overall === 'atencao').length;
    const criticos = list.filter((c) => c.health.overall === 'critico').length;
    const visited = list.filter((c) => c.completedVisitsMonth > 0).length;
    return {
      total: list.length,
      emDia,
      atencao,
      criticos,
      visited,
      coveragePercent: Math.round((visited / list.length) * 100),
    };
  });

  // Métodos de ação interativa
  setRole(role: UserRole): void {
    this.activeRole.set(role);
    const meta = this.roles.find((r) => r.id === role);
    if (meta) {
      this.currentUserEmail.set(meta.defaultEmail);
    }
    if (role === 'cliente') {
      const cli = this.clientAccounts.find((c) => c.id === this.activeClientAccount());
      if (cli) {
        this.selectedContractId.set(cli.contractId);
        this.currentUserEmail.set(cli.email);
      }
    }
    this.showToast(`Perfil alternado para ${meta?.label ?? role}`);
  }

  loginAsClientAccount(clientAccountId: 'CLI-A' | 'CLI-B' | 'CLI-C'): void {
    const cli = this.clientAccounts.find((c) => c.id === clientAccountId);
    if (!cli) return;
    this.activeClientAccount.set(clientAccountId);
    this.activeRole.set('cliente');
    this.selectedContractId.set(cli.contractId);
    this.currentUserEmail.set(cli.email);
    this.isLoggedIn.set(true);
    this.showToast(`Acesso autenticado como ${cli.fullName} (Escopo restrito ao ${cli.contractId})`);
  }

  loginWithProfile(email: string, role: UserRole): void {
    this.currentUserEmail.set(email || 'nome@empresa.com.br');
    this.activeRole.set(role);
    if (role === 'cliente') {
      if (email.toLowerCase().includes('contratoa') || email.toLowerCase().includes('cliente.a')) {
        this.activeClientAccount.set('CLI-A');
        this.selectedContractId.set('CT-A');
      } else if (email.toLowerCase().includes('contratoc') || email.toLowerCase().includes('cliente.c')) {
        this.activeClientAccount.set('CLI-C');
        this.selectedContractId.set('CT-C');
      } else {
        this.activeClientAccount.set('CLI-B');
        this.selectedContractId.set('CT-B');
      }
    }
    this.isLoggedIn.set(true);
    this.showToast(`Bem-vindo ao Olam · Acesso autenticado como ${role.toUpperCase()}`);
  }

  logout(): void {
    this.isLoggedIn.set(false);
  }

  selectContract(contractId: string): void {
    this.selectedContractId.set(contractId);
  }

  // 01 Cliente: aprovar/recusar/comentar orçamento
  decideBudget(budgetId: string, decision: 'aprovado' | 'recusado', commentText?: string): void {
    this.budgets.update((list) =>
      list.map((b) => {
        if (b.id !== budgetId) return b;
        const updatedComments = commentText?.trim()
          ? [
              ...b.comments,
              {
                author: 'Cliente (Contrato B)',
                role: '01 | Cliente',
                text: commentText.trim(),
                date: 'Agora',
              },
            ]
          : b.comments;
        return {
          ...b,
          status: decision,
          comments: updatedComments,
          history: [
            ...b.history,
            {
              step:
                decision === 'aprovado'
                  ? 'Orçamento APROVADO pelo Cliente'
                  : 'Orçamento RECUSADO pelo Cliente',
              date: 'Agora',
              actor: 'Cliente (Contrato B)',
            },
          ],
        };
      })
    );

    this.addTimelineEvent({
      contractId: this.selectedContractId(),
      date: 'Hoje',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title:
        decision === 'aprovado'
          ? 'Orçamento de reforço aprovado pelo cliente'
          : 'Orçamento de reforço recusado pelo cliente',
      description: `Decisão registrada no histórico sobre "Reforço da equipe no horário de pico (R$ 2.000/mês)".`,
      category: 'orcamento',
      author: 'Cliente',
      authorRole: 'cliente',
      publishedToClient: true,
    });

    this.addAuditLog(
      this.selectedContractId(),
      'Cliente do Contrato',
      '01 | Cliente',
      'APROVOU',
      'Orçamento',
      budgetId,
      `Cliente decidiu: ${decision.toUpperCase()} para proposta de reforço de equipe.`
    );
    this.showToast(
      decision === 'aprovado'
        ? 'Orçamento aprovado! O consultor foi notificado para iniciar a execução.'
        : 'Decisão registrada no histórico do contrato.'
    );
  }

  addBudgetComment(budgetId: string, author: string, roleLabel: string, text: string): void {
    if (!text.trim()) return;
    this.budgets.update((list) =>
      list.map((b) =>
        b.id === budgetId
          ? {
              ...b,
              comments: [
                ...b.comments,
                { author, role: roleLabel, text: text.trim(), date: 'Agora' },
              ],
            }
          : b
      )
    );
    this.showToast('Comentário enviado para acompanhamento do consultor.');
  }

  // 02 Consultor: registrar ou agendar nova visita de campo
  registerConsultantVisit(payload: {
    contractId: string;
    division: DivisionCode;
    activityType?: 'visita' | 'treinamento' | 'problema';
    dateTime?: string;
    visitMode?: 'concluida' | 'agendada';
    summary: string;
    improvementRegistered: string;
    photos?: string[];
    pendingIssueDescription?: string;
    pendingResponsible?: string;
    pendingDeadline?: string;
    divisionFields: Record<string, string>;
  }): void {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const parts = (payload.dateTime || '01/11/2026 10:00').trim().split(/\s+/);
    const visitDate = parts[0] || 'Hoje';
    const visitTime = parts[1] || '10:00';
    const attachedPhotos =
      payload.photos && payload.photos.length > 0
        ? payload.photos
        : ['/assets/p13_img_7.png'];
    const mainPhoto = attachedPhotos[0];
    const mode = payload.visitMode || 'concluida';
    const actType = payload.activityType || 'visita';

    const newVisit: VisitRecord = {
      id: `VIS-0${this.visits().length + 1}`,
      contractId: payload.contractId,
      division: payload.division,
      activityType: actType,
      visitorName: 'Carlos Mendes (Consultor)',
      visitorRole: 'consultor',
      date: visitDate,
      entryTime: visitTime,
      exitTime: mode === 'agendada' ? 'Agendada' : nowTime,
      durationMinutes: mode === 'agendada' ? 0 : 45,
      status: mode,
      summary: payload.summary,
      improvementRegistered: payload.improvementRegistered,
      checklist: [
        { label: 'Entrada e saída registradas com usuário automático', checked: true },
        { label: 'Checklist da divisão preenchido', checked: true },
        { label: 'Ao menos uma melhoria registrada', checked: true },
        { label: 'Evidência fotográfica anexada', checked: attachedPhotos.length > 0 },
      ],
      divisionFields: payload.divisionFields,
      photoUrl: mainPhoto,
      photos: attachedPhotos,
      validatedByConsultant: true,
      publishedToClient: true,
    };

    this.visits.update((v) => [newVisit, ...v]);

    // Atualiza indicadores do contrato quando a visita é concluída
    if (mode === 'concluida') {
      this.contracts.update((list) =>
        list.map((c) => {
          if (c.id !== payload.contractId) return c;
          const nextCompleted = c.completedVisitsMonth + 1;
          const nextPct = Math.min(
            100,
            Math.round((nextCompleted / Math.max(1, c.plannedVisitsMonth)) * 100)
          );
          return {
            ...c,
            completedVisitsMonth: nextCompleted,
            daysSinceLastVisit: 0,
            gauges: {
              ...c.gauges,
              plannedVisits: nextPct,
              improvementPlan: Math.min(100, c.gauges.improvementPlan + 5),
            },
          };
        })
      );
    }

    const titleByAct =
      actType === 'treinamento'
        ? `Treinamento em campo (${payload.division})`
        : actType === 'problema'
        ? `Problema registrado em visita (${payload.division})`
        : mode === 'agendada'
        ? `Visita agendada (${payload.division})`
        : `Visita de consultoria (${payload.division})`;

    this.addTimelineEvent({
      contractId: payload.contractId,
      date: visitDate,
      time: visitTime,
      title: titleByAct,
      description: `${payload.summary}${
        payload.improvementRegistered ? ' · Melhoria: ' + payload.improvementRegistered : ''
      }`,
      category: actType === 'treinamento' ? 'treinamento' : 'visita-consultoria',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
      validatedBy: 'Carlos Mendes',
      validatedAt: `${visitDate} · ${visitTime}`,
      photoUrl: mainPhoto,
      photoCaption: `Evidência (${payload.division})`,
    });

    if (actType === 'problema' || payload.pendingIssueDescription?.trim()) {
      const issueTitle =
        payload.pendingIssueDescription?.trim() || payload.summary.trim();
      const occId = `OC-0${this.occurrences().length + 1}`;
      this.occurrences.update((list) => [
        {
          id: occId,
          code: `CH-${1251 + list.length}`,
          contractId: payload.contractId,
          division: payload.division,
          title: issueTitle,
          equipment: `Divisão ${payload.division}`,
          location: 'Unidade do contrato',
          priority: 'alta',
          origin: 'Visita de campo',
          description: issueTitle,
          immediateAction: 'Ação aberta pelo consultor durante registro de campo.',
          responsible: payload.pendingResponsible || 'Equipe técnica',
          deadline: payload.pendingDeadline || '05/11/2026',
          status: 'manutencao',
          isOverdue: false,
          isCritical: false,
          publishedToClient: true,
          clientStatusText: `Ação em tratamento: ${issueTitle}`,
          leaderStatusText: 'Pendência aberta em visita do consultor.',
          consultantNotes: 'Criada durante visita de campo com responsável e prazo definidos.',
          evidencePhoto: mainPhoto,
          createdAt: `${visitDate} · ${visitTime}`,
        },
        ...list,
      ]);
    }

    this.addAuditLog(
      payload.contractId,
      'Carlos Mendes',
      '02 | Consultor',
      'CRIOU',
      mode === 'agendada' ? 'Agendamento de Visita' : 'Visita de Campo',
      newVisit.id,
      `Registrou ${actType} na divisão ${payload.division} (${visitDate} ${visitTime}) com ${attachedPhotos.length} foto(s).`
    );
    this.showToast(
      mode === 'agendada'
        ? `Visita agendada para ${visitDate} às ${visitTime} no contrato ${payload.contractId}!`
        : 'Visita salva com foto e resumo, vinculada ao contrato e liberada para o Cliente!'
    );
  }

  // 02 Consultor: Validar reparo e publicar ao cliente
  validateAndPublishOccurrence(occurrenceId: string): void {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    let targetContract = this.selectedContractId();
    let targetTitle = '';

    this.occurrences.update((list) =>
      list.map((occ) => {
        if (occ.id !== occurrenceId) return occ;
        targetContract = occ.contractId;
        targetTitle = occ.title;
        return {
          ...occ,
          status: 'validada',
          isOverdue: false,
          publishedToClient: true,
          validatedAt: `Hoje · ${nowTime}`,
          clientStatusText: `Reparo validado pelo consultor (${nowTime}). Equipamento operando normalmente.`,
          leaderStatusText: `Baixa validada pelo consultor (${nowTime}).`,
        };
      })
    );

    // Atualiza saúde do Contrato B para "em-dia" se o CFTV 03 for validado
    if (occurrenceId === 'OC-01') {
      this.contracts.update((list) =>
        list.map((c) =>
          c.id === 'CT-B'
            ? {
                ...c,
                health: {
                  ...c.health,
                  overall: 'em-dia',
                  rt: 'em-dia',
                  rtSummary: 'Câmera CFTV 03 reparada e validada pelo consultor',
                  alertBanner: 'TODOS OS SISTEMAS OPERACIONAIS (REPARO CFTV 03 VALIDADO)',
                },
              }
            : c
        )
      );
    }

    this.addTimelineEvent({
      contractId: targetContract,
      date: 'Hoje',
      time: nowTime,
      title: `Reparo validado e liberado: ${targetTitle}`,
      description: 'O consultor conferiu a evidência técnica, validou o reparo e liberou a atualização ao cliente.',
      category: 'ocorrencia',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
      validatedBy: 'Carlos Mendes',
      validatedAt: `Hoje · ${nowTime}`,
      photoUrl: '/assets/p13_img_9.png',
      photoCaption: 'Evidência validada pelo consultor',
    });

    this.addAuditLog(
      targetContract,
      'Carlos Mendes',
      '02 | Consultor',
      'VALIDOU',
      'Ocorrência',
      occurrenceId,
      `Validou o encerramento de "${targetTitle}" e publicou para o Cliente.`
    );
    this.showToast('Reparo validado e atualização liberada para a Linha do Tempo do Cliente!');
  }

  // 03 Líder de Posto: registrar turno (Falta/Atraso, Treinamento, Ocorrência, Turno sem alteração)
  registerLeaderShiftEntry(payload: {
    type: 'falta' | 'atraso' | 'treinamento' | 'ocorrencia' | 'sem-alteracao';
    postName?: string;
    shift?: string;
    leaderName?: string;
    date?: string;
    time?: string;
    incidentCategory?: string;
    employeeName?: string;
    isCritical?: boolean;
    description: string;
    immediateAction?: string;
    photoUrl?: string;
    photos?: string[];
  }): void {
    const nowTime =
      payload.time ||
      new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    const postLabel = payload.postName || this.leaderSelectedPost() || 'Posto Exemplo';
    const shiftLabel = payload.shift || 'Diurno (06h às 18h)';
    const leaderLabel = payload.leaderName || 'Sérgio Oliveira (Líder de Posto)';
    const photoList =
      payload.photos && payload.photos.length > 0
        ? payload.photos
        : payload.photoUrl
          ? [payload.photoUrl]
          : payload.type === 'ocorrencia'
            ? ['/assets/p13_img_8.png']
            : [];
    const mainPhoto = photoList[0];

    const newShift: ShiftRecord = {
      id: `SHF-0${this.shiftRecords().length + 1}`,
      contractId: this.selectedContractId(),
      postName: postLabel,
      leaderName: leaderLabel,
      date: payload.date || 'Hoje',
      time: nowTime,
      shift: shiftLabel,
      type: payload.type,
      incidentCategory: payload.incidentCategory,
      employeeName: payload.employeeName,
      isCritical: payload.isCritical,
      description: payload.description,
      immediateAction: payload.immediateAction,
      photoUrl: mainPhoto,
      photos: photoList,
      status: payload.type === 'sem-alteracao' ? 'validado' : 'registrado',
    };

    this.shiftRecords.update((list) => [newShift, ...list]);

    if (payload.type === 'ocorrencia' || (payload.type === 'falta' && payload.isCritical)) {
      const newOcc: Occurrence = {
        id: `OC-0${this.occurrences().length + 1}`,
        code: `PST-${100 + this.occurrences().length}`,
        contractId: this.selectedContractId(),
        division: 'MOKPAT',
        title:
          payload.type === 'falta'
            ? `Falta crítica no posto: ${payload.employeeName || 'Vigilante'}`
            : payload.incidentCategory
              ? `${payload.incidentCategory} — ${postLabel}`
              : payload.description,
        equipment: postLabel,
        location: postLabel,
        priority: payload.isCritical ? 'grave' : 'alta',
        origin: 'Líder de Posto',
        description: payload.description,
        immediateAction: payload.immediateAction || 'Acesso bloqueado e consultor avisado.',
        responsible: 'Consultor do Contrato',
        deadline: 'Hoje',
        status: 'aguardando-validacao',
        isOverdue: false,
        isCritical: !!payload.isCritical,
        publishedToClient: false,
        clientStatusText: 'Em análise pelo consultor responsável.',
        leaderStatusText: 'Relato enviado ao consultor · Aguardando validação.',
        consultantNotes: `Recebido do Líder de Posto (${postLabel}) às ${nowTime}.`,
        evidencePhoto: mainPhoto || '/assets/p13_img_8.png',
        createdAt: `${payload.date || 'Hoje'} · ${nowTime}`,
      };
      this.occurrences.update((list) => [newOcc, ...list]);
    }

    this.addAuditLog(
      this.selectedContractId(),
      'Sérgio Oliveira',
      '03 | Líder de Posto',
      'CRIOU',
      `Registro de Turno (${payload.type})`,
      newShift.id,
      `${postLabel}: ${payload.description}`
    );
    this.showToast('Registro do turno enviado com sucesso ao Consultor da Moked!');
  }

  // 04 Terceirizados: concluir visita técnica ou aprovar multa SLA
  completeTechnicalService(occurrenceId: string, serviceNote: string, hasImpediment: boolean): void {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.occurrences.update((list) =>
      list.map((o) => {
        if (o.id !== occurrenceId) return o;
        if (hasImpediment) {
          return {
            ...o,
            status: 'aguardando-reparo',
            impediment: serviceNote,
            leaderStatusText: `Impedimento técnico registrado: ${serviceNote}`,
            consultantNotes: `Técnico registrou impedimento às ${nowTime}: ${serviceNote}`,
          };
        }
        return {
          ...o,
          status: 'aguardando-validacao',
          evidencePhoto: '/assets/p13_img_9.png',
          leaderStatusText: 'Reparo concluído pelo técnico · Aguardando validação do consultor.',
          consultantNotes: `Serviço concluído às ${nowTime}: ${serviceNote}. Pronto para validação.`,
        };
      })
    );

    this.addAuditLog(
      this.selectedContractId(),
      'Roberto Alves',
      '04A | Técnico Terceirizado',
      'ALTEROU',
      'Ordem de Serviço / Ocorrência',
      occurrenceId,
      hasImpediment
        ? `Registrou impedimento técnico: ${serviceNote}`
        : `Concluiu reparo técnico com checklist e foto: ${serviceNote}`
    );

    this.showToast(
      hasImpediment
        ? 'Impedimento registrado! O consultor e a gestão receberão alerta se o prazo vencer.'
        : 'Reparo registrado com foto! Enviado para validação do Consultor.'
    );
  }

  approveAndPublishSlaFine(slaId: string): void {
    this.thirdPartySLAs.update((list) =>
      list.map((s) =>
        s.id === slaId ? { ...s, fineStatus: 'publicada-cliente' } : s
      )
    );
    const sla = this.thirdPartySLAs().find((s) => s.id === slaId);
    if (sla) {
      this.addTimelineEvent({
        contractId: sla.contractId,
        date: 'Hoje',
        time: '11h15',
        title: `SLA Terceirizados · Multa aprovada (R$ ${sla.fineAmount},00)`,
        description: `${sla.serviceType} · Motivo: ${sla.reason}`,
        category: 'sla',
        author: 'Alta Gestão / Consultor',
        authorRole: 'alta-gestao',
        publishedToClient: true,
      });
      this.addAuditLog(
        sla.contractId,
        'Alta Gestão',
        '07 | Alta Gestão',
        'APROVOU',
        'Multa de SLA',
        sla.id,
        `Multa de R$ ${sla.fineAmount},00 aprovada e liberada no histórico do contrato.`
      );
    }
    this.showToast('Multa aprovada pela Gestão e liberada para visualização do Cliente!');
  }

  // 05 Central de Monitoramento: registrar falha técnica ou ocorrência grave
  registerCentralOccurrence(payload: {
    contractId: string;
    location: string;
    equipment: string;
    priority: 'rotina' | 'alta' | 'grave';
    description: string;
    immediateAction: string;
  }): void {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newOcc: Occurrence = {
      id: `OC-0${this.occurrences().length + 1}`,
      code: `MON-${200 + this.occurrences().length}`,
      contractId: payload.contractId,
      division: 'MOKTEC',
      title: `${payload.equipment} — ${payload.description}`,
      equipment: payload.equipment,
      location: payload.location,
      priority: payload.priority,
      origin: 'Central de Monitoramento',
      description: payload.description,
      immediateAction: payload.immediateAction,
      responsible: `Consultor do ${payload.contractId}`,
      deadline: 'Hoje, 17h',
      status: 'aberta',
      isOverdue: false,
      isCritical: payload.priority === 'grave',
      publishedToClient: false,
      clientStatusText: 'Evento técnico identificado pela Central · Equipe acionada.',
      leaderStatusText: `Alerta da Central: ${payload.equipment} (${payload.location})`,
      consultantNotes:
        payload.priority === 'grave'
          ? 'OCORRÊNCIA GRAVE: Alerta imediato enviado à Alta Gestão e ao Consultor.'
          : 'Falha técnica registrada pela Central — alimenta o indicador RT.',
      evidencePhoto: '/assets/p13_img_8.png',
      downtime: 'Em curso',
      firstResponseTime: 'Imediato',
      createdAt: `Hoje · ${nowTime}`,
    };

    this.occurrences.update((list) => [newOcc, ...list]);
    this.addAuditLog(
      payload.contractId,
      'Central de Monitoramento',
      '05 | Monitoramento',
      payload.priority === 'grave' ? 'ESCALOU' : 'CRIOU',
      'Ocorrência Central',
      newOcc.id,
      `Registrou "${newOcc.title}" (${payload.priority.toUpperCase()}) com captura anexada.`
    );
    this.showToast(
      payload.priority === 'grave'
        ? 'Ocorrência GRAVE registrada! Alerta imediato disparado para a Alta Gestão e Consultor.'
        : 'Falha técnica registrada pela Central e encaminhada ao Consultor (alimentando o RT).'
    );
  }

  // 06 Treinamento: alternar presença e registrar reposição
  toggleTrainingAttendance(sessionId: string, participantName: string): void {
    this.trainings.update((list) =>
      list.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          participants: session.participants.map((p) => {
            if (p.name !== participantName) return p;
            const nowPresent = !p.present;
            return {
              ...p,
              present: nowPresent,
              pointsEarned: nowPresent ? 10 : 0,
              makeupStatus: nowPresent ? 'em-dia' : 'pendente',
            };
          }),
        };
      })
    );
    this.showToast(`Presença atualizada para ${participantName} (presença soma +10 pontos no cadastro).`);
  }

  completeTrainingMakeup(sessionId: string, participantName: string): void {
    this.trainings.update((list) =>
      list.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          participants: session.participants.map((p) =>
            p.name === participantName
              ? { ...p, present: true, pointsEarned: 10, makeupStatus: 'concluida' }
              : p
          ),
        };
      })
    );
    this.addAuditLog(
      this.selectedContractId(),
      'Rafael (Treinamento)',
      '06 | Treinamento',
      'ALTEROU',
      'Reposição de Treinamento',
      sessionId,
      `Registrou conclusão da reposição de ${participantName} (+10 pontos no cadastro).`
    );
    this.showToast(`Reposição de ${participantName} concluída! Cobertura da turma atualizada para 100%.`);
  }

  // MOKED RESOLVE: Registro guiado em 4 etapas (Ideia, Ocorrência/Crítica ou Elogio)
  registerResolveTicket(payload: {
    kind: 'ideia' | 'critica' | 'elogio';
    contractId: string;
    division: DivisionCode;
    location: string;
    title: string;
    description: string;
    priority: 'rotina' | 'alta' | 'grave';
    anonymous: boolean;
    reporterName?: string;
    recipientName?: string;
  }): string {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const seq = 100 + this.occurrences().length + this.timelineEvents().length + 1;
    const protocol = `MKD-${seq}`;
    const contract = this.contracts().find((c) => c.id === payload.contractId) ?? this.selectedContract();
    const actorName = payload.anonymous
      ? 'Colaborador / Cliente Anônimo'
      : payload.reporterName?.trim() || `${this.currentUserEmail()}`;
    const divisionMeta = this.divisions.find((d) => d.code === payload.division);

    const kindLabel =
      payload.kind === 'ideia'
        ? 'Ideia / Melhoria'
        : payload.kind === 'elogio'
          ? 'Elogio à Equipe'
          : 'Ocorrência / Crítica';

    const newOcc: Occurrence = {
      id: `OC-${String(this.occurrences().length + 1).padStart(2, '0')}`,
      code: protocol,
      contractId: contract.id,
      division: payload.division,
      title: payload.title.trim(),
      equipment: `${kindLabel} · ${divisionMeta?.name ?? payload.division}`,
      location: payload.location.trim() || contract.unit,
      priority: payload.priority,
      origin: 'Visita de campo',
      description: payload.description.trim(),
      immediateAction: `Direcionado automaticamente para a divisão ${payload.division} (${contract.consultant}).`,
      responsible: contract.consultant || 'Consultor Moked',
      deadline: payload.priority === 'grave' ? 'Imediato (2h)' : '24h úteis',
      status: payload.kind === 'elogio' ? 'validada' : 'aberta',
      isOverdue: false,
      isCritical: payload.priority === 'grave',
      publishedToClient: true,
      clientStatusText:
        payload.kind === 'elogio'
          ? `Reconhecimento publicado no Mural Moked (${protocol}).`
          : `Protocolo ${protocol} recebido · Em coordenação pela equipe ${payload.division}.`,
      leaderStatusText: `Registrado no Moked Resolve (${protocol}).`,
      consultantNotes: `Direcionamento automático Moked Resolve -> ${payload.division} às ${nowTime}.`,
      firstResponseTime: 'Em atendimento automático',
      createdAt: `Hoje · ${nowTime}`,
    };
    this.occurrences.update((list) => [newOcc, ...list]);

    this.ticketMessages.update((list) => [
      {
        id: `MSG-${Date.now()}`,
        occurrenceCode: protocol,
        author: actorName,
        roleLabel: payload.anonymous ? 'Registro Anônimo' : 'Solicitante',
        body: payload.description.trim(),
        timestamp: nowTime,
        isInternal: false,
      },
      {
        id: `MSG-${Date.now() + 1}`,
        occurrenceCode: protocol,
        author: 'Roteamento Moked 360',
        roleLabel: 'Direcionamento Automático',
        body: `Protocolo ${protocol} direcionado para ${payload.division} (${contract.name}) sob responsabilidade de ${contract.consultant}.`,
        timestamp: nowTime,
        isInternal: false,
      },
      ...list,
    ]);

    this.addTimelineEvent({
      contractId: contract.id,
      date: 'Hoje',
      time: nowTime,
      title: `${kindLabel} (${protocol}): ${payload.title.trim()}`,
      description: payload.description.trim(),
      category: payload.kind === 'elogio' ? 'reuniao' : 'ocorrencia',
      author: actorName,
      authorRole: this.activeRole(),
      publishedToClient: true,
    });

    if (payload.kind === 'elogio') {
      const praise: MuralPraiseRecord = {
        id: `MUR-${String(this.muralPraises().length + 1).padStart(2, '0')}`,
        author: actorName,
        authorRole: payload.anonymous ? 'Canal Anônimo Moked' : 'Moked Resolve',
        recipient: payload.recipientName?.trim() || `Equipe ${payload.division}`,
        contractId: contract.id,
        division: payload.division,
        title: payload.title.trim(),
        message: payload.description.trim(),
        date: `Hoje · ${nowTime}`,
        likes: 1,
        likedByMe: true,
        tone: 'emerald',
      };
      this.muralPraises.update((list) => [praise, ...list]);
    }

    this.addAuditLog(
      contract.id,
      actorName,
      'Moked Resolve',
      'CRIOU',
      kindLabel,
      protocol,
      `${payload.title.trim()} -> ${payload.division}`
    );

    this.showToast(`Protocolo ${protocol} gerado e salvo na Base TypeScript!`);
    return protocol;
  }

  addTicketChatMessage(occurrenceCode: string, author: string, roleLabel: string, body: string): void {
    const clean = body.trim();
    if (!clean) return;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.ticketMessages.update((list) => [
      ...list,
      {
        id: `MSG-${Date.now()}`,
        occurrenceCode,
        author: author.trim() || 'Consultor Moked',
        roleLabel,
        body: clean,
        timestamp: nowTime,
        isInternal: false,
      },
    ]);
    this.showToast(`Resposta enviada no protocolo ${occurrenceCode}.`);
  }

  advanceTicketStatus(occurrenceCode: string, nextStatus: Occurrence['status']): void {
    this.occurrences.update((list) =>
      list.map((occ) =>
        occ.code === occurrenceCode || occ.id === occurrenceCode
          ? {
              ...occ,
              status: nextStatus,
              clientStatusText:
                nextStatus === 'validada'
                  ? `Protocolo ${occ.code} concluído e validado pela coordenação Moked.`
                  : nextStatus === 'aguardando-validacao'
                    ? `Protocolo ${occ.code} em tratamento técnico pela divisão ${occ.division}.`
                    : occ.clientStatusText,
            }
          : occ
      )
    );
    this.showToast(`Status do protocolo ${occurrenceCode} atualizado!`);
  }

  toggleMuralLike(praiseId: string): void {
    this.muralPraises.update((list) =>
      list.map((p) => {
        if (p.id !== praiseId) return p;
        const likedByMe = !p.likedByMe;
        return {
          ...p,
          likedByMe,
          likes: likedByMe ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      })
    );
  }

  private addTimelineEvent(event: Omit<TimelineEvent, 'id'>): void {
    const newId = `TL-${(this.timelineEvents().length + 1).toString().padStart(2, '0')}`;
    this.timelineEvents.update((list) => [{ id: newId, ...event }, ...list]);
  }

  private addAuditLog(
    contractId: string,
    actor: string,
    actorRole: string,
    action: AuditLogEntry['action'],
    entityType: string,
    entityId: string,
    details: string
  ): void {
    const now = new Date().toLocaleString('pt-BR');
    const newEntry: AuditLogEntry = {
      id: `AUD-${(this.auditLogs().length + 1).toString().padStart(2, '0')}`,
      timestamp: now,
      contractId,
      actor,
      actorRole,
      action,
      entityType,
      entityId,
      details,
    };
    this.auditLogs.update((list) => [newEntry, ...list]);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }
}
