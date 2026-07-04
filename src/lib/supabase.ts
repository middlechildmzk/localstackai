import { createClient } from "@supabase/supabase-js";
import { getDemoTable } from "./demo-data";

export const hasSupabaseConfig = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasSupabaseServiceConfig = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// ─── Browser client (components) ─────────────────────────────────────────────
export const createBrowserClient = () => {
  if (!hasSupabaseConfig()) {
    // Trust rule: never silently serve demo data on the live site.
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
      throw new Error(
        "Supabase env vars missing in production. Refusing to serve demo data."
      );
    }
    console.warn("[stackbuilder] Supabase env missing; using demo data (dev only).");
    return createDemoClient() as any;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true } }
  );
};

// ─── Server client (server actions / route handlers) ─────────────────────────
export const createServerClient = () => {
  if (!hasSupabaseServiceConfig()) {
    // Trust rule: never silently serve demo data on the live site.
    if (process.env.VERCEL_ENV === "production") {
      throw new Error(
        "Supabase env vars missing in production. Refusing to serve demo data."
      );
    }
    console.warn("[stackbuilder] Supabase env missing; using demo data (dev only).");
    return createDemoClient() as any;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
};

class DemoQuery {
  private table: string;
  private rows: any[];
  private filters: Array<(row: any) => boolean> = [];
  private maxRows?: number;
  private orderKey?: string;
  private orderAscending = true;
  private wantSingle = false;
  private wantCount = false;
  private headOnly = false;

  constructor(table: string) {
    this.table = table;
    this.rows = getDemoTable(table);
  }

  select(_columns?: string, options?: { count?: string; head?: boolean }) {
    this.wantCount = Boolean(options?.count);
    this.headOnly = Boolean(options?.head);
    return this;
  }

  eq(key: string, value: any) {
    this.filters.push((row) => row?.[key] === value);
    return this;
  }

  neq(key: string, value: any) {
    this.filters.push((row) => row?.[key] !== value);
    return this;
  }

  in(key: string, values: any[]) {
    this.filters.push((row) => values.includes(row?.[key]));
    return this;
  }

  ilike(key: string, pattern: string) {
    const needle = String(pattern).replace(/%/g, "").toLowerCase();
    this.filters.push((row) => String(row?.[key] ?? "").toLowerCase().includes(needle));
    return this;
  }

  order(key: string, opts?: { ascending?: boolean; referencedTable?: string }) {
    this.orderKey = key;
    this.orderAscending = opts?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.maxRows = n;
    return this;
  }

  single() {
    this.wantSingle = true;
    return this;
  }

  insert(payload: any) {
    const row = Array.isArray(payload) ? payload[0] : payload;
    return Promise.resolve({ data: { id: `demo-${this.table}-${Date.now()}`, ...row }, error: null });
  }

  update(payload: any) {
    return {
      eq: (_key: string, _value: any) => Promise.resolve({ data: payload, error: null }),
    };
  }

  upsert(payload: any) {
    return Promise.resolve({ data: payload, error: null });
  }

  delete() {
    return { eq: (_key: string, _value: any) => Promise.resolve({ data: null, error: null }) };
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }

  private async execute() {
    let data = [...this.rows];
    for (const fn of this.filters) data = data.filter(fn);

    if (this.orderKey) {
      const key = this.orderKey;
      const asc = this.orderAscending;
      data.sort((a, b) => {
        const av = valueForSort(a, key);
        const bv = valueForSort(b, key);
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (asc ? 1 : -1);
      });
    }

    const count = this.wantCount ? data.length : null;
    if (typeof this.maxRows === "number") data = data.slice(0, this.maxRows);
    if (this.headOnly) return { data: null, count, error: null };
    if (this.wantSingle) return { data: data[0] ?? null, count, error: null };
    return { data, count, error: null };
  }
}

function valueForSort(row: any, key: string) {
  if (key === "trending_score") return row?.trending?.trending_score ?? row?.tool_score ?? 0;
  return row?.[key] ?? 0;
}

function createDemoClient() {
  return {
    from(table: string) {
      return new DemoQuery(table);
    },
    rpc(_fn: string, _args?: any) {
      return Promise.resolve({ data: null, error: null });
    },
  };
}
