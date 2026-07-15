import { getDb } from './db.js';

// ---- Types ----

export interface PersonaRow {
  id: string;
  label: string;
  parentId: string | null;
  description: string | null;
  marketContext: Record<string, unknown> | null;
  motivations: string[] | null;
  mentalModels: Record<string, unknown> | null;
  attributes: Record<string, unknown> | null;
  participantIds: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonaTreeNode extends PersonaRow {
  children: PersonaTreeNode[];
}

// ---- CRUD ----

export async function getPersona(id: string): Promise<PersonaRow | null> {
  const db = getDb();
  const rs = await db.execute({ sql: 'SELECT * FROM personas WHERE id = ?', args: [id] });
  return rs.rows.length > 0 ? rowToPersona(rs.rows[0]) : null;
}

export async function getAllPersonas(): Promise<PersonaRow[]> {
  const db = getDb();
  const rs = await db.execute('SELECT * FROM personas ORDER BY parent_id NULLS FIRST, label');
  return rs.rows.map(rowToPersona);
}

export async function listPersonaIds(): Promise<string[]> {
  const db = getDb();
  const rs = await db.execute('SELECT id FROM personas ORDER BY parent_id NULLS FIRST, label');
  return rs.rows.map(r => r.id as string);
}

export async function getPersonaChildren(parentId: string): Promise<PersonaRow[]> {
  const db = getDb();
  const rs = await db.execute({ sql: 'SELECT * FROM personas WHERE parent_id = ? ORDER BY label', args: [parentId] });
  return rs.rows.map(rowToPersona);
}

export async function getRootPersonas(): Promise<PersonaRow[]> {
  const db = getDb();
  const rs = await db.execute('SELECT * FROM personas WHERE parent_id IS NULL ORDER BY label');
  return rs.rows.map(rowToPersona);
}

export async function upsertPersona(persona: PersonaRow): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO personas (id, label, parent_id, description, market_context, motivations, mental_models, attributes, participant_ids, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            label = excluded.label,
            parent_id = excluded.parent_id,
            description = excluded.description,
            market_context = excluded.market_context,
            motivations = excluded.motivations,
            mental_models = excluded.mental_models,
            attributes = excluded.attributes,
            participant_ids = excluded.participant_ids,
            updated_at = datetime('now')`,
    args: [
      persona.id,
      persona.label,
      persona.parentId,
      persona.description,
      persona.marketContext ? JSON.stringify(persona.marketContext) : null,
      persona.motivations ? JSON.stringify(persona.motivations) : null,
      persona.mentalModels ? JSON.stringify(persona.mentalModels) : null,
      persona.attributes ? JSON.stringify(persona.attributes) : null,
      persona.participantIds ? JSON.stringify(persona.participantIds) : null,
    ],
  });
}

/** Get the full chain from root to this persona: [root, ..., parent, self] */
export async function getPersonaLineage(id: string): Promise<PersonaRow[]> {
  const chain: PersonaRow[] = [];
  let current = await getPersona(id);
  while (current) {
    chain.unshift(current);
    if (current.parentId) {
      current = await getPersona(current.parentId);
    } else {
      break;
    }
  }
  return chain;
}

/** Build the full persona tree (roots with nested children). */
export async function getPersonaTree(): Promise<PersonaTreeNode[]> {
  const all = await getAllPersonas();
  const nodeMap = new Map<string, PersonaTreeNode>();

  for (const p of all) {
    nodeMap.set(p.id, { ...p, children: [] });
  }

  const roots: PersonaTreeNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Add a participant ID to a persona's participant list. */
export async function addParticipantToPersona(personaId: string, participantId: string): Promise<void> {
  const persona = await getPersona(personaId);
  if (!persona) throw new Error(`Persona ${personaId} not found`);

  const ids = persona.participantIds || [];
  if (!ids.includes(participantId)) {
    ids.push(participantId);
    persona.participantIds = ids;
    await upsertPersona(persona);
  }
}

// ---- Seed ----

export async function seedPersonasIfEmpty(): Promise<void> {
  const db = getDb();
  const count = await db.execute('SELECT COUNT(*) as cnt FROM personas');
  if ((count.rows[0].cnt as number) > 0) return;

  const roots: PersonaRow[] = [
    {
      id: 'merchant',
      label: 'Merchant',
      parentId: null,
      description: 'Manages commodity positions, hedging strategies, and pricing decisions. Operates under margin pressure and market risk.',
      marketContext: null,
      motivations: ['manage position exposure', 'optimize hedge timing', 'maximize margins'],
      mentalModels: null,
      attributes: null,
      participantIds: null,
    },
    {
      id: 'grain_origination_merchant',
      label: 'Grain Origination Merchant',
      parentId: null,
      description: 'Secures grain supply from producers. Focuses on volume, relationships, and basis management at the local level.',
      marketContext: null,
      motivations: ['secure volume', 'maintain producer relationships', 'manage local basis'],
      mentalModels: null,
      attributes: null,
      participantIds: null,
    },
    {
      id: 'csr',
      label: 'Customer Service Rep',
      parentId: null,
      description: 'Supports producers with contract questions, delivery logistics, and issue resolution. Bridge between producer and internal operations.',
      marketContext: null,
      motivations: ['resolve producer issues quickly', 'maintain satisfaction', 'coordinate across departments'],
      mentalModels: null,
      attributes: null,
      participantIds: null,
    },
    {
      id: 'strategic_account_rep',
      label: 'Strategic Account Rep',
      parentId: null,
      description: 'Manages high-value producer accounts. Focuses on long-term relationship health, account growth, and strategic value.',
      marketContext: null,
      motivations: ['grow account value', 'deepen relationships', 'identify strategic opportunities'],
      mentalModels: null,
      attributes: null,
      participantIds: null,
    },
  ];

  for (const persona of roots) {
    await upsertPersona(persona);
  }
}

// ---- Internal ----

function rowToPersona(row: Record<string, unknown>): PersonaRow {
  return {
    id: row.id as string,
    label: row.label as string,
    parentId: (row.parent_id as string) || null,
    description: (row.description as string) || null,
    marketContext: row.market_context ? JSON.parse(row.market_context as string) : null,
    motivations: row.motivations ? JSON.parse(row.motivations as string) : null,
    mentalModels: row.mental_models ? JSON.parse(row.mental_models as string) : null,
    attributes: row.attributes ? JSON.parse(row.attributes as string) : null,
    participantIds: row.participant_ids ? JSON.parse(row.participant_ids as string) : null,
    createdAt: (row.created_at as string) || undefined,
    updatedAt: (row.updated_at as string) || undefined,
  };
}
