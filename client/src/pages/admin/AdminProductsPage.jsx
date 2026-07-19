import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { inr } from '../../utils/format.js';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';
import Spinner from '../../components/common/Spinner.jsx';

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const confirm = useConfirm();

  const load = (q = '') =>
    api.get('/admin/products', { params: q ? { search: q } : {} })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]));

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const remove = async (p) => {
    const ok = await confirm({
      title: 'Remove this product?',
      message: `"${p.name}" will be hidden from the store. Past orders keep their history.`,
      confirmLabel: 'Remove product',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/products/${p.id}`);
      toast('Product removed');
      load(search);
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="heading text-2xl sm:text-3xl">Products</h1>
        <Link to="/admin/products/new" className="btn-primary"><Plus size={16} /> Add product</Link>
      </div>
      <input
        className="field mt-5 max-w-sm"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {products === null ? (
        <Spinner full />
      ) : (
        <div className="glass mt-5 overflow-x-auto rounded-(--radius-card)">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="border-t transition-colors hover:bg-highlight/10" style={{ borderColor: 'var(--glass-border)' }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]?.url} alt="" className="h-12 w-9 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">
                            {p.name}
                            {p.isFeatured && <Star size={12} className="ml-1 inline text-warning" fill="currentColor" />}
                          </p>
                          <p className="text-xs text-muted">{p.variants.length} variants</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-muted">{p.category} / {p.subcategory}</td>
                    <td className="px-5 py-3 font-medium">{inr(p.price)}</td>
                    <td className={`px-5 py-3 font-medium ${stock < 5 ? 'text-warning' : ''}`}>{stock}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.isActive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                        {p.isActive ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/products/${p.id}`} className="rounded-full p-2 text-muted hover:text-body" aria-label="Edit">
                          <Pencil size={15} strokeWidth={1.5} />
                        </Link>
                        {p.isActive && (
                          <button onClick={() => remove(p)} className="rounded-full p-2 text-muted hover:text-error" aria-label="Remove">
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
