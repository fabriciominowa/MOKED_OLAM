import {
  AuditLogEntry,
  BudgetProposal,
  Contract,
  DivisionCode,
  Occurrence,
  ShiftRecord,
  ThirdPartySLA,
  TimelineEvent,
  TrainingSession,
  UserRole,
  VisitRecord,
} from '../../models/olam.models';
import {
  MOKED_SEED_SNAPSHOT,
  MuralPraiseRecord,
  RankingMemberRecord,
  TicketChatMessage,
} from './moked.seed';

export const MOKED_DB_STORAGE_KEY = 'moked_resolve_tsdb_v4';
export const MOKED_DB_SCHEMA_VERSION = 4;

export interface MokedSessionRecord {
  isLoggedIn: boolean;
  activeRole: UserRole;
  currentUserEmail: string;
  selectedContractId: string;
  activeClientAccount: 'CLI-A' | 'CLI-B' | 'CLI-C';
  selectedDivision: DivisionCode;
  leaderSelectedPost: string;
}

export interface MokedDatabaseTables {
  contracts: Contract[];
  timelineEvents: TimelineEvent[];
  occurrences: Occurrence[];
  visits: VisitRecord[];
  budgets: BudgetProposal[];
  trainings: TrainingSession[];
  shiftRecords: ShiftRecord[];
  thirdPartySLAs: ThirdPartySLA[];
  auditLogs: AuditLogEntry[];
  muralPraises: MuralPraiseRecord[];
  rankingMembers: RankingMemberRecord[];
  ticketMessages: TicketChatMessage[];
}

export interface MokedDatabaseSchema {
  schemaVersion: number;
  updatedAt: string;
  session: MokedSessionRecord;
  tables: MokedDatabaseTables;
}

const DEFAULT_SESSION: MokedSessionRecord = {
  isLoggedIn: false,
  activeRole: 'cliente',
  currentUserEmail: 'cliente.b@contratob.com.br',
  selectedContractId: 'CT-B',
  activeClientAccount: 'CLI-B',
  selectedDivision: 'MOKPAT',
  leaderSelectedPost: 'Posto Exemplo',
};

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createInitialSchema(): MokedDatabaseSchema {
  return {
    schemaVersion: MOKED_DB_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    session: cloneValue(DEFAULT_SESSION),
    tables: cloneValue(MOKED_SEED_SNAPSHOT),
  };
}

export const MokedDatabase = {
  load(): MokedDatabaseSchema {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createInitialSchema();
    }
    try {
      const raw = window.localStorage.getItem(MOKED_DB_STORAGE_KEY);
      if (!raw) {
        const fresh = createInitialSchema();
        this.save(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw) as Partial<MokedDatabaseSchema>;
      if (
        !parsed ||
        parsed.schemaVersion !== MOKED_DB_SCHEMA_VERSION ||
        !parsed.tables ||
        !Array.isArray(parsed.tables.contracts)
      ) {
        const fresh = createInitialSchema();
        this.save(fresh);
        return fresh;
      }

      const fallback = createInitialSchema();
      return {
        schemaVersion: MOKED_DB_SCHEMA_VERSION,
        updatedAt: parsed.updatedAt || fallback.updatedAt,
        session: {
          ...fallback.session,
          ...(parsed.session || {}),
        },
        tables: {
          contracts: parsed.tables.contracts ?? fallback.tables.contracts,
          timelineEvents: parsed.tables.timelineEvents ?? fallback.tables.timelineEvents,
          occurrences: parsed.tables.occurrences ?? fallback.tables.occurrences,
          visits: parsed.tables.visits ?? fallback.tables.visits,
          budgets: parsed.tables.budgets ?? fallback.tables.budgets,
          trainings: parsed.tables.trainings ?? fallback.tables.trainings,
          shiftRecords: parsed.tables.shiftRecords ?? fallback.tables.shiftRecords,
          thirdPartySLAs: parsed.tables.thirdPartySLAs ?? fallback.tables.thirdPartySLAs,
          auditLogs: parsed.tables.auditLogs ?? fallback.tables.auditLogs,
          muralPraises: parsed.tables.muralPraises ?? fallback.tables.muralPraises,
          rankingMembers: parsed.tables.rankingMembers ?? fallback.tables.rankingMembers,
          ticketMessages: parsed.tables.ticketMessages ?? fallback.tables.ticketMessages,
        },
      };
    } catch {
      return createInitialSchema();
    }
  },

  save(snapshot: MokedDatabaseSchema): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(MOKED_DB_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Silencioso em modo privado sem cota
    }
  },

  reset(): MokedDatabaseSchema {
    const fresh = createInitialSchema();
    this.save(fresh);
    return fresh;
  },

  countRecords(tables: MokedDatabaseTables): number {
    return (
      tables.contracts.length +
      tables.timelineEvents.length +
      tables.occurrences.length +
      tables.visits.length +
      tables.budgets.length +
      tables.trainings.length +
      tables.shiftRecords.length +
      tables.thirdPartySLAs.length +
      tables.auditLogs.length +
      tables.muralPraises.length +
      tables.rankingMembers.length +
      tables.ticketMessages.length
    );
  },
};

