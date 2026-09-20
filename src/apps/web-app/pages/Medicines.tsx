import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Package,
  ChevronRight,
  X,
  CheckCircle2,
  Info,
  ExternalLink
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, inr } from '../lib/api';

interface Medicine {
  id: number;
  drug_code: string;
  product_name: string;
  unit_size: string;
  mrp: number | null;
  category: string;
  source: string;
  source_url: string;
  source_updated_at: string | null;
  match_score: number;
  match_type: 'exact' | 'related' | 'catalogue';
  price_available: boolean;
}

interface MedicineResponse {
  products: Medicine[];
  exact: Medicine[];
  related: Medicine[];
  total: number;
  query: string;
  source: string;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

const CART_KEY = 'medguide_jan_aushadhi_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Medicines() {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [products, setProducts] = useState<Medicine[]>([]);
  const [exact, setExact] = useState<Medicine[]>([]);
  const [related, setRelated] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    loadCatalogue();
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  async function loadCatalogue() {
    setLoading(true);
    setError('');

    try {
      const data = await api<MedicineResponse>(
        '/api/medicines?limit=50'
      );

      setProducts(data.products || []);
      setExact([]);
      setRelated([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Medicines load nahi ho paayi.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function searchMedicine() {
    const value = query.trim();

    if (!value) {
      setSearchedQuery('');
      await loadCatalogue();
      return;
    }

    setSearching(true);
    setError('');

    try {
      const data = await api<MedicineResponse>(
        `/api/medicines?q=${encodeURIComponent(value)}&limit=50`
      );

      setProducts(data.products || []);
      setExact(data.exact || []);
      setRelated(data.related || []);
      setSearchedQuery(value);
    } catch (err) {
      setProducts([]);
      setExact([]);
      setRelated([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Medicine search nahi ho paayi.'
      );
    } finally {
      setSearching(false);
    }
  }

  function addToCart(medicine: Medicine) {
    if (!medicine.price_available || medicine.mrp === null) return;

    setCart((current) => {
      const found = current.find(
        (item) => item.medicine.id === medicine.id
      );

      if (found) {
        return current.map((item) =>
          item.medicine.id === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        );
      }

      return [
        ...current,
        {
          medicine,
          quantity: 1
        }
      ];
    });
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.medicine.id === id
            ? {
                ...item,
                quantity: item.quantity + amount
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: number) {
    setCart((current) =>
      current.filter((item) => item.medicine.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
    setCheckoutOpen(false);
  }

  function isInCart(id: number) {
    return cart.some((item) => item.medicine.id === id);
  }

  const cartQuantity = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  const janAushadhiTotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const price = item.medicine.mrp;

        if (price === null || price <= 0) {
          return total;
        }

        return total + price * item.quantity;
      }, 0),
    [cart]
  );

  function MedicineCard({
    medicine,
    relatedProduct = false
  }: {
    medicine: Medicine;
    relatedProduct?: boolean;
  }) {
    const added = isInCart(medicine.id);

    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className={
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ' +
              (relatedProduct
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700')
            }
          >
            <Pill size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  'rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ' +
                  (relatedProduct
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700')
                }
              >
                {relatedProduct
                  ? 'Related Product'
                  : searchedQuery
                    ? 'Exact Search Match'
                    : 'Official Catalogue'}
              </span>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
                PMBI
              </span>
            </div>

            <h3 className="mt-2 text-[15px] font-extrabold leading-6 text-[#0B1F3A]">
              {medicine.product_name}
            </h3>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span>
                <b className="text-slate-700">Drug Code:</b>{' '}
                {medicine.drug_code}
              </span>

              <span>
                <b className="text-slate-700">Pack:</b>{' '}
                {medicine.unit_size || 'Not listed'}
              </span>

              <span>
                <b className="text-slate-700">Category:</b>{' '}
                {medicine.category || 'Not listed'}
              </span>
            </div>

            {relatedProduct && (
              <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                <Info size={15} className="mt-0.5 shrink-0" />
                <span>
                  Ye search se related product hai. Isse searched
                  medicine ka exact substitute na samjhein.
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 sm:min-w-[155px] sm:text-right">
            {medicine.price_available &&
            medicine.mrp !== null ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Official MRP
                </p>

                <p className="text-2xl font-extrabold text-emerald-700">
                  {inr(medicine.mrp)}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  per {medicine.unit_size || 'pack'}
                </p>

                <button
                  onClick={() => addToCart(medicine)}
                  className={
                    'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ' +
                    (added
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-[#0B3D91] text-white hover:bg-[#092f70]')
                  }
                >
                  {added ? (
                    <>
                      <CheckCircle2 size={15} />
                      Add Another
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} />
                      Add to Cart
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-3 text-left sm:text-center">
                <p className="text-xs font-bold text-slate-600">
                  MRP unavailable
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  Official imported data me usable MRP nahi hai.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        icon={<Pill size={28} />}
        kicker="Jan Aushadhi · Official PMBI Catalogue"
        title="Save on Medicine"
        sub="Jan Aushadhi catalogue me medicine search karein, official MRP dekhein aur apna medicine cart banayein."
      />

      <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchMedicine();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-slate-200 px-4 py-3 focus-within:border-blue-400">
            <Search size={19} className="shrink-0 text-slate-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Medicine, generic name ya drug code search karein..."
              className="w-full bg-transparent text-sm outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={searching}
            className="rounded-2xl bg-[#0B3D91] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#092f70] disabled:opacity-60"
          >
            {searching ? 'Searching...' : 'Search Medicine'}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-600" />
            Catalogue source: PMBI / Jan Aushadhi official product data
          </p>

          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200"
          >
            <ShoppingCart size={16} />
            Cart
            {cartQuantity > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] text-white">
                {cartQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-slate-100">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }}
            className="mx-auto h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600"
          />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Official catalogue load ho raha hai...
          </p>
        </div>
      ) : searchedQuery ? (
        <div className="space-y-7">
          <Reveal>
            <div>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Search Results
                  </p>
                  <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                    “{searchedQuery}”
                  </h2>
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {exact.length} exact · {related.length} related
                </p>
              </div>

              {exact.length > 0 ? (
                <div className="space-y-3">
                  {exact.map((medicine) => (
                    <MedicineCard
                      key={medicine.id}
                      medicine={medicine}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center">
                  <p className="font-extrabold text-[#0B1F3A]">
                    Exact match nahi mila
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Neeche related catalogue products available ho
                    sakte hain.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal>
              <div>
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    Related Products
                  </p>
                  <h2 className="text-lg font-extrabold text-[#0B1F3A]">
                    Similar search results
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    In products ki composition/strength alag ho sakti
                    hai. Ye exact substitutes nahi hain.
                  </p>
                </div>

                <div className="space-y-3">
                  {related.map((medicine) => (
                    <MedicineCard
                      key={medicine.id}
                      medicine={medicine}
                      relatedProduct
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {exact.length === 0 && related.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-100">
              <Search
                size={30}
                className="mx-auto text-slate-300"
              />
              <p className="mt-3 font-extrabold text-[#0B1F3A]">
                Medicine nahi mili
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Generic name, strength ya drug code se dobara search
                karein.
              </p>
            </div>
          )}
        </div>
      ) : (
        <Reveal>
          <div>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Official Catalogue
                </p>
                <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                  Jan Aushadhi Medicines
                </h2>
              </div>

              <p className="text-xs text-slate-400">
                Search for complete catalogue
              </p>
            </div>

            <div className="space-y-3">
              {products.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-[13px] leading-5 text-blue-900">
        <p className="flex gap-2">
          <Info size={17} className="mt-0.5 shrink-0" />
          <span>
            Medicine switch ya substitution sirf naam dekh kar na
            karein. Composition, strength, dosage form aur release
            type confirm karein. Zarurat par doctor ya pharmacist se
            confirm karein.
          </span>
        </p>
      </div>

      <div className="mt-3">
        <Disclaimer compact />
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40">
          <button
            className="absolute inset-0"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />

          <motion.div
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            exit={{ x: 450 }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Medicine Cart
                </p>
                <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                  Jan Aushadhi Cart
                </h2>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-600"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingCart
                    size={38}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-4 font-extrabold text-[#0B1F3A]">
                    Cart khali hai
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Medicine search karke Add to Cart karein.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.medicine.id}
                      className="rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold leading-5 text-[#0B1F3A]">
                            {item.medicine.product_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.medicine.unit_size} · Drug Code{' '}
                            {item.medicine.drug_code}
                          </p>

                          <p className="mt-2 font-extrabold text-emerald-700">
                            {item.medicine.mrp !== null
                              ? inr(item.medicine.mrp)
                              : 'MRP unavailable'}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.medicine.id)
                          }
                          className="self-start rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-xl border">
                          <button
                            onClick={() =>
                              changeQuantity(
                                item.medicine.id,
                                -1
                              )
                            }
                            className="p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-9 text-center text-sm font-extrabold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              changeQuantity(
                                item.medicine.id,
                                1
                              )
                            }
                            className="p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="font-extrabold text-[#0B1F3A]">
                          {item.medicine.mrp !== null
                            ? inr(
                                item.medicine.mrp *
                                  item.quantity
                              )
                            : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">
                    Jan Aushadhi Total
                  </span>

                  <span className="text-2xl font-extrabold text-emerald-700">
                    {inr(janAushadhiTotal)}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  Official imported PMBI MRP ke basis par
                </p>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-3.5 text-sm font-extrabold text-white"
                >
                  Checkout & Compare
                  <ChevronRight size={17} />
                </button>

                <button
                  onClick={clearCart}
                  className="mt-2 w-full py-2 text-xs font-bold text-red-600"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <button
            className="absolute inset-0"
            onClick={() => setCheckoutOpen(false)}
            aria-label="Close checkout"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Checkout & Compare
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#0B1F3A]">
                  Medicine Cost Summary
                </h2>
              </div>

              <button
                onClick={() => setCheckoutOpen(false)}
                className="rounded-xl bg-slate-100 p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.medicine.id}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-[#0B1F3A]">
                        {item.medicine.product_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.medicine.unit_size} ×{' '}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 font-extrabold text-emerald-700">
                      {item.medicine.mrp !== null
                        ? inr(
                            item.medicine.mrp *
                              item.quantity
                          )
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                Official Jan Aushadhi Total
              </p>

              <p className="mt-1 text-4xl font-extrabold">
                {inr(janAushadhiTotal)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[11px] text-white/70">
                    Medicines
                  </p>
                  <p className="text-lg font-extrabold">
                    {cart.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-[11px] text-white/70">
                    Total packs
                  </p>
                  <p className="text-lg font-extrabold">
                    {cartQuantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-extrabold text-amber-900">
                Market comparison
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                Jan Aushadhi total official PMBI MRP se calculate
                hua hai. Branded market total aur total saving tabhi
                dikhayi jayegi jab current aur trustworthy comparison
                price source available ho. App koi market price
                invent nahi karega.
              </p>
            </div>

            <a
              href="https://janaushadhi.gov.in/near-by-kendra"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-3.5 text-sm font-extrabold text-white"
            >
              Find Jan Aushadhi Kendra
              <ExternalLink size={16} />
            </a>

            <p className="mt-3 text-center text-[11px] leading-4 text-slate-400">
              Catalogue MRP specific Kendra par current stock
              availability confirm nahi karta.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}