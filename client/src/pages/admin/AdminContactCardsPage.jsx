import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Link2, ImagePlus } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const MAX_CARDS = 6;
const EMPTY_CARD = { avatarUrl: '', name: '', role: '', bio: '', links: [] };

const initialsOf = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export default function AdminContactCardsPage() {
  const [cards, setCards] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileRef = useRef(null);
  const uploadTarget = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    api.get('/contact-cards')
      .then(({ data }) =>
        setCards(data.cards.map(({ avatarUrl, name, role, bio, links }) => ({ avatarUrl: avatarUrl || '', name, role, bio, links })))
      )
      .catch(() => setCards([]));
  }, []);

  if (cards === null) return <Spinner full />;

  const setCard = (i, patch) =>
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const setLink = (i, li, patch) =>
    setCards((cs) =>
      cs.map((c, idx) =>
        idx === i
          ? { ...c, links: c.links.map((l, lidx) => (lidx === li ? { ...l, ...patch } : l)) }
          : c
      )
    );

  const move = (i, dir) =>
    setCards((cs) => {
      const next = [...cs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return cs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const removeCard = async (i) => {
    const ok = await confirm({
      title: 'Remove this person?',
      message: `"${cards[i].name || 'Unnamed'}" will disappear from the store after you save.`,
      confirmLabel: 'Remove card',
      danger: true,
    });
    if (ok) setCards((cs) => cs.filter((_, idx) => idx !== i));
  };

  const pickPhoto = (i) => {
    uploadTarget.current = i;
    fileRef.current?.click();
  };

  const uploadPhoto = async (file) => {
    const i = uploadTarget.current;
    if (i === null || !file) return;
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/admin/upload', fd);
      setCard(i, { avatarUrl: data.url });
    } catch (e) {
      toast(errMsg(e, 'Upload failed'), 'error');
    } finally {
      setUploadingIdx(null);
      uploadTarget.current = null;
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = cards.map((c) => ({
        avatarUrl: c.avatarUrl.trim() || null,
        name: c.name.trim(),
        role: c.role.trim(),
        bio: c.bio.trim(),
        links: c.links.filter((l) => l.label.trim() && l.url.trim()),
      }));
      const { data } = await api.put('/admin/contact-cards', { cards: payload });
      setCards(data.cards.map(({ avatarUrl, name, role, bio, links }) => ({ avatarUrl: avatarUrl || '', name, role, bio, links })));
      toast('Contact cards saved');
    } catch (err) {
      toast(errMsg(err, 'Could not save cards'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="heading text-2xl sm:text-3xl">Contact cards</h1>
      <p className="mt-2 text-sm text-muted">
        The people behind the store — shown above the footer. Add up to {MAX_CARDS}, reorder with the arrows, remove all to hide the section.
      </p>

      <input
        ref={fileRef} type="file" accept="image/*" hidden
        onChange={(e) => { uploadPhoto(e.target.files[0]); e.target.value = ''; }}
      />

      <form onSubmit={save} className="mt-6 space-y-5">
        {cards.map((card, i) => (
          <section key={i} className="glass rounded-(--radius-card) p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              {/* photo */}
              <div className="flex items-center gap-4">
                {card.avatarUrl ? (
                  <img src={card.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <span className="glass-strong heading flex h-16 w-16 items-center justify-center rounded-full text-xl">
                    {initialsOf(card.name)}
                  </span>
                )}
                <div className="flex flex-col gap-1.5">
                  <button type="button" onClick={() => pickPhoto(i)} disabled={uploadingIdx === i}
                    className="btn-secondary px-4 py-2 text-xs">
                    {uploadingIdx === i ? <Spinner /> : <><ImagePlus size={13} /> {card.avatarUrl ? 'Change photo' : 'Upload photo'}</>}
                  </button>
                  {card.avatarUrl && (
                    <button type="button" onClick={() => setCard(i, { avatarUrl: '' })}
                      className="text-xs text-muted underline-offset-2 hover:underline">
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"
                  className="rounded-full p-2 text-muted hover:text-body disabled:opacity-30">
                  <ArrowUp size={16} strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === cards.length - 1} aria-label="Move down"
                  className="rounded-full p-2 text-muted hover:text-body disabled:opacity-30">
                  <ArrowDown size={16} strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => removeCard(i)} aria-label="Remove card"
                  className="rounded-full p-2 text-muted hover:text-error">
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required className="field" maxLength={60} placeholder="Name (e.g. Priya Sharma)"
                value={card.name} onChange={(e) => setCard(i, { name: e.target.value })} />
              <input className="field" maxLength={60} placeholder="Role (e.g. Customer Care Lead)"
                value={card.role} onChange={(e) => setCard(i, { role: e.target.value })} />
              <textarea rows={2} className="field resize-y sm:col-span-2" maxLength={300}
                placeholder="Short bio (optional)"
                value={card.bio} onChange={(e) => setCard(i, { bio: e.target.value })} />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Contact links <span className="normal-case tracking-normal">(shown as icons — mailto:, tel:, or social URLs)</span>
              </p>
              <div className="space-y-2">
                {card.links.map((link, li) => (
                  <div key={li} className="flex flex-wrap items-center gap-2">
                    <Link2 size={14} strokeWidth={1.5} className="shrink-0 text-muted" />
                    <input required className="field w-36 flex-1" maxLength={80} placeholder="Label (e.g. Email)"
                      value={link.label} onChange={(e) => setLink(i, li, { label: e.target.value })} />
                    <input required className="field w-48 flex-[2]" maxLength={500}
                      placeholder="mailto:…, tel:…, https://instagram.com/…"
                      value={link.url} onChange={(e) => setLink(i, li, { url: e.target.value })} />
                    <button type="button" aria-label="Remove link"
                      onClick={() => setCard(i, { links: card.links.filter((_, idx) => idx !== li) })}
                      className="rounded-full p-2 text-muted hover:text-error">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
              {card.links.length < 5 && (
                <button type="button" onClick={() => setCard(i, { links: [...card.links, { label: '', url: '' }] })}
                  className="btn-secondary mt-3 px-4 py-2 text-xs">
                  <Plus size={13} /> Add link
                </button>
              )}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap gap-3">
          {cards.length < MAX_CARDS && (
            <button type="button" onClick={() => setCards((cs) => [...cs, { ...EMPTY_CARD }])} className="btn-secondary">
              <Plus size={15} /> Add person ({cards.length}/{MAX_CARDS})
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary sm:px-12">
            {saving ? 'Saving…' : 'Save cards'}
          </button>
        </div>
      </form>
    </div>
  );
}
