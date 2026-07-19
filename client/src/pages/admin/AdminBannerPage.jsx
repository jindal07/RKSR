import { useEffect, useState } from 'react';
import { api, errMsg } from '../../services/api.js';
import { useToast } from '../../components/common/Toast.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
        checked ? 'bg-accent' : 'glass'
      }`}
      style={{ borderColor: 'var(--border-strong)' }}
    >
      <span
        className={`absolute top-1 h-[18px] w-[18px] rounded-full transition-all duration-200 ${
          checked ? 'left-[26px] bg-accent-fg' : 'left-1 bg-(--text-muted)'
        }`}
      />
    </button>
  );
}

export default function AdminBannerPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/banner')
      .then(({ data: { banner } }) =>
        setForm({
          enabled: banner.enabled,
          text: banner.text || '',
          linkText: banner.linkText || '',
          linkUrl: banner.linkUrl || '',
          endsAt: toLocalInput(banner.endsAt),
        })
      )
      .catch(() => setForm({ enabled: false, text: '', linkText: '', linkUrl: '', endsAt: '' }));
  }, []);

  if (!form) return <Spinner full />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/banner', {
        enabled: form.enabled,
        text: form.text.trim(),
        linkText: form.linkText.trim() || null,
        linkUrl: form.linkUrl.trim() || null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      });
      toast('Banner saved');
    } catch (err) {
      toast(errMsg(err, 'Could not save banner'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="heading text-2xl sm:text-3xl">Announcement banner</h1>
      <p className="mt-2 text-sm text-muted">
        Shown at the very top of the store, above the navigation. Turn it off any time.
      </p>

      <form onSubmit={save} className="mt-6 space-y-6">
        <section className="glass flex items-center justify-between gap-4 rounded-(--radius-card) p-4 sm:p-6">
          <div>
            <p className="text-sm font-semibold">Show banner on the store</p>
            <p className="mt-1 text-xs text-muted">
              {form.enabled ? 'Customers can see the banner right now' : 'Banner is hidden'}
            </p>
          </div>
          <Toggle
            checked={form.enabled}
            onChange={(enabled) => setForm((f) => ({ ...f, enabled }))}
            label="Show banner"
          />
        </section>

        <section className="glass space-y-4 rounded-(--radius-card) p-4 sm:p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Banner text
            </label>
            <input
              className="field"
              maxLength={200}
              placeholder="Don't miss the limited-time deals!"
              value={form.text}
              onChange={set('text')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Link label (optional)
              </label>
              <input className="field" maxLength={60} placeholder="Check out now!" value={form.linkText} onChange={set('linkText')} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Link URL (optional)
              </label>
              <input className="field" placeholder="/products or https://…" value={form.linkUrl} onChange={set('linkUrl')} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Countdown ends at (optional)
            </label>
            <input type="datetime-local" className="field sm:max-w-xs" value={form.endsAt} onChange={set('endsAt')} />
            <p className="mt-1.5 text-xs text-muted">
              Shows a live D/H/M/S countdown; the banner hides itself automatically when time runs out.
            </p>
          </div>
        </section>

        {/* live preview */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Preview</p>
          <div className="overflow-hidden rounded-(--radius-field)">
            <div className="bg-accent px-3 py-2.5 text-accent-fg">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-0.5 text-center">
                <p className="text-[13px] font-medium">{form.text || 'Your banner text…'}</p>
                {form.endsAt && (
                  <span className="text-sm font-semibold tabular-nums">
                    05<span className="text-[11px] font-light opacity-70">D</span> 12
                    <span className="text-[11px] font-light opacity-70">H</span> 26
                    <span className="text-[11px] font-light opacity-70">M</span> 32
                    <span className="text-[11px] font-light opacity-70">S</span>
                  </span>
                )}
                {form.linkText && (
                  <span className="text-xs underline underline-offset-2 opacity-90">{form.linkText}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary sm:px-12">
          {saving ? 'Saving…' : 'Save banner'}
        </button>
      </form>
    </div>
  );
}
