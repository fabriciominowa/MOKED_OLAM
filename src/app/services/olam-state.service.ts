import { Injectable, computed, signal } from '@angular/core';
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
  readonly roles: RoleMeta[] = [
    {
      id: 'cliente',
      code: '01',
      label: '01 | Cliente',
      shortLabel: 'Cliente',
      subtitle: 'Situação do contrato, evidências e decisões pendentes.',
      defaultEmail: 'cliente@contratob.com.br',
      scopeDescription: 'Somente seus contratos e registros liberados pelo consultor.',
    },
    {
      id: 'consultor',
      code: '02',
      label: '02 | Consultor',
      shortLabel: 'Consultor',
      subtitle: 'Visitas de campo, registros, validação e liberação ao cliente.',
      defaultEmail: 'consultor@moked.com.br',
      scopeDescription: 'Áreas, divisões e clientes sob sua responsabilidade.',
    },
    {
      id: 'lider',
      code: '03',
      label: '03 | Líder de Posto',
      shortLabel: 'Líder',
      subtitle: 'Rotina do posto, registros do turno e ocorrências.',
      defaultEmail: 'lider.posto@seguranca.com.br',
      scopeDescription: 'Postos e turnos autorizados.',
    },
    {
      id: 'terceirizados',
      code: '04',
      label: '04 | Terceirizados',
      shortLabel: 'Terceirizados',
      subtitle: '04A Técnico · 04B Supervisor de Segurança · 04C SLA e Multas.',
      defaultEmail: 'tecnico@terceirizada.com.br',
      scopeDescription: 'Ordens de serviço, checklists técnicos, supervisão de posto e SLA.',
    },
    {
      id: 'monitoramento',
      code: '05',
      label: '05 | Central de Monitoramento',
      shortLabel: 'Monitoramento',
      subtitle: 'Registro de ocorrências, falhas técnicas e providências.',
      defaultEmail: 'central@moked.com.br',
      scopeDescription: 'Detecção de eventos CFTV/alarme e acionamento do consultor/gestão.',
    },
    {
      id: 'treinamento',
      code: '06',
      label: '06 | Treinamento',
      shortLabel: 'Treinamento',
      subtitle: 'Rafael e equipe: presença, pontos, reposições e saldo de FV.',
      defaultEmail: 'rafael.treinamento@moked.com.br',
      scopeDescription: 'Turmas, convocados, controle de presença/reposição e FV por contrato.',
    },
    {
      id: 'alta-gestao',
      code: '07',
      label: '07 | Alta Gestão',
      shortLabel: 'Alta Gestão',
      subtitle: 'Presidência e gestores seniores: BI, Mapa de Calor, TV e X-Ray.',
      defaultEmail: 'eric.diretoria@moked.com.br',
      scopeDescription: 'Visão integral da operação (20 contratos), alertas graves e alçadas.',
    },
  ];

  readonly divisions: DivisionMeta[] = [
    {
      code: 'MOKIMP',
      name: 'Implantação',
      description: 'Etapas, cronograma e entrega da implantação operacional.',
      specificFields: [
        {
          key: 'etapaImplantacao',
          label: 'Etapa e entrega da implantação',
          placeholder: 'Ex.: Entrega da fase 2 de controle perimetral concluída',
        },
        {
          key: 'pendenciaImplantacao',
          label: 'Pendências de implantação',
          placeholder: 'Ex.: Homologação final dos leitores biométricos',
        },
      ],
    },
    {
      code: 'MOKPAT',
      name: 'Segurança Patrimonial',
      description: 'Postos, controle de acesso, efetivo e rondas patrimoniais.',
      specificFields: [
        {
          key: 'revisaoAcesso',
          label: 'Revisão do acesso e orientação da equipe',
          placeholder: 'Ex.: Revisão do protocolo de portaria principal e docas',
        },
        {
          key: 'efetivoPosto',
          label: 'Conferência de efetivo e posto',
          placeholder: 'Ex.: Efetivo completo (4/4) no turno diurno',
        },
      ],
    },
    {
      code: 'MOKVIP',
      name: 'Proteção Executiva / VIP',
      description: 'Atendimento dedicado, escolta e protocolos especiais.',
      specificFields: [
        {
          key: 'protocoloVip',
          label: 'Protocolo e itinerário revisado',
          placeholder: 'Ex.: Checagem avançada de rota e equipe de apoio',
        },
      ],
    },
    {
      code: 'MOKTEC',
      name: 'Tecnologia e Sistemas',
      description: 'CFTV, controle de acesso eletrônico, falha e restabelecimento.',
      specificFields: [
        {
          key: 'equipamentoAvaliado',
          label: 'Equipamento avaliado',
          placeholder: 'Ex.: Câmera CFTV 03 / Leitor de acesso principal',
        },
        {
          key: 'statusRestabelecimento',
          label: 'Falha e restabelecimento',
          placeholder: 'Ex.: Conector BNC e fonte substituídos, sinal online',
        },
      ],
    },
    {
      code: 'MOKLOG',
      name: 'Segurança Logística',
      description: 'Rotina de pátio, docas, conferência e desvios logísticos.',
      specificFields: [
        {
          key: 'rotinaLogistica',
          label: 'Rotina e desvios logísticos',
          placeholder: 'Ex.: Fluxo de docas auditado; sem desvios de lacre',
        },
      ],
    },
    {
      code: 'MOKRES',
      name: 'Segurança Residencial',
      description: 'Condomínios e residências de alto padrão.',
      specificFields: [
        {
          key: 'auditoriaPortaria',
          label: 'Auditoria de portaria e clausura',
          placeholder: 'Ex.: Teste de botão de pânico e eclusa de veículos OK',
        },
      ],
    },
    {
      code: 'P950',
      name: 'Projeto P950',
      description: 'Operações especiais e protocolos dedicados P950.',
      specificFields: [
        {
          key: 'conformidadeP950',
          label: 'Indicador de conformidade P950',
          placeholder: 'Ex.: 100% aderente ao checklist P950',
        },
      ],
    },
    {
      code: 'Treinamento',
      name: 'Treinamento em Campo',
      description: 'Capacitação operacional, reciclagens e simulações no posto.',
      specificFields: [
        {
          key: 'temaCapacitacao',
          label: 'Tema e instrutor',
          placeholder: 'Ex.: Controle de acesso e abordagem — 9 participantes',
        },
      ],
    },
  ];

  readonly useCases: UseCaseScenario[] = [
    {
      id: 'caso-01',
      code: 'Caso 01',
      title: 'Visita técnica',
      slidePage: 74,
      profilesInvolved: ['04A Técnico', '02 Consultor', '03 Líder', '01 Cliente'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Técnico terceirizado',
          role: 'terceirizados',
          title: 'Registra entrada',
          description: 'Seleciona o Contrato B na portaria principal e registra entrada às 09h12.',
        },
        {
          stepNumber: 2,
          actor: 'Técnico terceirizado',
          role: 'terceirizados',
          title: 'Executa o serviço',
          description: 'Realiza a substituição do conector e testa o sinal da Câmera CFTV 03.',
        },
        {
          stepNumber: 3,
          actor: 'Técnico terceirizado',
          role: 'terceirizados',
          title: 'Anexa evidências e registra saída',
          description: 'Preenche o checklist técnico, anexa foto da câmera e registra saída.',
        },
        {
          stepNumber: 4,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor valida',
          description: 'Confere o checklist e a foto anexada e valida a conclusão do reparo.',
        },
        {
          stepNumber: 5,
          actor: 'Líder e Cliente',
          role: 'cliente',
          title: 'Líder consulta · Cliente vê resumo liberado',
          description: 'O Líder acompanha no posto e o Cliente vê o resumo e a foto na linha do tempo.',
        },
      ],
    },
    {
      id: 'caso-02',
      code: 'Caso 02',
      title: 'Visita do consultor',
      slidePage: 75,
      profilesInvolved: ['02 Consultor', '01 Cliente', '07 Alta Gestão'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Registra a entrada',
          description: 'Escolhe a divisão (ex.: MOKPAT) e o contrato; data, hora e autor são automáticos.',
        },
        {
          stepNumber: 2,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Preenche o checklist e anexa fotos',
          description: 'Verifica acesso, equipe e equipamentos e anexa foto da visita.',
        },
        {
          stepNumber: 3,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Registra a melhoria e a saída',
          description: 'Registra ao menos uma melhoria obrigatória e conclui a saída (calcula duração).',
        },
        {
          stepNumber: 4,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Define responsável e prazo se houver pendência',
          description: 'Caso identifique falha (ex.: leitor de acesso), abre ação vinculada ao contrato.',
        },
        {
          stepNumber: 5,
          actor: 'Cliente e Gestão',
          role: 'alta-gestao',
          title: 'Cliente vê resumo liberado · Gestão acompanha no BI',
          description: 'Alimenta cobertura da carteira (16/20) e duração mediana (42 min) no BI.',
        },
      ],
    },
    {
      id: 'caso-03',
      code: 'Caso 03',
      title: 'Pendência fora do prazo',
      slidePage: 76,
      profilesInvolved: ['02 Consultor', '07 Alta Gestão', '01 Cliente'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor acompanha responsável e prazo',
          description: 'Monitora os chamados abertos da carteira (ex.: CH-1247, CH-1248).',
        },
        {
          stepNumber: 2,
          actor: 'Sistema Olam',
          role: 'monitoramento',
          title: 'Prazo vence',
          description: 'O chamado ultrapassa a data limite sem baixa validada.',
        },
        {
          stepNumber: 3,
          actor: 'Alta Gestão e Consultor Geral',
          role: 'alta-gestao',
          title: 'Consultor geral e gestão recebem alerta',
          description: 'Sinaliza no Mapa de Calor e no card de Ações Vencidas da Alta Gestão.',
        },
        {
          stepNumber: 4,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor valida o fechamento',
          description: 'Após execução e evidência, o consultor valida o encerramento.',
        },
        {
          stepNumber: 5,
          actor: 'Cliente',
          role: 'cliente',
          title: 'Cliente vê a atualização liberada',
          description: 'O status atualizado é publicado no histórico do contrato do cliente.',
        },
      ],
    },
    {
      id: 'caso-04',
      code: 'Caso 04',
      title: 'Presença e reposição',
      slidePage: 77,
      profilesInvolved: ['06 Treinamento', '01 Cliente', '07 Alta Gestão'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Equipe de Treinamento (Rafael)',
          role: 'treinamento',
          title: 'Equipe registra presença e ausência',
          description: 'Abre a turma do contrato e registra presentes (Ana, Carla) e ausente (Bruno).',
        },
        {
          stepNumber: 2,
          actor: 'Sistema Olam',
          role: 'treinamento',
          title: 'Presença soma pontos',
          description: 'Colaboradores presentes acumulam pontos automaticamente no cadastro.',
        },
        {
          stepNumber: 3,
          actor: 'Equipe de Treinamento',
          role: 'treinamento',
          title: 'Equipe acompanha reposições',
          description: 'Gera pendência de reposição para quem faltou (ex.: Bruno Lima).',
        },
        {
          stepNumber: 4,
          actor: 'Cliente',
          role: 'cliente',
          title: 'Cliente consulta cobertura',
          description: 'Visualiza 90% de equipe treinada, fotos da turma e lista de presença.',
        },
        {
          stepNumber: 5,
          actor: 'Alta Gestão',
          role: 'alta-gestao',
          title: 'Gestão acompanha cobertura e FV',
          description: 'Painel de BI exibe turmas realizadas (8/10), presença (90%) e saldo de FV.',
        },
      ],
    },
    {
      id: 'caso-05',
      code: 'Caso 05',
      title: 'Orçamento para aprovação',
      slidePage: 78,
      profilesInvolved: ['02 Consultor', '07 Alta Gestão', '01 Cliente'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor envia à gestão',
          description: 'Submete proposta de reforço no horário de pico (R$ 2.000/mês) para alçada interna.',
        },
        {
          stepNumber: 2,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor libera a proposta ao cliente',
          description: 'Após validação, disponibiliza justificativa, valor e impacto para o cliente.',
        },
        {
          stepNumber: 3,
          actor: 'Cliente',
          role: 'cliente',
          title: 'Cliente aprova ou recusa',
          description: 'Cliente analisa o motivo do alerta, comenta e registra sua decisão.',
        },
        {
          stepNumber: 4,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor acompanha a execução',
          description: 'Decisão fica gravada no histórico auditável e inicia a implantação do reforço.',
        },
      ],
    },
    {
      id: 'caso-06',
      code: 'Caso 06',
      title: 'Ocorrência grave',
      slidePage: 79,
      profilesInvolved: ['03 Líder / 05 Central', '07 Alta Gestão', '02 Consultor', '01 Cliente'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Líder ou Central',
          role: 'lider',
          title: 'Líder ou Central registra',
          description: 'Registra tentativa de invasão ou ocorrência grave no posto com providência imediata.',
        },
        {
          stepNumber: 2,
          actor: 'Alta Gestão',
          role: 'alta-gestao',
          title: 'Gestão recebe alerta imediato',
          description: 'Prioridade grave dispara notificação imediata para Presidência e Diretoria.',
        },
        {
          stepNumber: 3,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor coordena o atendimento',
          description: 'Assume a coordenação em campo, reúne evidências e acompanha as ações.',
        },
        {
          stepNumber: 4,
          actor: 'Cliente',
          role: 'cliente',
          title: 'Cliente vê o comunicado liberado',
          description: 'Recebe o comunicado oficial validado pelo consultor no aplicativo.',
        },
      ],
    },
    {
      id: 'caso-07',
      code: 'Caso 07',
      title: 'Câmera fora do ar',
      slidePage: 80,
      profilesInvolved: ['05 Central', '02 Consultor', '04A Técnico', '01 Cliente'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Central de Monitoramento',
          role: 'monitoramento',
          title: 'Central registra a falha',
          description: 'Detecta Câmera CFTV 03 fora do ar às 08h42, anexa captura e vincula ao Contrato B.',
        },
        {
          stepNumber: 2,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor recebe o alerta',
          description: 'Reúne relatos (Central + Líder), define Equipe Técnica como responsável e prazo Hoje 17h.',
        },
        {
          stepNumber: 3,
          actor: 'Técnico terceirizado',
          role: 'terceirizados',
          title: 'Técnico registra o reparo com evidência',
          description: 'Substitui conector, testa imagem e anexa foto do reparo concluído.',
        },
        {
          stepNumber: 4,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor valida',
          description: 'Confere a evidência às 16h30 e libera a atualização para o cliente.',
        },
        {
          stepNumber: 5,
          actor: 'Cliente',
          role: 'cliente',
          title: 'Cliente vê o status liberado',
          description: 'Visualiza toda a linha do tempo (08h42 → 16h30) e a foto da câmera restabelecida.',
        },
      ],
    },
    {
      id: 'caso-08',
      code: 'Caso 08',
      title: 'Falta no posto',
      slidePage: 81,
      profilesInvolved: ['03 Líder', '02 Consultor', '07 Alta Gestão'],
      steps: [
        {
          stepNumber: 1,
          actor: 'Líder de Posto',
          role: 'lider',
          title: 'Líder registra a falta',
          description: 'No menu Meu Turno, seleciona Falta ou Atraso e identifica colaborador e horário.',
        },
        {
          stepNumber: 2,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor recebe alerta se a falta for crítica',
          description: 'Faltas em postos críticos disparam aviso imediato ao consultor responsável.',
        },
        {
          stepNumber: 3,
          actor: 'Consultor',
          role: 'consultor',
          title: 'Consultor acompanha a cobertura',
          description: 'Aciona reserva/substituição e acompanha horário de chegada no posto.',
        },
        {
          stepNumber: 4,
          actor: 'Alta Gestão',
          role: 'alta-gestao',
          title: 'Gestão acompanha conforme a prioridade',
          description: 'Reflete nos indicadores de cobertura, substituições no mês e SLA.',
        },
      ],
    },
  ];

  // Autenticação e navegação
  readonly isLoggedIn = signal<boolean>(true);
  readonly currentUserEmail = signal<string>('cliente.b@contratob.com.br');
  readonly activeRole = signal<UserRole>('cliente');
  readonly selectedContractId = signal<string>('CT-B');
  readonly selectedDivision = signal<DivisionCode>('MOKPAT');
  readonly toastMessage = signal<string | null>(null);

  // Controle exclusivo dos 3 Clientes (Cliente A, Cliente B e Cliente C)
  // Cada cliente enxerga APENAS o seu próprio contrato e APENAS a área do Cliente
  readonly activeClientAccount = signal<'CLI-A' | 'CLI-B' | 'CLI-C'>('CLI-B');
  readonly clientActiveTab = signal<'inicio' | 'meu-contrato' | 'treinamentos' | 'mais'>('inicio');

  // Aba/Página ativa do Consultor ('minhas-areas' | 'area-detalhe' | 'nova-visita' | 'carteira' | 'ocorrencias' | 'orcamentos')
  readonly consultantActiveTab = signal<
    'minhas-areas' | 'area-detalhe' | 'nova-visita' | 'carteira' | 'ocorrencias' | 'orcamentos'
  >('minhas-areas');

  // Aba/Página ativa do Líder de Posto (03 | Líder de Posto)
  readonly leaderActiveTab = signal<
    | 'meu-turno'
    | 'falta-atraso'
    | 'treinamento'
    | 'ocorrencia'
    | 'sem-alteracao'
    | 'pendencias'
    | 'historico'
  >('meu-turno');
  readonly leaderSelectedPost = signal<string>('Posto Exemplo');

  // Abas ativas dos demais perfis (controladas diretamente pela barra lateral)
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

  readonly clientAccounts = [
    {
      id: 'CLI-A' as const,
      shortName: 'Cliente A',
      fullName: 'Cliente A · Sede Paulista',
      email: 'cliente.a@contratoa.com.br',
      contractId: 'CT-A',
    },
    {
      id: 'CLI-B' as const,
      shortName: 'Cliente B',
      fullName: 'Cliente B · Portaria Loja 24',
      email: 'cliente.b@contratob.com.br',
      contractId: 'CT-B',
    },
    {
      id: 'CLI-C' as const,
      shortName: 'Cliente C',
      fullName: 'Cliente C · Centro Logístico',
      email: 'cliente.c@contratoc.com.br',
      contractId: 'CT-C',
    },
  ];

  // Filtros globais do BI (Alta Gestão)
  readonly biPeriodFilter = signal<'Semana' | 'Mês' | 'Trimestre'>('Semana');
  readonly biDivisionFilter = signal<DivisionCode | 'Todas'>('Todas');
  readonly biManagerFilter = signal<'Todos' | 'Gestor A' | 'Gestor B' | 'Gestor C' | 'Gestor D'>('Todos');
  readonly biContractFilter = signal<string>('Todos');

  // Carteira de 20 contratos (14 em dia, 4 em atenção, 2 críticos — conforme página 67)
  readonly contracts = signal<Contract[]>([
    {
      id: 'CT-A',
      code: 'Contrato 001',
      name: 'Contrato A',
      unit: 'Sede Corporativa Paulista',
      address: 'Av. Paulista, 1400 - Bela Vista, SP',
      division: 'MOKPAT',
      manager: 'Gestor A',
      consultant: 'Carlos Mendes',
      health: {
        overall: 'em-dia',
        rh: 'em-dia',
        rt: 'em-dia',
        ra: 'em-dia',
        rhSummary: 'Equipe completa · 100% treinada',
        rtSummary: '16 câmeras e controle de acesso 100% operacionais',
        raSummary: 'Pagamentos e documentação em dia',
      },
      gauges: { improvementPlan: 92, plannedVisits: 100, trainedTeam: 95 },
      teamMetrics: {
        replacementsMonth: 1,
        dismissalsMonth: 1,
        avgHeadcount: 25,
        turnoverPercent: 4,
        trainingsCompleted: 3,
        participationsRecorded: 24,
      },
      fv: { planned: 120, used: 110, balance: 10 },
      plannedVisitsMonth: 4,
      completedVisitsMonth: 4,
      daysSinceLastVisit: 2,
      overdueActionsCount: 2,
      criticalOverdueCount: 0,
      coordinates: { x: 34, y: 28, zone: 'Centro-Oeste SP' },
    },
    {
      id: 'CT-B',
      code: 'Contrato 002',
      name: 'Contrato B',
      unit: 'Portaria Principal · Loja 24',
      address: 'Rua Olimpíadas, 205 - Vila Olímpia, SP',
      division: 'MOKPAT',
      manager: 'Gestor A',
      consultant: 'Carlos Mendes',
      health: {
        overall: 'atencao',
        rh: 'em-dia',
        rt: 'atencao',
        ra: 'em-dia',
        rhSummary: 'Equipe completa · Turnover 10% (2 ÷ 20)',
        rtSummary: 'Câmera CFTV 03 fora do ar · Em manutenção técnica',
        raSummary: 'Documentação e faturamento atualizados',
        alertBanner: 'CÂMERA CFTV 03 FORA DO AR',
        alertActionHint: 'ABRA RT PARA VER A OCORRÊNCIA E AS FOTOS.',
      },
      gauges: { improvementPlan: 60, plannedVisits: 80, trainedTeam: 90 },
      teamMetrics: {
        replacementsMonth: 3,
        dismissalsMonth: 2,
        avgHeadcount: 20,
        turnoverPercent: 10,
        trainingsCompleted: 2,
        participationsRecorded: 18,
      },
      fv: { planned: 100, used: 85, balance: 15 },
      plannedVisitsMonth: 5,
      completedVisitsMonth: 4,
      daysSinceLastVisit: 1,
      overdueActionsCount: 1,
      criticalOverdueCount: 0,
      coordinates: { x: 56, y: 24, zone: 'Zona Sul SP' },
    },
    {
      id: 'CT-C',
      code: 'Contrato 003',
      name: 'Contrato C',
      unit: 'Centro Logístico Anhanguera',
      address: 'Rod. Anhanguera, Km 26 - Perus, SP',
      division: 'MOKIMP',
      manager: 'Gestor B',
      consultant: 'Fernanda Costa',
      health: {
        overall: 'critico',
        rh: 'atencao',
        rt: 'critico',
        ra: 'em-dia',
        rhSummary: '1 posto aguardando reposição urgente',
        rtSummary: 'Falha no leitor do acesso principal + barreira perimetral',
        raSummary: 'Pagamentos e administração em dia',
        alertBanner: 'AÇÃO URGENTE: LEITOR DE ACESSO PRINCIPAL INOPERANTE',
        alertActionHint: 'EQUIPE TÉCNICA ACIONADA COM PRIORIDADE MÁXIMA.',
      },
      gauges: { improvementPlan: 45, plannedVisits: 70, trainedTeam: 82 },
      teamMetrics: {
        replacementsMonth: 4,
        dismissalsMonth: 3,
        avgHeadcount: 20,
        turnoverPercent: 15,
        trainingsCompleted: 2,
        participationsRecorded: 16,
      },
      fv: { planned: 160, used: 152, balance: 8 },
      plannedVisitsMonth: 4,
      completedVisitsMonth: 3,
      daysSinceLastVisit: 9,
      overdueActionsCount: 2,
      criticalOverdueCount: 2,
      coordinates: { x: 74, y: 31, zone: 'Zona Norte / Logística' },
    },
    // Demais contratos para compor os 20 contratos da carteira (14 em dia, 4 em atenção, 2 críticos)
    ...Array.from({ length: 17 }, (_, idx) => {
      const n = idx + 4;
      const divisionsList: DivisionCode[] = [
        'MOKPAT',
        'MOKVIP',
        'MOKLOG',
        'MOKTEC',
        'MOKRES',
        'MOKIMP',
        'P950',
        'Treinamento',
      ];
      const managersList: ('Gestor A' | 'Gestor B' | 'Gestor C' | 'Gestor D')[] = [
        'Gestor A',
        'Gestor B',
        'Gestor C',
        'Gestor D',
      ];
      // Total wanted across all 20: 14 em-dia, 4 atencao, 2 critico
      // Already have: 1 em-dia (CT-A), 1 atencao (CT-B), 1 critico (CT-C)
      // So among remaining 17: 13 em-dia, 3 atencao (n=4,5,6), 1 critico (n=7)
      const status: 'em-dia' | 'atencao' | 'critico' =
        n <= 6 ? 'atencao' : n === 7 ? 'critico' : 'em-dia';
      const visited = n <= 16; // 16 de 20 contratos visitados!
      return {
        id: `CT-${n.toString().padStart(2, '0')}`,
        code: `Contrato ${n.toString().padStart(3, '0')}`,
        name: `Contrato ${String.fromCharCode(64 + n)}`,
        unit: `Unidade Operacional ${n.toString().padStart(2, '0')}`,
        address: `Unidade ${n} - Grande São Paulo`,
        division: divisionsList[idx % divisionsList.length],
        manager: managersList[idx % managersList.length],
        consultant: idx % 2 === 0 ? 'Carlos Mendes' : 'Fernanda Costa',
        health: {
          overall: status,
          rh: status === 'critico' ? ('atencao' as const) : ('em-dia' as const),
          rt: status,
          ra: 'em-dia' as const,
          rhSummary: 'Efetivo regular no período',
          rtSummary:
            status === 'em-dia'
              ? 'Equipamentos operando normalmente'
              : 'Manutenção preventiva/corretiva em acompanhamento',
          raSummary: 'Administração regular',
        },
        gauges: {
          improvementPlan: status === 'em-dia' ? 90 : 65,
          plannedVisits: visited ? 85 : 50,
          trainedTeam: 90,
        },
        teamMetrics: {
          replacementsMonth: status === 'em-dia' ? 1 : 2,
          dismissalsMonth: 1,
          avgHeadcount: 15,
          turnoverPercent: 6.7,
          trainingsCompleted: 1,
          participationsRecorded: 14,
        },
        fv: { planned: 80, used: 72, balance: 8 },
        plannedVisitsMonth: 2,
        completedVisitsMonth: visited ? 2 : 0,
        daysSinceLastVisit: visited ? (idx % 6) + 1 : 14 + (idx % 5),
        overdueActionsCount: n === 7 ? 1 : n === 4 ? 1 : 0,
        criticalOverdueCount: n === 7 ? 1 : 0,
        coordinates: {
          x: 22 + ((idx * 17) % 62),
          y: 25 + ((idx * 23) % 55),
          zone: `Setor ${(idx % 4) + 1}`,
        },
      };
    }),
  ]);

  // Linha do tempo fiel às páginas 12, 13 e 72
  readonly timelineEvents = signal<TimelineEvent[]>([
    {
      id: 'TL-01',
      contractId: 'CT-B',
      date: '05/11',
      time: '16h30',
      title: 'Substituição concluída. Reparo validado.',
      description:
        'Reparo CFTV 03 validado pelo consultor após substituição de conector e testes de imagem.',
      category: 'ocorrencia',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
      validatedBy: 'Carlos Mendes',
      validatedAt: '05/11 · 16h30',
      photoUrl: '/assets/p13_img_9.png',
      photoCaption: 'CFTV 03 · Evidência da substituição',
    },
    {
      id: 'TL-02',
      contractId: 'CT-B',
      date: '05/11',
      time: '11h10',
      title: 'Substituição pendente',
      description:
        'Identificada necessidade de troca do conector blindado da Câmera CFTV 03 na portaria principal.',
      category: 'ocorrencia',
      author: 'Equipe Técnica',
      authorRole: 'terceirizados',
      publishedToClient: true,
    },
    {
      id: 'TL-03',
      contractId: 'CT-B',
      date: '05/11',
      time: '09h20',
      title: 'Visita técnica registrada',
      description:
        'Técnico terceirizado iniciou atendimento na portaria principal para inspeção do CFTV 03.',
      category: 'visita-tecnica',
      author: 'Roberto Alves (Técnico)',
      authorRole: 'terceirizados',
      publishedToClient: true,
      photoUrl: '/assets/p13_img_7.png',
      photoCaption: 'Visita técnica à portaria',
    },
    {
      id: 'TL-04',
      contractId: 'CT-B',
      date: '05/11',
      time: '08h42',
      title: 'Câmera CFTV 03 fora do ar',
      description:
        'Central de Monitoramento identificou perda de sinal na Câmera CFTV 03 (Portaria Principal) e acionou o consultor.',
      category: 'ocorrencia',
      author: 'Central de Monitoramento',
      authorRole: 'monitoramento',
      publishedToClient: true,
      photoUrl: '/assets/p13_img_8.png',
      photoCaption: 'Captura anexada pela Central antes da perda de sinal',
    },
    {
      id: 'TL-05',
      contractId: 'CT-B',
      date: '04/11',
      time: '15h00',
      title: 'Treinamento de controle de acesso',
      description:
        'Treinamento presencial realizado com 9 participantes no posto. Instrutor: Rafael.',
      category: 'treinamento',
      author: 'Rafael (Treinamento)',
      authorRole: 'treinamento',
      publishedToClient: true,
      photoUrl: '/assets/p13_img_6.png',
      photoCaption: 'Treinamento de controle de acesso',
    },
    {
      id: 'TL-06',
      contractId: 'CT-B',
      date: '03/11',
      time: '10h00',
      title: 'Reunião de alinhamento operacional',
      description:
        'Análise do fluxo de horário de pico (17h–20h) e elaboração da proposta de reforço.',
      category: 'reuniao',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
    },
    {
      id: 'TL-07',
      contractId: 'CT-B',
      date: '03/11',
      time: '09h00',
      title: 'Visita de consultoria',
      description: 'Revisão do acesso principal, conferência do livro de posto e orientação da equipe.',
      category: 'visita-consultoria',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
    },
    {
      id: 'TL-08',
      contractId: 'CT-B',
      date: '02/11',
      time: '14h00',
      title: 'Visita de consultoria',
      description: 'Inspeção de rotina MOKPAT e verificação de rondas perimetrais.',
      category: 'visita-consultoria',
      author: 'Carlos Mendes (Consultor)',
      authorRole: 'consultor',
      publishedToClient: true,
    },
  ]);

  // Ocorrências e Chamados (páginas 4, 5, 27, 37, 52, 70 e 76)
  readonly occurrences = signal<Occurrence[]>([
    {
      id: 'OC-01',
      code: 'CFTV-03',
      contractId: 'CT-B',
      division: 'MOKTEC',
      title: 'Câmera fora do ar (CFTV 03)',
      equipment: 'CFTV 03 · Portaria principal',
      location: 'Portaria principal · Unidade Loja 24',
      priority: 'alta',
      origin: 'Central de Monitoramento',
      description: 'Câmera CFTV 03 fora de operação. Perda de sinal detectada às 08h42.',
      immediateAction: 'Suporte técnico acionado e ronda presencial reforçada na portaria.',
      responsible: 'Equipe técnica',
      deadline: 'Hoje, 17h',
      status: 'manutencao',
      isOverdue: false,
      isCritical: false,
      publishedToClient: true,
      clientStatusText:
        'Câmera fora do ar. A equipe técnica está trabalhando no reparo. Próxima atualização: Hoje, 17h.',
      leaderStatusText: 'AGUARDANDO REPARO · Acompanha a ocorrência do posto (Contrato B).',
      consultantNotes:
        'Relatos da Central (08h42) e do Líder de Posto unificados. Conector substituído em validação.',
      evidencePhoto: '/assets/p13_img_9.png',
      downtime: '2h 15min',
      firstResponseTime: '14 min',
      createdAt: '05/11 · 08h42',
    },
    {
      id: 'OC-02',
      code: 'CH-1247',
      contractId: 'CT-A',
      division: 'MOKPAT',
      title: 'Correção de relatório operacional',
      equipment: 'Painel de Controle',
      location: 'Recepção Central',
      priority: 'rotina',
      origin: 'Visita de campo',
      description: 'Ajuste de consolidação mensal no relatório de controle de acesso.',
      immediateAction: 'Revisão solicitada ao analista responsável.',
      responsible: 'Responsável B',
      deadline: '08/05',
      status: 'vencida',
      isOverdue: true,
      isCritical: false,
      publishedToClient: false,
      clientStatusText: 'Em atualização administrativa interna.',
      leaderStatusText: 'Sem impacto na rotina do turno.',
      consultantNotes: 'Atenção necessária — prazo vencido.',
      downtime: '—',
      firstResponseTime: '35 min',
      createdAt: '01/11 · 10h00',
    },
    {
      id: 'OC-03',
      code: 'CH-1248',
      contractId: 'CT-B',
      division: 'MOKPAT',
      title: 'Falha no leitor do acesso principal',
      equipment: 'Leitor Biométrico 01',
      location: 'Acesso Principal',
      priority: 'alta',
      origin: 'Visita de campo',
      description: 'Leitor apresentando intermitência na leitura facial nos horários de pico.',
      immediateAction: 'Acionada equipe técnica para calibração e limpeza óptica.',
      responsible: 'Responsável A (Equipe técnica)',
      deadline: '03/11/2026',
      status: 'vencida',
      isOverdue: true,
      isCritical: true,
      publishedToClient: true,
      clientStatusText: 'Manutenção do leitor do acesso principal em tratamento prioritário.',
      leaderStatusText: 'Contingência ativa na portaria principal.',
      consultantNotes: 'Origem: Visita de campo. Prazo vencido — escalado para acompanhamento.',
      evidencePhoto: '/assets/p13_img_7.png',
      downtime: '4h 10min',
      firstResponseTime: '18 min',
      createdAt: '01/11 · 11h30',
    },
    {
      id: 'OC-04',
      code: 'CH-1249',
      contractId: 'CT-C',
      division: 'MOKIMP',
      title: 'Ajuste de integração e barreira perimetral',
      equipment: 'Central de Alarme / IVA 04',
      location: 'Docas Norte',
      priority: 'grave',
      origin: 'Central de Monitoramento',
      description: 'Falha de comunicação na barreira perimetral das docas.',
      immediateAction: 'Alerta imediato enviado à Alta Gestão e vigilância presencial dedicada.',
      responsible: 'Responsável C',
      deadline: '07/05',
      status: 'vencida',
      isOverdue: true,
      isCritical: true,
      publishedToClient: true,
      clientStatusText: 'Equipe de engenharia atuando no restabelecimento do sensor perimetral.',
      leaderStatusText: 'Ronda dedicada a cada 15 min nas Docas Norte.',
      consultantNotes: 'Ocorrência crítica vencida — acompanhada pela Diretoria.',
      downtime: '6h 40min',
      firstResponseTime: '8 min',
      createdAt: '02/11 · 07h15',
    },
    {
      id: 'OC-05',
      code: 'CH-1250',
      contractId: 'CT-B',
      division: 'MOKPAT',
      title: 'Tentativa de entrada sem autorização',
      equipment: 'Catraca Portaria Principal',
      location: 'Posto Exemplo · Portaria Principal',
      priority: 'alta',
      origin: 'Líder de Posto',
      description: 'Tentativa de entrada sem autorização prévia registrada às 14h20.',
      immediateAction: 'Acesso bloqueado imediatamente na portaria e consultor avisado.',
      responsible: 'Carlos Mendes (Consultor)',
      deadline: 'Hoje, 18h',
      status: 'aguardando-validacao',
      isOverdue: false,
      isCritical: false,
      publishedToClient: false,
      clientStatusText: 'Registro de bloqueio preventivo na portaria.',
      leaderStatusText: 'Acesso bloqueado e enviado ao consultor.',
      consultantNotes: 'Aguardando validação final do consultor para publicação no histórico.',
      evidencePhoto: '/assets/p13_img_8.png',
      downtime: '0 min',
      firstResponseTime: '2 min',
      createdAt: '01/11 · 14h20',
    },
  ]);

  // Visitas de campo (Consultor, Técnico e Supervisor — páginas 26, 29, 32, 45, 46)
  readonly visits = signal<VisitRecord[]>([
    {
      id: 'VIS-01',
      contractId: 'CT-B',
      division: 'MOKPAT',
      visitorName: 'Carlos Mendes',
      visitorRole: 'consultor',
      date: '03/11/2026',
      entryTime: '09:00',
      exitTime: '09:42',
      durationMinutes: 42,
      status: 'concluida',
      summary: 'Revisão do acesso principal e orientação da equipe de portaria.',
      improvementRegistered: 'Reposicionamento do cone de triagem de veículos no horário de pico.',
      checklist: [
        { label: 'Efetivo completo e uniformizado no posto', checked: true },
        { label: 'Livro de ocorrência e passagem de turno conferidos', checked: true },
        { label: 'Equipamentos de comunicação (HT) testados', checked: true },
        { label: 'Procedimento de controle de acesso auditado', checked: true },
      ],
      divisionFields: {
        revisaoAcesso: 'Revisão do acesso e orientação da equipe concluídas',
        efetivoPosto: 'Efetivo completo (4/4)',
      },
      photoUrl: '/assets/p13_img_7.png',
      validatedByConsultant: true,
      publishedToClient: true,
    },
    {
      id: 'VIS-02',
      contractId: 'CT-B',
      division: 'MOKTEC',
      visitorName: 'Roberto Alves (Técnico Autorizado)',
      visitorRole: 'tecnico',
      date: '05/11/2026',
      entryTime: '09:12',
      exitTime: '10:25',
      durationMinutes: 73,
      status: 'concluida',
      summary: 'Manutenção de CFTV na Portaria Principal — Conector substituído.',
      improvementRegistered: 'Isolamento térmico reforçado na caixa de passagem da câmera CFTV 03.',
      checklist: [
        { label: 'Equipamento e falha identificados (CFTV 03)', checked: true },
        { label: 'Substituição de conector realizada', checked: true },
        { label: 'Teste de imagem e gravação na Central OK', checked: true },
        { label: 'Foto da evidência anexada', checked: true },
      ],
      divisionFields: {
        equipamentoAvaliado: 'Câmera CFTV 03 - Portaria Principal',
        statusRestabelecimento: 'Conector substituído · Sinal restabelecido',
      },
      photoUrl: '/assets/p13_img_9.png',
      linkedOccurrenceId: 'OC-01',
      validatedByConsultant: true,
      publishedToClient: true,
    },
    {
      id: 'VIS-03',
      contractId: 'CT-B',
      division: 'MOKPAT',
      visitorName: 'Marcos Rocha (Supervisor Segurança)',
      visitorRole: 'supervisor',
      date: '04/11/2026',
      entryTime: '21:10',
      exitTime: '21:50',
      durationMinutes: 40,
      status: 'concluida',
      summary: 'Conferência noturna de equipe, rondas eletrônicas e livro de posto.',
      improvementRegistered: 'Ajuste no intervalo da ronda perimetral noturna.',
      checklist: [
        { label: 'Equipe noturna completa no posto', checked: true },
        { label: 'Rondas eletrônicas conferidas', checked: true },
        { label: 'Livro de posto assinado e sem pendências críticas', checked: true },
      ],
      divisionFields: {
        revisaoAcesso: 'Portaria noturna em conformidade',
      },
      photoUrl: '/assets/p13_img_7.png',
      validatedByConsultant: true,
      publishedToClient: false,
    },
  ]);

  // Orçamentos pendentes por contrato (Clientes A, B e C — páginas 10, 14, 17, 78)
  readonly budgets = signal<BudgetProposal[]>([
    {
      id: 'ORC-01',
      contractId: 'CT-B',
      title: 'Reforço de equipe',
      monthlyValue: 2000,
      justification:
        'Cobrir o acesso principal entre 17h e 20h. A operação atual mantém a lacuna registrada no fluxo de saída.',
      impact: 'Redução de 75% no tempo de fila da portaria principal e eliminação de vulnerabilidade no pico.',
      status: 'em-aprovacao-cliente',
      comments: [
        {
          author: 'Carlos Mendes',
          role: 'Consultor Moked',
          text: 'Proposta liberada após análise do fluxo entre 17h e 20h na portaria principal.',
          date: '03/11 · 11h20',
        },
      ],
      history: [
        { step: 'Identificação da lacuna em visita técnica', date: '02/11 · 14h30', actor: 'Carlos Mendes' },
        { step: 'Envio da proposta à Gestão Moked', date: '03/11 · 09h40', actor: 'Carlos Mendes' },
        { step: 'Liberação da proposta para decisão do Cliente', date: '03/11 · 11h15', actor: 'Diretoria / Consultor' },
      ],
    },
    {
      id: 'ORC-A',
      contractId: 'CT-A',
      title: 'Totem de Reconhecimento Facial VIP',
      monthlyValue: 1450,
      justification:
        'Agilizar o credenciamento de visitantes executivos na recepção da Sede Paulista no horário comercial.',
      impact: 'Liberação de acesso em menos de 3 segundos e registro fotográfico automático na Linha do Tempo.',
      status: 'em-aprovacao-cliente',
      comments: [
        {
          author: 'Carlos Mendes',
          role: 'Consultor Moked',
          text: 'Proposta de modernização tecnológica para o hall principal.',
          date: '04/11 · 15h00',
        },
      ],
      history: [
        { step: 'Levantamento técnico na recepção', date: '03/11 · 10h00', actor: 'Carlos Mendes' },
        { step: 'Proposta liberada para aprovação do Cliente A', date: '04/11 · 15h00', actor: 'Consultor Moked' },
      ],
    },
    {
      id: 'ORC-C',
      contractId: 'CT-C',
      title: 'Reforço de Ronda Perimetral Noturna',
      monthlyValue: 3500,
      justification:
        'Ampliação da cobertura motorizada no perímetro norte e docas externas entre 22h e 05h.',
      impact: 'Cobertura integral do perímetro logístico e resposta imediata a alertas de barreira.',
      status: 'em-aprovacao-cliente',
      comments: [
        {
          author: 'Fernanda Costa',
          role: 'Consultora Moked',
          text: 'Recomendação prioritária após auditoria noturna no Centro Logístico.',
          date: '04/11 · 19h10',
        },
      ],
      history: [
        { step: 'Inspeção perimetral noturna MOKIMP', date: '03/11 · 22h30', actor: 'Fernanda Costa' },
        { step: 'Proposta enviada para aprovação urgente do Cliente C', date: '04/11 · 19h10', actor: 'Diretoria / Consultor' },
      ],
    },
  ]);

  // Turmas de Treinamento (páginas 10, 15, 19, 54–56, 66, 69)
  readonly trainings = signal<TrainingSession[]>([
    {
      id: 'TRN-01',
      contractId: 'CT-B',
      title: 'Controle de acesso',
      date: '28/10/2026',
      instructor: 'Rafael (Equipe de Treinamento)',
      content: 'Identificação de visitantes, triagem de prestadores, uso do Olam e resposta a acesso indevido.',
      photoUrl: '/assets/treinamento-controle-acesso.png',
      publishedToClient: true,
      participants: [
        { name: 'Ana Ribeiro', role: 'Portaria Diurna', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Bruno Lima', role: 'Portaria Noturna', present: false, pointsEarned: 0, makeupStatus: 'pendente' },
        { name: 'Carla Santos', role: 'Controle de Acesso', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Diego Martins', role: 'Portaria Diurna', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Eduarda Alves', role: 'Recepção Técnica', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Fábio Nogueira', role: 'Ronda Patrimonial', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Gustavo Rocha', role: 'Portaria Noturna', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Helena Castro', role: 'Controle de Acesso', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
        { name: 'Igor Santana', role: 'Reserva Técnica', present: true, pointsEarned: 10, makeupStatus: 'em-dia' },
      ],
    },
    {
      id: 'TRN-A',
      contractId: 'CT-A',
      title: 'Protocolo Executivo e Atendimento Corporativo VIP',
      date: '02/11/2026',
      instructor: 'Rafael (Equipe de Treinamento)',
      content: 'Recepção bilíngue, credenciamento rápido, escolta interna e controle de acesso executivo.',
      photoUrl: '/assets/treinamento-controle-acesso.png',
      publishedToClient: true,
      participants: Array.from({ length: 12 }, (_, i) => ({
        name: `Colaborador Sede ${i + 1}`,
        role: 'Segurança Corporativa',
        present: true,
        pointsEarned: 10,
        makeupStatus: 'em-dia' as const,
      })),
    },
    {
      id: 'TRN-C',
      contractId: 'CT-C',
      title: 'Inspeção de Docas, Lacres e Pátio Logístico',
      date: '30/10/2026',
      instructor: 'Rafael (Equipe de Treinamento)',
      content: 'Conferência de nota fiscal, auditoria de lacres, controle de motoristas e bloqueio perimetral.',
      photoUrl: '/assets/treinamento-controle-acesso.png',
      publishedToClient: true,
      participants: Array.from({ length: 16 }, (_, i) => ({
        name: `Vigilante Logístico ${i + 1}`,
        role: 'Operação de Docas',
        present: i !== 3,
        pointsEarned: i !== 3 ? 10 : 0,
        makeupStatus: i !== 3 ? ('em-dia' as const) : ('pendente' as const),
      })),
    },
  ]);

  // Registros de Turno do Líder de Posto (páginas 34–43)
  readonly shiftRecords = signal<ShiftRecord[]>([
    {
      id: 'SHF-01',
      contractId: 'CT-B',
      postName: 'Posto Exemplo · Portaria Principal',
      leaderName: 'Sérgio Oliveira (Líder de Posto)',
      date: '01/11/2026',
      time: '14:20',
      shift: 'Diurno (06h às 18h)',
      type: 'ocorrencia',
      description: 'Tentativa de entrada sem autorização na portaria principal.',
      immediateAction: 'Acesso bloqueado e consultor avisado imediatamente.',
      photoUrl: '/assets/p13_img_8.png',
      status: 'registrado',
    },
    {
      id: 'SHF-02',
      contractId: 'CT-B',
      postName: 'Posto Exemplo · Portaria Principal',
      leaderName: 'Sérgio Oliveira (Líder de Posto)',
      date: '04/11/2026',
      time: '18:00',
      shift: 'Diurno (06h às 18h)',
      type: 'sem-alteracao',
      description: 'Turno encerrado sem alterações. Posto, efetivo e equipamentos conferidos.',
      status: 'validado',
    },
  ]);

  // SLA dos Terceirizados e Multas (páginas 48–50)
  readonly thirdPartySLAs = signal<ThirdPartySLA[]>([
    {
      id: 'SLA-01',
      companyName: 'TechSec Sistemas CFTV Ltda.',
      roleType: '04A Técnico Terceirizado',
      serviceType: 'Manutenção de CFTV (CFTV 03)',
      contractId: 'CT-B',
      monthlyScorePercent: 89,
      callOpenedAt: '09h00',
      scheduledDeadline: '10h00',
      actualEndTime: '10h25',
      delayMinutes: 25,
      checklistCompleted: true,
      photoAttached: true,
      fineAmount: 150,
      fineStatus: 'publicada-cliente',
      reason: 'Atraso de 25 min na conclusão do chamado técnico (prazo 10h00 · fim 10h25).',
    },
    {
      id: 'SLA-02',
      companyName: 'Vanguarda Vigilância Patrimonial',
      roleType: '04B Supervisor Segurança',
      serviceType: 'Cobertura de Postos e Rondas',
      contractId: 'CT-A',
      monthlyScorePercent: 97,
      callOpenedAt: '06h00',
      scheduledDeadline: '06h00',
      actualEndTime: '05h55',
      delayMinutes: 0,
      checklistCompleted: true,
      photoAttached: true,
      fineAmount: 0,
      fineStatus: 'nenhuma',
      reason: '100% das entregas previstas concluídas no prazo com checklist e foto.',
    },
    {
      id: 'SLA-03',
      companyName: 'Alpha Monitoramento & Acesso',
      roleType: '04A Técnico Terceirizado',
      serviceType: 'Manutenção de Catracas e Leitores',
      contractId: 'CT-C',
      monthlyScorePercent: 81,
      callOpenedAt: '08h00',
      scheduledDeadline: '12h00',
      actualEndTime: '13h40',
      delayMinutes: 100,
      checklistCompleted: true,
      photoAttached: false,
      fineAmount: 350,
      fineStatus: 'em-analise',
      reason: 'Desempenho abaixo de 85% — plano de correção solicitado e multa em análise pela Gestão.',
    },
  ]);

  // Trilha de Auditoria (páginas 82–84)
  readonly auditLogs = signal<AuditLogEntry[]>([
    {
      id: 'AUD-01',
      timestamp: '05/11/2026 16:30:12',
      contractId: 'CT-B',
      actor: 'Carlos Mendes',
      actorRole: '02 | Consultor',
      action: 'PUBLICOU_CLIENTE',
      entityType: 'Ocorrência / Reparo',
      entityId: 'OC-01 (CFTV 03)',
      details: 'Validou reparo da Câmera CFTV 03 e publicou status e evidência fotográfica para o Cliente.',
    },
    {
      id: 'AUD-02',
      timestamp: '05/11/2026 11:15:00',
      contractId: 'CT-B',
      actor: 'Eric (Alta Gestão)',
      actorRole: '07 | Alta Gestão',
      action: 'APROVOU',
      entityType: 'SLA / Multa Contratual',
      entityId: 'SLA-01',
      details: 'Aprovou multa contratual de R$ 150,00 por atraso de 25 min na manutenção de CFTV.',
    },
    {
      id: 'AUD-03',
      timestamp: '05/11/2026 10:25:04',
      contractId: 'CT-B',
      actor: 'Roberto Alves',
      actorRole: '04A | Técnico Terceirizado',
      action: 'ALTEROU',
      entityType: 'Visita Técnica',
      entityId: 'VIS-02',
      details: 'Registrou saída às 10h25 com checklist completo e foto do conector substituído.',
    },
    {
      id: 'AUD-04',
      timestamp: '05/11/2026 08:42:19',
      contractId: 'CT-B',
      actor: 'Operador Central 04',
      actorRole: '05 | Central de Monitoramento',
      action: 'CRIOU',
      entityType: 'Ocorrência Técnica',
      entityId: 'OC-01 (CFTV 03)',
      details: 'Detectou câmera fora do ar na Portaria Principal, anexou captura e acionou o consultor.',
    },
  ]);

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
