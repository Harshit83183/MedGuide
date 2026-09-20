import supabase from './db-client.js';

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\bip\b/g, ' ')
    .replace(/[()[\]{}.,/\\+\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryTokens(value) {
  return normalize(value)
    .split(' ')
    .filter((word) => word.length >= 2);
}

function isCombination(name) {
  const n = normalize(name);

  return (
    /\band\b/.test(n) ||
    String(name || '').includes('+') ||
    String(name || '').includes(',')
  );
}

function startsWithIngredient(name, query) {
  const n = normalize(name);
  const q = normalize(query);

  return n === q || n.startsWith(`${q} `);
}

function hasStrengthQuery(query) {
  return /\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|ml|iu|units?|%)\b/i.test(
    String(query || '')
  );
}

function scoreProduct(product, query) {
  const q = normalize(query);
  const name = normalize(product.product_name);
  const code = normalize(product.drug_code);

  if (!q) return 0;
  if (code === q) return 1000;
  if (name === q) return 1000;

  const tokens = queryTokens(q);

  if (!tokens.length) return 0;

  const matched = tokens.filter((token) =>
    name.includes(token)
  ).length;

  if (!matched) return 0;

  const ratio = matched / tokens.length;

  if (startsWithIngredient(name, q)) {
    return Math.round(800 + ratio * 100);
  }

  return Math.round(ratio * 600);
}

function classify(product, query) {
  const q = normalize(query);
  const name = normalize(product.product_name);
  const code = normalize(product.drug_code);

  if (code === q || name === q) {
    return 'exact';
  }

  const strengthSpecified = hasStrengthQuery(query);
  const combination = isCombination(product.product_name);

  if (
    !strengthSpecified &&
    startsWithIngredient(product.product_name, query) &&
    !combination
  ) {
    return 'exact';
  }

  if (
    strengthSpecified &&
    startsWithIngredient(product.product_name, query)
  ) {
    const tokens = queryTokens(query);
    const allPresent = tokens.every((token) =>
      name.includes(token)
    );

    if (allPresent && !combination) {
      return 'exact';
    }
  }

  return 'related';
}

function shapeProduct(product, score, matchType) {
  const mrp = Number(product.mrp || 0);

  return {
    id: product.id,
    drug_code: product.drug_code,
    product_name: product.product_name,
    unit_size: product.unit_size || '',
    mrp: mrp > 0 ? mrp : null,
    category: product.category || '',
    source: product.source || 'PMBI',
    source_url: product.source_url || '',
    source_updated_at: product.source_updated_at || null,
    match_score: score,
    match_type: matchType,
    price_available: mrp > 0
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const q = String(req.query.q || '').trim();

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 50, 1),
      100
    );

    if (!q) {
      const { data, error, count } = await supabase
        .from('jan_aushadhi_medicines')
        .select('*', { count: 'exact' })
        .order('product_name', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return res.status(200).json({
        products: (data || []).map((product) =>
          shapeProduct(product, 0, 'catalogue')
        ),
        exact: [],
        related: [],
        total: count || 0,
        query: '',
        source: 'PMBI'
      });
    }

    const safeQuery = q
      .replace(/[%_,()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const searchTokens = queryTokens(safeQuery).slice(0, 6);

    let rows = [];

    const direct = await supabase
      .from('jan_aushadhi_medicines')
      .select('*')
      .or(
        `product_name.ilike.%${safeQuery}%,drug_code.eq.${safeQuery}`
      )
      .limit(200);

    if (direct.error) throw direct.error;

    rows = direct.data || [];

    if (rows.length === 0 && searchTokens.length) {
      const filters = searchTokens.map(
        (token) => `product_name.ilike.%${token}%`
      );

      const fallback = await supabase
        .from('jan_aushadhi_medicines')
        .select('*')
        .or(filters.join(','))
        .limit(200);

      if (fallback.error) throw fallback.error;

      rows = fallback.data || [];
    }

    const unique = new Map();

    for (const product of rows) {
      unique.set(product.id, product);
    }

    const ranked = Array.from(unique.values())
      .map((product) => {
        const score = scoreProduct(product, q);
        const matchType = classify(product, q);

        return {
          product,
          score,
          matchType
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (a.matchType !== b.matchType) {
          return a.matchType === 'exact' ? -1 : 1;
        }

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const aPrice = Number(a.product.mrp || 0);
        const bPrice = Number(b.product.mrp || 0);

        if (aPrice > 0 && bPrice <= 0) return -1;
        if (bPrice > 0 && aPrice <= 0) return 1;

        return String(a.product.product_name).localeCompare(
          String(b.product.product_name)
        );
      });

    const exact = ranked
      .filter((item) => item.matchType === 'exact')
      .slice(0, limit)
      .map((item) =>
        shapeProduct(item.product, item.score, 'exact')
      );

    const related = ranked
      .filter((item) => item.matchType === 'related')
      .slice(0, limit)
      .map((item) =>
        shapeProduct(item.product, item.score, 'related')
      );

    return res.status(200).json({
      products: [...exact, ...related].slice(0, limit),
      exact,
      related,
      total: exact.length + related.length,
      query: q,
      source: 'PMBI'
    });
  } catch (err) {
    console.error('medicines API:', err);

    return res.status(500).json({
      error:
        err instanceof Error
          ? err.message
          : 'Medicines fetch failed'
    });
  }
}