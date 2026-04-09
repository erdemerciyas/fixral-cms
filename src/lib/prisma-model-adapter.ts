/**
 * Prisma Model Adapter
 *
 * Provides a Mongoose-compatible API surface on top of Prisma delegates.
 * This allows existing API routes to work without changes when models
 * switch from the Document-store pattern to dedicated relational tables.
 */

type PlainObject = Record<string, any>;
type SortSpec = Record<string, 1 | -1>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  return [...crypto.getRandomValues(new Uint8Array(12))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ------------------------------------------------------------------ */
/*  MongoDB filter  →  Prisma where                                    */
/* ------------------------------------------------------------------ */

function translateFilter(filter: PlainObject = {}): PlainObject {
  if (!filter || Object.keys(filter).length === 0) return {};

  const where: PlainObject = {};

  if (Array.isArray(filter.$or)) {
    where.OR = filter.$or.map((sub: PlainObject) => translateFilter(sub));
  }
  if (Array.isArray(filter.$and)) {
    where.AND = filter.$and.map((sub: PlainObject) => translateFilter(sub));
  }

  for (const [key, value] of Object.entries(filter)) {
    if (key.startsWith('$')) continue;

    // Map _id to id for Prisma
    const prismaKey = key === '_id' ? 'id' : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const condition: PlainObject = {};
      let hasOperator = false;

      if ('$in' in value) {
        const inValues = (value.$in ?? []).filter((v: any) => v != null).map((v: any) => (key === '_id' ? String(v) : v));
        condition.in = inValues;
        hasOperator = true;
      }
      if ('$nin' in value) {
        const ninValues = (value.$nin ?? []).filter((v: any) => v != null).map((v: any) => (key === '_id' ? String(v) : v));
        condition.notIn = ninValues;
        hasOperator = true;
      }
      if ('$gt' in value) {
        condition.gt = value.$gt;
        hasOperator = true;
      }
      if ('$gte' in value) {
        condition.gte = value.$gte;
        hasOperator = true;
      }
      if ('$lt' in value) {
        condition.lt = value.$lt;
        hasOperator = true;
      }
      if ('$lte' in value) {
        condition.lte = value.$lte;
        hasOperator = true;
      }
      if ('$ne' in value) {
        condition.not = key === '_id' ? String(value.$ne) : value.$ne;
        hasOperator = true;
      }
      if ('$exists' in value) {
        if (value.$exists) {
          // $exists: true  — field is not null
          // But if combined with $ne: null, it means strictly not null
          if ('$ne' in value && value.$ne === null) {
            condition.not = null;
          } else {
            condition.not = null;
          }
        } else {
          // $exists: false — field is null
          condition.equals = null;
        }
        hasOperator = true;
      }
      if ('$regex' in value) {
        const pattern = value.$regex instanceof RegExp ? value.$regex.source : String(value.$regex);
        const options = value.$options ?? '';
        // Simple contains for basic patterns; Prisma doesn't support full regex
        // Extract core search term from regex pattern
        const simplified = pattern
          .replace(/\(\?=\.\*([^)]+)\)/g, '$1') // lookaheads → plain term
          .replace(/[.*+?^${}()|[\]\\]/g, '')    // strip regex metacharacters
          .trim();
        if (simplified) {
          condition.contains = simplified;
          if (options.includes('i')) {
            condition.mode = 'insensitive';
          }
        }
        hasOperator = true;
      }

      if (hasOperator) {
        where[prismaKey] = condition;
      } else {
        // Plain object comparison (e.g., nested field match)
        where[prismaKey] = value;
      }
    } else {
      where[prismaKey] = key === '_id' ? String(value) : value;
    }
  }

  return where;
}

/* ------------------------------------------------------------------ */
/*  MongoDB sort  →  Prisma orderBy                                    */
/* ------------------------------------------------------------------ */

function translateSort(sort?: SortSpec): PlainObject[] | undefined {
  if (!sort) return undefined;
  return Object.entries(sort).map(([key, direction]) => ({
    [key === '_id' ? 'id' : key]: direction === -1 ? 'desc' : 'asc',
  }));
}

/* ------------------------------------------------------------------ */
/*  MongoDB select  →  Prisma select                                   */
/* ------------------------------------------------------------------ */

function translateSelect(selection?: string): PlainObject | undefined {
  if (!selection) return undefined;
  const fields = selection.split(/\s+/).filter(Boolean);
  if (!fields.length) return undefined;

  const isExclude = fields.every((f) => f.startsWith('-'));
  if (isExclude) {
    // Prisma doesn't natively support exclusion; we handle this post-query
    return undefined;
  }

  const select: PlainObject = { id: true };
  for (const field of fields) {
    if (field.startsWith('+')) {
      select[field.slice(1)] = true;
    } else {
      select[field === '_id' ? 'id' : field] = true;
    }
  }
  // Always include id and timestamps for _id compatibility
  select.createdAt = true;
  select.updatedAt = true;
  return select;
}

