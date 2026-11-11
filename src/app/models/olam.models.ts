export type UserRole =
  | 'cliente'
  | 'consultor'
  | 'lider'
  | 'terceirizados'
  | 'monitoramento'
  | 'treinamento'
  | 'alta-gestao';

export type DivisionCode =
  | 'MOKIMP'
  | 'MOKPAT'
  | 'MOKVIP'
  | 'MOKTEC'
  | 'MOKLOG'
  | 'MOKRES'
  | 'P950'
  | 'Treinamento';

export type HealthStatus = 'em-dia' | 'atencao' | 'critico';

export interface RoleMeta {
  id: UserRole;
  code: string;
  label: string;
  shortLabel: string;
  subtitle: string;
  defaultEmail: string;
  scopeDescription: string;
}

export interface DivisionMeta {
  code: DivisionCode;
  name: string;
  description: string;
  specificFields: { key: string; label: string; placeholder: string }[];
}

export interface Contract {
  id: string;
  code: string;
  name: string;
  unit: string;
  address: string;
  division: DivisionCode;
  manager: 'Gestor A' | 'Gestor B' | 'Gestor C' | 'Gestor D';
  consultant: string;
  health: {
    overall: HealthStatus;
    rh: HealthStatus;
    rt: HealthStatus;
    ra: HealthStatus;
    rhSummary: string;
    rtSummary: string;
    raSummary: string;
    alertBanner?: string;
    alertActionHint?: string;
  };
  gauges: {
    improvementPlan: number;
    plannedVisits: number;
    trainedTeam: number;
  };
  teamMetrics: {
    replacementsMonth: number;
    dismissalsMonth: number;
    avgHeadcount: number;
    turnoverPercent: number;
    trainingsCompleted: number;
    participationsRecorded: number;
  };
  fv: {
    planned: number;
    used: number;
    balance: number;
  };
  plannedVisitsMonth: number;
  completedVisitsMonth: number;
  daysSinceLastVisit: number;
  overdueActionsCount: number;
  criticalOverdueCount: number;
  coordinates: { x: number; y: number; zone: string };
}

export interface TimelineEvent {
  id: string;
  contractId: string;
  date: string;
  time: string;
  title: string;
  description: string;
  category:
    | 'ocorrencia'
    | 'visita-tecnica'
    | 'visita-consultoria'
    | 'treinamento'
    | 'reuniao'
    | 'orcamento'
    | 'sla';
  author: string;
  authorRole: UserRole;
  publishedToClient: boolean;
  validatedBy?: string;
  validatedAt?: string;
  photoUrl?: string;
  photoCaption?: string;
}

export interface Occurrence {
  id: string;
  code: string;
  contractId: string;
  division: DivisionCode;
  title: string;
  equipment: string;
  location: string;
  priority: 'rotina' | 'alta' | 'grave';
  origin:
    | 'Central de Monitoramento'
    | 'Líder de Posto'
    | 'Visita de campo'
    | 'Supervisor Segurança';
  description: string;
  immediateAction: string;
  responsible: string;
  deadline: string;
  status:
    | 'aberta'
    | 'manutencao'
    | 'aguardando-reparo'
    | 'aguardando-validacao'
    | 'validada'
    | 'vencida';
  isOverdue: boolean;
  isCritical: boolean;
  publishedToClient: boolean;
  clientStatusText: string;
  leaderStatusText: string;
  consultantNotes: string;
  evidencePhoto?: string;
  impediment?: string;
  downtime?: string;
  firstResponseTime?: string;
  validatedAt?: string;
  createdAt: string;
}

export interface VisitRecord {
  id: string;
  contractId: string;
  division: DivisionCode;
  activityType?: 'visita' | 'treinamento' | 'problema';
  visitorName: string;
  visitorRole: 'consultor' | 'tecnico' | 'supervisor';
  date: string;
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
  status: 'agendada' | 'em-andamento' | 'concluida';
  summary: string;
  improvementRegistered: string;
  checklist: { label: string; checked: boolean }[];
  divisionFields: Record<string, string>;
  photoUrl?: string;
  photos?: string[];
  linkedOccurrenceId?: string;
  validatedByConsultant: boolean;
  publishedToClient: boolean;
}

export interface BudgetProposal {
  id: string;
  contractId: string;
  title: string;
  monthlyValue: number;
  justification: string;
  impact: string;
  status:
    | 'em-analise-gestao'
    | 'em-aprovacao-cliente'
    | 'aprovado'
    | 'recusado';
  comments: { author: string; role: string; text: string; date: string }[];
  history: { step: string; date: string; actor: string }[];
}

export interface TrainingParticipant {
  name: string;
  role: string;
  present: boolean;
  pointsEarned: number;
  makeupStatus: 'em-dia' | 'pendente' | 'concluida';
}

export interface TrainingSession {
  id: string;
  contractId: string;
  title: string;
  date: string;
  instructor: string;
  content: string;
  participants: TrainingParticipant[];
  photoUrl?: string;
  publishedToClient: boolean;
}

export interface ShiftRecord {
  id: string;
  contractId: string;
  postName: string;
  leaderName: string;
  date: string;
  time: string;
  shift: string;
  type: 'falta' | 'atraso' | 'treinamento' | 'ocorrencia' | 'sem-alteracao';
  incidentCategory?: string;
  employeeName?: string;
  isCritical?: boolean;
  description: string;
  immediateAction?: string;
  photoUrl?: string;
  photos?: string[];
  status: 'registrado' | 'validado';
}

export interface ThirdPartySLA {
  id: string;
  companyName: string;
  roleType: '04A Técnico Terceirizado' | '04B Supervisor Segurança';
  serviceType: string;
  contractId: string;
  monthlyScorePercent: number;
  callOpenedAt: string;
  scheduledDeadline: string;
  actualEndTime: string;
  delayMinutes: number;
  checklistCompleted: boolean;
  photoAttached: boolean;
  fineAmount: number;
  fineStatus: 'nenhuma' | 'em-analise' | 'aprovada' | 'publicada-cliente';
  reason: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  contractId: string;
  actor: string;
  actorRole: string;
  action:
    | 'CRIOU'
    | 'ALTEROU'
    | 'VALIDOU'
    | 'PUBLICOU_CLIENTE'
    | 'APROVOU'
    | 'ESCALOU';
  entityType: string;
  entityId: string;
  details: string;
}

export interface UseCaseScenario {
  id: string;
  code: string;
  title: string;
  slidePage: number;
  profilesInvolved: string[];
  steps: {
    stepNumber: number;
    actor: string;
    role: UserRole;
    title: string;
    description: string;
  }[];
}

