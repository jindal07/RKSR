import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { SIZES } from '../../utils/format.js';
import { useToast } from '../../components/common/Toast.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Select from '../../components/common/Select.jsx';

const EMPTY = {
  name: '', description: '', category: 'men', subcategory: '',
  price: '', mrp: '', isFeatured: false, isActive: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]); // {url, alt}
  const [variants, setVariants] = useState([{ size: 'M', color: '', stock: 10 }]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!editing) return;
    api.get(`/admin/products/${id}`)
      .then(({ data: { product: p } }) => {
        setForm({
          name: p.name, description: p.description, category: p.category,
          subcategory: p.subcategory, price: p.price, mrp: p.mrp,
          isFeatured: p.isFeatured, isActive: p.isActive,
        });
        setImages(p.images.map((i) => ({ url: i.url, alt: i.alt || '' })));
        setVariants(p.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })));
        setLoading(false);
      })
      .catch(() => { toast('Product not found', 'error'); navigate('/admin/products'); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const uploadFiles = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const { data } = await api.post('/admin/upload', fd);
        setImages((imgs) => [...imgs, { url: data.url, alt: form.name }]);
      }
    } catch (e) {
      toast(errMsg(e, 'Upload failed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const setVariant = (i, key, value) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));

  const submit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast('Add at least one image', 'error');
    if (variants.some((v) => !v.color.trim())) return toast('Every variant needs a colour', 'error');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        images,
        variants: variants.map((v) => ({ ...v, stock: Number(v.stock) })),
      };
      if (editing) await api.put(`/admin/products/${id}`, payload);
      else await api.post('/admin/products', payload);
      toast(editing ? 'Product updated' : 'Product added');
      navigate('/admin/products');
    } catch (err) {
      toast(errMsg(err, 'Could not save product'), 'error');
      setSaving(false);
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-body">
        <ArrowLeft size={15} /> Back to products
      </Link>
      <h1 className="heading text-2xl sm:text-3xl">{editing ? 'Edit product' : 'Add product'}</h1>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <section className="glass space-y-4 rounded-(--radius-card) p-4 sm:p-6">
          <input required className="field" placeholder="Product name" value={form.name} onChange={set('name')} />
          <textarea required rows={4} className="field resize-y" placeholder="Description" value={form.description} onChange={set('description')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={form.category}
              onChange={(category) => setForm((f) => ({ ...f, category }))}
              options={[
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'kids', label: 'Kids' },
                { value: 'accessories', label: 'Accessories' },
              ]}
              ariaLabel="Category"
            />
            <input required className="field" placeholder="Subcategory (e.g. kurtas)" value={form.subcategory} onChange={set('subcategory')} />
            <input required type="number" min="1" className="field" placeholder="Selling price (₹)" value={form.price} onChange={set('price')} />
            <input required type="number" min="1" className="field" placeholder="MRP (₹)" value={form.mrp} onChange={set('mrp')} />
          </div>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="accent-(--accent)" />
              Featured on home page
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="accent-(--accent)" />
              Visible in store
            </label>
          </div>
        </section>

        {/* images */}
        <section className="glass rounded-(--radius-card) p-4 sm:p-6">
          <p className="heading text-lg">Images</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.url} alt="" className="h-28 w-21 rounded-xl object-cover" style={{ width: '5.25rem' }} />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                  className="glass-strong absolute -right-2 -top-2 rounded-full p-1"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="glass glass-hover flex h-28 items-center justify-center rounded-xl text-muted"
              style={{ width: '5.25rem' }}
            >
              {uploading ? <Spinner /> : <ImagePlus size={20} strokeWidth={1.5} />}
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" multiple hidden
              onChange={(e) => { uploadFiles([...e.target.files]); e.target.value = ''; }}
            />
          </div>
          <p className="mt-3 text-xs text-muted">JPG, PNG, WEBP or SVG · max 2 MB each · first image is the cover</p>
        </section>

        {/* variants */}
        <section className="glass rounded-(--radius-card) p-4 sm:p-6">
          <p className="heading text-lg">Sizes, colours & stock</p>
          <div className="mt-4 space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3">
                <Select
                  value={v.size}
                  onChange={(size) => setVariant(i, 'size', size)}
                  options={SIZES}
                  ariaLabel="Size"
                  className="w-28"
                />
                <input
                  required className="field w-40 flex-1" placeholder="Colour"
                  value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)}
                />
                <input
                  required type="number" min="0" className="field w-28" placeholder="Stock"
                  value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)}
                />
                <button
                  type="button"
                  disabled={variants.length === 1}
                  onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                  className="rounded-full p-2 text-muted hover:text-error disabled:opacity-30"
                  aria-label="Remove variant"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setVariants((vs) => [...vs, { size: 'M', color: '', stock: 10 }])}
            className="btn-secondary mt-4"
          >
            <Plus size={15} /> Add variant
          </button>
        </section>

        <button type="submit" disabled={saving || uploading} className="btn-primary w-full sm:w-auto sm:px-12">
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
        </button>
      </form>
    </div>
  );
}