function applyExcludeProjection(doc: PlainObject, selection?: string): PlainObject {
  if (!selection) return doc;
  const fields = selection.split(/\s+/).filter(Boolean);
  if (!fields.length) return doc;
  const isExclude = fields.every((f) => f.startsWith('-'));
  if (!isExclude) return doc;

  const out = { ...doc };
  for (const field of fields) {
    const key = field.replace(/^-/, '');
    if (key) delete out[key === '_id' ? 'id' : key];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  MongoDB $set/$inc/$unset update  →  Prisma data                    */
/* ------------------------------------------------------------------ */

function translateUpdate(update: PlainObject): PlainObject {
  if (!update || typeof update !== 'object') return {};

  const data: PlainObject = {};
  const hasOperator = Object.keys(update).some((key) => key.startsWith('$'));

  if (!hasOperator) {
    // Direct replacement — strip Mongoose internals
    const { _id, id, __v, createdAt, ...rest } = update;
    return rest;
  }

  if (update.$set && typeof update.$set === 'object') {
    for (const [key, value] of Object.entries(update.$set)) {
      if (key === '_id' || key === 'id' || key === '__v') continue;
      data[key] = value;
    }
  }
  if (update.$unset && typeof update.$unset === 'object') {
    for (const key of Object.keys(update.$unset)) {
      data[key] = null;
    }
  }
  if (update.$inc && typeof update.$inc === 'object') {
    for (const [key, value] of Object.entries(update.$inc)) {
      data[key] = { increment: Number(value) };
    }
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Document normalization — add _id alias                             */
/* ------------------------------------------------------------------ */

function normalizeDoc(doc: PlainObject | null): PlainObject | null {
  if (!doc) return null;
  const obj: PlainObject = { ...doc, _id: doc.id };
  obj.toObject = () => deepClone(obj);
  obj.save = async () => obj;
  return obj;
}

function normalizeDocs(docs: PlainObject[]): PlainObject[] {
  return docs.map((doc) => normalizeDoc(doc)!);
}

/* ------------------------------------------------------------------ */
/*  Query class — chainable Mongoose-like interface                    */
/* ------------------------------------------------------------------ */

class PrismaQuery<T = any> implements PromiseLike<T> {
  private _sort?: SortSpec;
  private _skip = 0;
  private _limit?: number;
  private _select?: string;
  private _lean = false;

  constructor(
    private delegate: any,
    private filter: PlainObject = {},
  ) {}

  sort(spec: SortSpec) {
    this._sort = spec;
    return this;
  }

  skip(count: number) {
    this._skip = Math.max(0, count);
    return this;
  }

  limit(count: number) {
    this._limit = Math.max(0, count);
    return this;
  }

  select(selection: string) {
    this._select = selection;
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  populate() {
    // No-op — same as document-model.ts
    return this;
  }

  async exec(): Promise<any> {
    const args: PlainObject = {
      where: translateFilter(this.filter),
    };
    const orderBy = translateSort(this._sort);
    if (orderBy) args.orderBy = orderBy;
    if (this._skip) args.skip = this._skip;
    if (typeof this._limit === 'number') args.take = this._limit;

    // Prisma select (include projection)
    const select = translateSelect(this._select);
    if (select) args.select = select;

    let docs: PlainObject[];
    try {
      docs = await this.delegate.findMany(args);
    } catch (e: any) {
      // Retry without orderBy/where on validation errors (unknown field)
      if (e?.name === 'PrismaClientValidationError') {
        const fallbackArgs: PlainObject = {};
        if (this._skip) fallbackArgs.skip = this._skip;
        if (typeof this._limit === 'number') fallbackArgs.take = this._limit;
        docs = await this.delegate.findMany(fallbackArgs);
      } else {
        throw e;
      }
    }
    docs = normalizeDocs(docs);

    // Apply exclusion projection post-query
    if (this._select) {
      docs = docs.map((doc: PlainObject) => applyExcludeProjection(doc, this._select));
    }

    if (this._lean) return docs.map((doc: PlainObject) => deepClone(doc));
    return docs;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled as any, onrejected as any);
  }
}

/* ------------------------------------------------------------------ */
/*  SingleQuery — returns one document or null                         */
/* ------------------------------------------------------------------ */

class PrismaSingleQuery<T = any> implements PromiseLike<T | null> {
  private _select?: string;
  private _lean = false;

  constructor(
    private delegate: any,
    private filter: PlainObject = {},
  ) {}

  sort() {
    return this;
  }

  select(selection: string) {
    this._select = selection;
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  populate() {
    return this;
  }

  async exec(): Promise<T | null> {
    const args: PlainObject = {
      where: translateFilter(this.filter),
    };
    const select = translateSelect(this._select);
    if (select) args.select = select;

    let doc: PlainObject | null;
    try {
      doc = await this.delegate.findFirst(args);
    } catch (e: any) {
      if (e?.name === 'PrismaClientValidationError') {
        // Unknown field in where clause — return null gracefully
        return null;
      }
      throw e;
    }
    doc = normalizeDoc(doc);

    if (doc && this._select) {
      doc = applyExcludeProjection(doc, this._select);
    }

    if (this._lean && doc) return deepClone(doc) as T;
    return doc as T | null;
  }

  then<TResult1 = T | null, TResult2 = never>(
    onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled as any, onrejected as any);
  }
}

/* ------------------------------------------------------------------ */
/*  Model field introspection (cached)                                 */
/* ------------------------------------------------------------------ */

const fieldCache = new Map<any, Set<string>>();

async function getModelFields(delegate: any): Promise<Set<string>> {
  if (fieldCache.has(delegate)) return fieldCache.get(delegate)!;
  try {
    // Create a dummy query to trigger Prisma's field validation
    // We inspect the model's fields from a known empty result
    const sample = await delegate.findFirst({ select: undefined });
    if (sample) {
      const fields = new Set(Object.keys(sample));
      fieldCache.set(delegate, fields);
      return fields;
    }
  } catch { /* ignore */ }
  // Fallback: empty set means no filtering
  return new Set<string>();
}

function stripUnknownFields(data: PlainObject, knownFields: Set<string>): PlainObject {
  if (knownFields.size === 0) return data;
  const clean: PlainObject = {};
  for (const [key, value] of Object.entries(data)) {
    if (knownFields.has(key)) clean[key] = value;
  }
  return clean;
}

/* ------------------------------------------------------------------ */
/*  createPrismaModel — the main factory                               */
/* ------------------------------------------------------------------ */

export function createPrismaModel<T = any>(
  modelName: string,
  delegate: any,
  extras?: Record<string, any>,
): T {
  const Model: any = function PrismaModelCtor(this: PlainObject, data: PlainObject = {}) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = createId();
      this.id = this._id;
    }
  };

  Model.modelName = modelName;

  Model.prototype.save = async function save() {
    const { _id, toObject, save: _save, populate, __v, ...data } = this;
    const id = _id || this.id || createId();
    try {
      const saved = await delegate.upsert({
        where: { id: String(id) },
        update: data,
        create: { id: String(id), ...data },
      });
      Object.assign(this, saved, { _id: saved.id });
      return normalizeDoc(saved);
    } catch (e: any) {
      // If unknown field error, strip invalid fields and retry
      if (e?.code === 'P2009' || e?.message?.includes('Unknown arg')) {
        const knownFields = await getModelFields(delegate);
        const cleanData: PlainObject = {};
        for (const [key, value] of Object.entries(data)) {
          if (knownFields.has(key)) cleanData[key] = value;
        }
        const saved = await delegate.upsert({
          where: { id: String(id) },
          update: cleanData,
          create: { id: String(id), ...cleanData },
        });
        Object.assign(this, saved, { _id: saved.id });
        return normalizeDoc(saved);
      }
      throw e;
    }
  };

  Model.prototype.toObject = function toObject() {
    return deepClone(this);
  };

  /* ---- Static methods ---- */

  Model.create = async (data: PlainObject) => {
    const { _id, __v, toObject, save: _save, populate, ...rest } = data;
    const id = _id ? String(_id) : createId();
    try {
      const created = await delegate.create({ data: { id, ...rest } });
      return normalizeDoc(created);
    } catch (e: any) {
      if (e?.code === 'P2009' || e?.message?.includes('Unknown arg')) {
        const knownFields = await getModelFields(delegate);
        const cleanData = stripUnknownFields(rest, knownFields);
        const created = await delegate.create({ data: { id, ...cleanData } });
        return normalizeDoc(created);
      }
      throw e;
    }
  };

  Model.find = (filter: PlainObject = {}, projection?: string) => {
    const query = new PrismaQuery(delegate, filter);
    if (projection) query.select(projection);
    return query;
  };

  Model.findOne = (filter: PlainObject = {}) => {
    return new PrismaSingleQuery(delegate, filter);
  };

  Model.findById = (id: string) => {
    return Model.findOne({ _id: String(id) });
  };

  Model.countDocuments = async (filter: PlainObject = {}) => {
    try {
      return await delegate.count({ where: translateFilter(filter) });
    } catch (e: any) {
      if (e?.name === 'PrismaClientValidationError') return 0;
      throw e;
    }
  };

  Model.estimatedDocumentCount = async () => {
    return delegate.count();
  };

  Model.exists = async (filter: PlainObject = {}) => {
    const doc = await delegate.findFirst({
      where: translateFilter(filter),
      select: { id: true },
    });
    return doc ? { _id: doc.id } : null;
  };

  Model.distinct = async (field: string, filter: PlainObject = {}) => {
    try {
      const prismaField = field === '_id' ? 'id' : field;
      const docs = await delegate.findMany({
        where: translateFilter(filter),
        select: { [prismaField]: true },
      });
      const values = docs.map((d: PlainObject) => d[prismaField]).filter((v: any) => v != null);
      return Array.from(new Set(values.map((v: any) => JSON.stringify(v)))).map((v) => JSON.parse(v as string));
    } catch (e: any) {
      if (e?.name === 'PrismaClientValidationError') return [];
      throw e;
    }
  };

  Model.insertMany = async (items: PlainObject[]) => {
    const results: PlainObject[] = [];
    for (const item of items) {
      results.push(await Model.create(item));
    }
    return results;
  };

  Model.deleteOne = async (filter: PlainObject = {}) => {
    const doc = await delegate.findFirst({ where: translateFilter(filter), select: { id: true } });
    if (!doc) return { deletedCount: 0 };
    await delegate.delete({ where: { id: doc.id } });
    return { deletedCount: 1 };
  };

  Model.deleteMany = async (filter: PlainObject = {}) => {
    const result = await delegate.deleteMany({ where: translateFilter(filter) });
    return { deletedCount: result.count };
  };

  Model.updateOne = async (filter: PlainObject, update: PlainObject) => {
    const doc = await delegate.findFirst({ where: translateFilter(filter), select: { id: true } });
    if (!doc) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    await delegate.update({ where: { id: doc.id }, data: translateUpdate(update) });
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  };

  Model.updateMany = async (filter: PlainObject, update: PlainObject) => {
    const result = await delegate.updateMany({
      where: translateFilter(filter),
      data: translateUpdate(update),
    });
    return { acknowledged: true, matchedCount: result.count, modifiedCount: result.count };
  };

  Model.findOneAndUpdate = async (filter: PlainObject, update: PlainObject, options: PlainObject = {}) => {
    let doc = await delegate.findFirst({ where: translateFilter(filter) });
    if (!doc && options.upsert) {
      const data = { ...(update.$set ?? update), _id: undefined, __v: undefined };
      const { _id, __v, ...createData } = { ...translateFilter(filter), ...data };
      const id = createId();
      doc = await delegate.create({ data: { id, ...createData } });
      return normalizeDoc(doc);
    }
    if (!doc) return null;
    const updated = await delegate.update({
      where: { id: doc.id },
      data: translateUpdate(update),
    });
    return normalizeDoc(options.new === false ? doc : updated);
  };

  Model.findByIdAndUpdate = async (id: string, update: PlainObject, options: PlainObject = {}) => {
    return Model.findOneAndUpdate({ _id: String(id) }, update, options);
  };

  Model.findByIdAndDelete = async (id: string) => {
    try {
      const doc = await delegate.delete({ where: { id: String(id) } });
      return normalizeDoc(doc);
    } catch {
      return null;
    }
  };

  Model.findOneAndDelete = async (filter: PlainObject = {}) => {
    const doc = await delegate.findFirst({ where: translateFilter(filter) });
    if (!doc) return null;
    await delegate.delete({ where: { id: doc.id } });
    return normalizeDoc(doc);
  };

  Model.aggregate = async (pipeline: PlainObject[] = []) => {
    // Simplified aggregate support for common patterns
    let where: PlainObject = {};
    let orderBy: PlainObject[] | undefined;
    let take: number | undefined;
    let selectFields: Record<string, boolean> | undefined;

    for (const stage of pipeline) {
      if (stage.$match) {
        where = { ...where, ...translateFilter(stage.$match) };
      }
      if (stage.$sort) {
        orderBy = translateSort(stage.$sort);
      }
      if (stage.$limit) {
        take = stage.$limit;
      }
      if (stage.$project) {
        selectFields = {};
        for (const [key, value] of Object.entries(stage.$project)) {
          if (value) selectFields[key === '_id' ? 'id' : key] = true;
        }
        selectFields.id = true;
      }
    }

    const args: PlainObject = { where };
    if (orderBy) args.orderBy = orderBy;
    if (take) args.take = take;
    if (selectFields) args.select = selectFields;

    const docs = await delegate.findMany(args);
    return normalizeDocs(docs);
  };

  // Attach extras (custom static methods like getSiteSettings, getActiveTheme, etc.)
  if (extras) Object.assign(Model, extras);

  return Model as T;
}
