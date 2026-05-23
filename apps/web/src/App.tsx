import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type Template = {
  id: string
  name: string
  slug: string
  category: string
  createdAt?: string
}

type Invitation = {
  id?: string
  slug: string
  couple: string
  template: string
  templateSlug?: string
  eventDate: string
  status: string
  rsvpCount: number
  createdAt?: string
}

type CreateInvitationInput = {
  slug: string
  couple: string
  templateSlug: string
  eventDate: string
}

type UpdateInvitationInput = {
  couple: string
  eventDate: string
  status: string
}

type RSVP = {
  id: string
  name: string
  message: string
  status: string
  guests: number
  createdAt?: string
}

type RSVPInput = {
  name: string
  message: string
  status: string
  guests: number
}

const templateMeta: Record<string, { style: string; accent: string }> = {
  'adat-jawa': {
    style: 'Tradisional, batik, krem emas',
    accent: '#9b5f2e',
  },
  'klasik-hijau-emas': {
    style: 'Frame elegan, hijau gelap, aksen emas',
    accent: '#064346',
  },
  'floral-garden': {
    style: 'Bunga lembut, pastel, romantis',
    accent: '#8a6f76',
  },
}

const fallbackTemplates: Template[] = [
  {
    id: 'tmp-jawa-001',
    name: 'Adat Jawa Klasik',
    slug: 'adat-jawa',
    category: 'premium',
  },
  {
    id: 'tmp-classic-001',
    name: 'Klasik Hijau Emas',
    slug: 'klasik-hijau-emas',
    category: 'premium',
  },
  {
    id: 'tmp-floral-001',
    name: 'Floral Soft Garden',
    slug: 'floral-garden',
    category: 'premium',
  },
]

const fallbackInvitations: Invitation[] = [
  {
    slug: 'joko-cikita',
    couple: 'Joko & Cikita',
    template: 'Adat Jawa Klasik',
    templateSlug: 'adat-jawa',
    eventDate: '2026-06-20',
    status: 'Published',
    rsvpCount: 128,
  },
  {
    slug: 'rama-shinta',
    couple: 'Rama & Shinta',
    template: 'Klasik Hijau Emas',
    templateSlug: 'klasik-hijau-emas',
    eventDate: '2026-08-12',
    status: 'Draft',
    rsvpCount: 0,
  },
]

const apiBase = import.meta.env.VITE_API_URL ?? (
  import.meta.env.DEV ? 'http://localhost:8088' : ''
)

function apiURL(path: string) {
  return `${apiBase}${path}`
}

function useAPIData() {
  const [templates, setTemplates] = useState<Template[]>(fallbackTemplates)
  const [invitations, setInvitations] = useState<Invitation[]>(fallbackInvitations)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [editorMessage, setEditorMessage] = useState('')
  const [rsvpsBySlug, setRSVPsBySlug] = useState<Record<string, RSVP[]>>({})
  const [rsvpMessage, setRSVPMessage] = useState('')

  async function loadData(signal?: AbortSignal) {
    try {
      const [templateResponse, invitationResponse] = await Promise.all([
        fetch(apiURL('/api/templates'), { signal }),
        fetch(apiURL('/api/invitations'), { signal }),
      ])

      if (!templateResponse.ok || !invitationResponse.ok) {
        throw new Error('API response was not ok')
      }

      const [templateData, invitationData] = await Promise.all([
        templateResponse.json() as Promise<Template[]>,
        invitationResponse.json() as Promise<Invitation[]>,
      ])

      setTemplates(templateData.length > 0 ? templateData : fallbackTemplates)
      setInvitations(
        invitationData.length > 0 ? invitationData : fallbackInvitations,
      )
      setSource('api')
    } catch {
      if (!signal?.aborted) {
        setSource('fallback')
      }
    }
  }

  async function createInvitation(input: CreateInvitationInput) {
    setIsCreating(true)
    setFormMessage('')
    try {
      const response = await fetch(apiURL('/api/invitations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(error?.error ?? 'Gagal membuat undangan')
      }

      const createdInvitation = await response.json() as Invitation
      setInvitations((current) => [createdInvitation, ...current])
      setSource('api')
      setFormMessage('Undangan baru berhasil dibuat.')
      return createdInvitation
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Gagal membuat undangan')
      return null
    } finally {
      setIsCreating(false)
    }
  }

  async function updateInvitation(slug: string, input: UpdateInvitationInput) {
    setIsUpdating(true)
    setEditorMessage('')
    try {
      const response = await fetch(apiURL(`/api/invitations/${slug}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(error?.error ?? 'Gagal menyimpan perubahan')
      }

      const updatedInvitation = await response.json() as Invitation
      setInvitations((current) =>
        current.map((item) =>
          item.slug === updatedInvitation.slug ? updatedInvitation : item,
        ),
      )
      setSource('api')
      setEditorMessage('Perubahan undangan berhasil disimpan.')
      return true
    } catch (error) {
      setEditorMessage(error instanceof Error ? error.message : 'Gagal menyimpan perubahan')
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  async function submitRSVP(slug: string, input: RSVPInput) {
    setIsSubmittingRSVP(true)
    setRSVPMessage('')
    try {
      const response = await fetch(apiURL(`/api/invitations/${slug}/rsvp`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(error?.error ?? 'Gagal mengirim RSVP')
      }

      const createdRSVP = await response.json() as RSVP
      setRSVPsBySlug((current) => ({
        ...current,
        [slug]: [createdRSVP, ...(current[slug] ?? [])],
      }))
      setInvitations((current) =>
        current.map((item) =>
          item.slug === slug
            ? { ...item, rsvpCount: item.rsvpCount + 1 }
            : item,
        ),
      )
      setRSVPMessage('Terima kasih, RSVP Anda sudah tersimpan.')
      return true
    } catch (error) {
      setRSVPMessage(error instanceof Error ? error.message : 'Gagal mengirim RSVP')
      return false
    } finally {
      setIsSubmittingRSVP(false)
    }
  }

  const loadRSVPs = useCallback(async (slug: string) => {
    try {
      const response = await fetch(apiURL(`/api/invitations/${slug}/rsvps`))
      if (!response.ok) {
        throw new Error('API response was not ok')
      }
      const data = await response.json() as RSVP[]
      setRSVPsBySlug((current) => ({ ...current, [slug]: data }))
    } catch {
      setRSVPsBySlug((current) => ({ ...current, [slug]: current[slug] ?? [] }))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void loadData(controller.signal)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  return {
    createInvitation,
    editorMessage,
    formMessage,
    invitations,
    isCreating,
    isSubmittingRSVP,
    isUpdating,
    loadRSVPs,
    rsvpMessage,
    rsvpsBySlug,
    source,
    submitRSVP,
    templates,
    updateInvitation,
  }
}

function getInvitation(slug: string, invitations: Invitation[]) {
  return invitations.find((item) => item.slug === slug) ?? invitations[0]
}

function getTemplateStyle(template: Template) {
  return (
    templateMeta[template.slug] ?? {
      style: `${titleCase(template.category)} template siap dikembangkan`,
      accent: '#77865b',
    }
  )
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function readableStatus(status: string) {
  return titleCase(status.toLowerCase())
}

function App() {
  const pathname = window.location.pathname
  const {
    createInvitation,
    editorMessage,
    formMessage,
    invitations,
    isCreating,
    isSubmittingRSVP,
    isUpdating,
    loadRSVPs,
    rsvpMessage,
    rsvpsBySlug,
    source,
    submitRSVP,
    templates,
    updateInvitation,
  } = useAPIData()

  if (pathname.startsWith('/dashboard/edit/')) {
    const slug = pathname.split('/').filter(Boolean)[2] ?? ''
    return (
      <EditorPage
        editorMessage={editorMessage}
        invitation={getInvitation(slug, invitations)}
        isUpdating={isUpdating}
        loadRSVPs={loadRSVPs}
        rsvps={rsvpsBySlug[slug] ?? []}
        updateInvitation={updateInvitation}
      />
    )
  }

  if (pathname.startsWith('/dashboard')) {
    return (
      <DashboardPage
        createInvitation={createInvitation}
        formMessage={formMessage}
        invitations={invitations}
        isCreating={isCreating}
        source={source}
        templates={templates}
      />
    )
  }

  if (pathname.startsWith('/templates')) {
    return <TemplatesPage templates={templates} />
  }

  if (pathname.startsWith('/u/')) {
    const slug = pathname.split('/').filter(Boolean)[1] ?? 'joko-cikita'
    return (
      <PublicInvitationPage
        invitation={getInvitation(slug, invitations)}
        isSubmittingRSVP={isSubmittingRSVP}
        rsvpMessage={rsvpMessage}
        submitRSVP={submitRSVP}
      />
    )
  }

  return <HomePage invitations={invitations} templates={templates} source={source} />
}

function HomePage({
  invitations,
  templates,
  source,
}: {
  invitations: Invitation[]
  templates: Template[]
  source: 'api' | 'fallback'
}) {
  const stats = useMemo(
    () => [
      [invitations.length.toLocaleString('id-ID'), 'undangan aktif'],
      [templates.length.toLocaleString('id-ID'), 'template tersedia'],
      [source === 'api' ? 'API' : 'Demo', 'sumber data'],
    ],
    [invitations.length, source, templates.length],
  )

  return (
    <main className="paper-grain min-screen overflow-hidden">
      <Nav />
      <section className="hero-grid page-shell">
        <div>
          <p className="eyebrow ornament">Platform undangan digital</p>
          <h1>Bangun SaaS undangan yang cepat, rapi, dan siap dijual.</h1>
          <p className="lead">
            Pondasi ringan untuk domain cintabuku.site: katalog template,
            dashboard user, halaman undangan publik, RSVP, dan Go API yang siap
            disambungkan ke PostgreSQL.
          </p>
          <div className="actions">
            <a className="button primary" href="/templates">
              Lihat Template
            </a>
            <a className="button secondary" href="/u/joko-cikita">
              Buka Demo Public
            </a>
          </div>
          <dl className="stats">
            {stats.map(([value, label]) => (
              <div className="stat-card" key={value}>
                <dt>{value}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="preview-card">
          <div className="preview-screen">
            <div className="preview-header">
              <span>Dashboard Preview</span>
              <b>Live</b>
            </div>
            <div className="preview-list">
              {invitations.map((item) => (
                <article className="preview-item" key={item.slug}>
                  <div>
                    <h3>{item.couple}</h3>
                    <p>{item.template}</p>
                  </div>
                  <span>{readableStatus(item.status)}</span>
                </article>
              ))}
            </div>
            <div className="preview-summary">
              <p>Template terpasang</p>
              <strong>{templates.length} desain</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function TemplatesPage({ templates }: { templates: Template[] }) {
  return (
    <main className="paper-grain min-screen">
      <Nav />
      <section className="page-shell page-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Katalog template</p>
            <h1>Desain siap pakai untuk dijual ulang.</h1>
          </div>
          <a className="button primary" href="/dashboard">
            Kelola Template
          </a>
        </div>

        <div className="template-grid">
          {templates.map((template) => {
            const style = getTemplateStyle(template)

            return (
              <article className="template-card" key={template.id}>
                <div
                  className="template-art"
                  style={{
                    background: `radial-gradient(circle at 50% 25%, ${style.accent}40, transparent 34%), linear-gradient(145deg, #fff8ec, #ead7bd)`,
                  }}
                />
                <div className="template-body">
                  <p>{titleCase(template.category)}</p>
                  <h2>{template.name}</h2>
                  <span>{style.style}</span>
                  <a
                    className="button secondary"
                    href={`/u/${template.slug === 'klasik-hijau-emas' ? 'rama-shinta' : 'joko-cikita'}`}
                  >
                    Preview
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function DashboardPage({
  createInvitation,
  formMessage,
  invitations,
  isCreating,
  templates,
  source,
}: {
  createInvitation: (input: CreateInvitationInput) => Promise<Invitation | null>
  formMessage: string
  invitations: Invitation[]
  isCreating: boolean
  templates: Template[]
  source: 'api' | 'fallback'
}) {
  const totalRSVP = invitations.reduce((sum, item) => sum + item.rsvpCount, 0)
  const firstTemplateSlug = templates[0]?.slug ?? 'adat-jawa'
  const [copiedSlug, setCopiedSlug] = useState('')
  const [createdLink, setCreatedLink] = useState('')
  const [form, setForm] = useState<CreateInvitationInput>({
    couple: '',
    eventDate: '',
    slug: '',
    templateSlug: firstTemplateSlug,
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const createdInvitation = await createInvitation({
      ...form,
      templateSlug: form.templateSlug || firstTemplateSlug,
    })
    if (createdInvitation) {
      setCreatedLink(invitationURL(createdInvitation.slug))
      setForm({
        couple: '',
        eventDate: '',
        slug: '',
        templateSlug: firstTemplateSlug,
      })
    }
  }

  async function copyInvitationLink(slug: string) {
    const link = invitationURL(slug)
    await navigator.clipboard?.writeText(link)
    setCopiedSlug(slug)
    window.setTimeout(() => setCopiedSlug(''), 1600)
  }

  return (
    <main className="dashboard min-screen">
      <section className="page-shell">
        <header className="dashboard-hero">
          <div>
            <a href="/">CintaBuku.</a>
            <h1>Dashboard SaaS Undangan</h1>
            <p>
              Panel awal untuk mengelola template, undangan, RSVP, dan
              publikasi.
            </p>
          </div>
          <a className="button gold" href="#create-invitation">
            Buat Undangan
          </a>
        </header>
        <p className="data-source">
          Data dashboard: {source === 'api' ? 'tersambung ke API' : 'mode demo'}
        </p>

        <section className="metric-grid">
          {[
            ['Undangan', invitations.length],
            ['Template', templates.length],
            ['RSVP', totalRSVP],
            ['Domain', 'cintabuku.site'],
          ].map(([label, value]) => (
            <article className="metric-card" key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="form-card" id="create-invitation">
          <div>
            <p className="eyebrow">Create invitation</p>
            <h2>Buat undangan baru</h2>
          </div>
          <form className="invite-form" onSubmit={handleSubmit}>
            <label>
              Nama pasangan
              <input
                onChange={(event) => setForm({ ...form, couple: event.target.value })}
                placeholder="Rama & Shinta"
                required
                type="text"
                value={form.couple}
              />
            </label>
            <label>
              Slug URL
              <input
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="rama-shinta"
                required
                type="text"
                value={form.slug}
              />
            </label>
            <label>
              Tanggal acara
              <input
                onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
                required
                type="date"
                value={form.eventDate}
              />
            </label>
            <label>
              Template
              <select
                onChange={(event) => setForm({ ...form, templateSlug: event.target.value })}
                value={form.templateSlug || firstTemplateSlug}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.slug}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary" disabled={isCreating} type="submit">
              {isCreating ? 'Menyimpan...' : 'Simpan Undangan'}
            </button>
            {formMessage ? <p className="form-message">{formMessage}</p> : null}
            {createdLink ? (
              <p className="created-link">
                Link undangan: <a href={createdLink}>{createdLink}</a>
              </p>
            ) : null}
          </form>
        </section>

        <section className="table-card">
          <div className="table-head">
            <h2>Undangan terbaru</h2>
            <a href="/templates">Pilih template</a>
          </div>
          <div className="invite-list">
            {invitations.map((item) => (
              <article className="invite-row" key={item.slug}>
                <div>
                  <strong>{item.couple}</strong>
                  <span>/{item.slug}</span>
                </div>
                <p>{item.template}</p>
                <b>{item.rsvpCount} RSVP</b>
                <div className="row-actions">
                  <a href={`/dashboard/edit/${item.slug}`}>Edit</a>
                  <a href={`/u/${item.slug}`}>Preview</a>
                  <button type="button" onClick={() => void copyInvitationLink(item.slug)}>
                    {copiedSlug === item.slug ? 'Tersalin' : 'Salin Link'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function EditorPage({
  editorMessage,
  invitation,
  isUpdating,
  loadRSVPs,
  rsvps,
  updateInvitation,
}: {
  editorMessage: string
  invitation: Invitation
  isUpdating: boolean
  loadRSVPs: (slug: string) => Promise<void>
  rsvps: RSVP[]
  updateInvitation: (slug: string, input: UpdateInvitationInput) => Promise<boolean>
}) {
  const [form, setForm] = useState<UpdateInvitationInput>({
    couple: invitation.couple,
    eventDate: invitation.eventDate,
    status: invitation.status.toLowerCase(),
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await updateInvitation(invitation.slug, form)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRSVPs(invitation.slug)
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [invitation.slug, loadRSVPs])

  return (
    <main className="dashboard min-screen">
      <section className="page-shell">
        <header className="dashboard-hero">
          <div>
            <a href="/dashboard">CintaBuku.</a>
            <h1>Edit Undangan</h1>
            <p>Ubah data inti sebelum masuk ke builder section yang lebih lengkap.</p>
          </div>
          <a className="button gold" href={`/u/${invitation.slug}`}>
            Preview
          </a>
        </header>

        <section className="form-card editor-card">
          <div>
            <p className="eyebrow">/{invitation.slug}</p>
            <h2>{invitation.couple}</h2>
          </div>
          <form className="invite-form editor-form" onSubmit={handleSubmit}>
            <label>
              Nama pasangan
              <input
                onChange={(event) => setForm({ ...form, couple: event.target.value })}
                required
                type="text"
                value={form.couple}
              />
            </label>
            <label>
              Tanggal acara
              <input
                onChange={(event) => setForm({ ...form, eventDate: event.target.value })}
                required
                type="date"
                value={form.eventDate}
              />
            </label>
            <label>
              Status
              <select
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                value={form.status}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <button className="button primary" disabled={isUpdating} type="submit">
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {editorMessage ? <p className="form-message">{editorMessage}</p> : null}
          </form>
        </section>

        <section className="table-card">
          <div className="table-head">
            <h2>RSVP masuk</h2>
            <span>{rsvps.length} respon</span>
          </div>
          <div className="rsvp-list">
            {rsvps.length === 0 ? (
              <p className="empty-state">Belum ada RSVP untuk undangan ini.</p>
            ) : (
              rsvps.map((item) => (
                <article className="rsvp-row" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{readableStatus(item.status)} - {item.guests} tamu</span>
                  </div>
                  <p>{item.message || 'Tanpa ucapan'}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

function PublicInvitationPage({
  invitation,
  isSubmittingRSVP,
  rsvpMessage,
  submitRSVP,
}: {
  invitation: Invitation
  isSubmittingRSVP: boolean
  rsvpMessage: string
  submitRSVP: (slug: string, input: RSVPInput) => Promise<boolean>
}) {
  const eventDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date(invitation.eventDate))
  const [form, setForm] = useState<RSVPInput>({
    guests: 1,
    message: '',
    name: '',
    status: 'attending',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = await submitRSVP(invitation.slug, form)
    if (ok) {
      setForm({
        guests: 1,
        message: '',
        name: '',
        status: 'attending',
      })
    }
  }

  if (invitation.templateSlug === 'klasik-hijau-emas') {
    return (
      <main className="classic-green-theme min-screen">
        <section className="classic-hero">
          <div className="classic-frame">
            <p className="eyebrow">Walimatul Urs</p>
            <h1>{invitation.couple}</h1>
            <span>{eventDate}</span>
            <div className="classic-divider" />
            <p>Dengan hormat kami mengundang Bapak/Ibu/Saudara/i untuk hadir.</p>
            <a className="button gold" href="#rsvp">
              Buka Undangan
            </a>
          </div>
        </section>

        <section className="classic-content">
          <article className="classic-card">
            <span>Menuju Hari Bahagia</span>
            <div className="countdown-row">
              {['Hari', 'Jam', 'Menit', 'Detik'].map((label, index) => (
                <b key={label}>
                  {index === 0 ? '28' : '00'}
                  <small>{label}</small>
                </b>
              ))}
            </div>
          </article>
          <article className="classic-card">
            <span>Akad & Resepsi</span>
            <h2>Sabtu, {eventDate}</h2>
            <p>Detail venue, maps, dan susunan acara siap dihubungkan ke editor.</p>
          </article>
          <PublicRSVPForm
            form={form}
            isSubmittingRSVP={isSubmittingRSVP}
            onChange={setForm}
            onSubmit={handleSubmit}
            rsvpMessage={rsvpMessage}
          />
        </section>
        <InviteBottomNav />
      </main>
    )
  }

  return (
    <main className="clone-invite-shell">
      <section className="clone-cover min-screen" id="cover">
        <div className="cover-panel cover-panel-left" />
        <div className="cover-panel cover-panel-right" />
        <div className="clone-cover-card">
          <p className="clone-kicker">The Wedding Of</p>
          <h1>{invitation.couple}</h1>
          <span>Sabtu, {eventDate}</span>
          <div className="clone-recipient">
            <small>Kepada Yth.</small>
            <strong>Bapak/Ibu/Saudara/i</strong>
          </div>
          <a className="clone-open-button" href="#detail-acara">
            Buka Undangan
          </a>
        </div>
      </section>

      <section className="clone-page" id="detail-acara">
        <div className="clone-photo-card">
          <div className="clone-photo">J & C</div>
          <p className="clone-kicker">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
          <h2>{invitation.couple}</h2>
          <p>
            Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud
            menyelenggarakan pernikahan putra-putri kami.
          </p>
        </div>

        <div className="clone-countdown">
          {['Hari', 'Jam', 'Menit', 'Detik'].map((label, index) => (
            <b key={label}>
              {index === 0 ? '28' : '00'}
              <small>{label}</small>
            </b>
          ))}
        </div>

        <div className="clone-frame">
          <span>Akad Nikah</span>
          <h2>Sabtu, {eventDate}</h2>
          <p>08.00 WIB sampai selesai</p>
        </div>

        <div className="clone-frame">
          <span>Resepsi</span>
          <h2>Gedung Serbaguna Darussunnah</h2>
          <p>Detail lokasi dan maps akan tersambung ke editor.</p>
        </div>

        <div className="clone-gallery">
          {[1, 2, 3].map((item) => (
            <div key={item}>Galeri {item}</div>
          ))}
        </div>

        <PublicRSVPForm
          form={form}
          isSubmittingRSVP={isSubmittingRSVP}
          onChange={setForm}
          onSubmit={handleSubmit}
          rsvpMessage={rsvpMessage}
        />
        <a className="credit" href="/">
          Dibuat dengan CintaBuku
        </a>
      </section>
      <InviteBottomNav />
    </main>
  )
}

function PublicRSVPForm({
  form,
  isSubmittingRSVP,
  onChange,
  onSubmit,
  rsvpMessage,
}: {
  form: RSVPInput
  isSubmittingRSVP: boolean
  onChange: (form: RSVPInput) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  rsvpMessage: string
}) {
  return (
    <form className="rsvp-form" id="rsvp" onSubmit={onSubmit}>
      <h2>Konfirmasi Kehadiran</h2>
      <label>
        Nama
        <input
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          placeholder="Nama Anda"
          required
          type="text"
          value={form.name}
        />
      </label>
      <label>
        Kehadiran
        <select
          onChange={(event) => onChange({ ...form, status: event.target.value })}
          value={form.status}
        >
          <option value="attending">Hadir</option>
          <option value="declined">Tidak hadir</option>
        </select>
      </label>
      <label>
        Jumlah tamu
        <input
          max="10"
          min="1"
          onChange={(event) => onChange({ ...form, guests: Number(event.target.value) })}
          type="number"
          value={form.guests}
        />
      </label>
      <label className="wide-field">
        Ucapan
        <textarea
          onChange={(event) => onChange({ ...form, message: event.target.value })}
          placeholder="Tulis ucapan singkat"
          rows={4}
          value={form.message}
        />
      </label>
      <button className="button primary" disabled={isSubmittingRSVP} type="submit">
        {isSubmittingRSVP ? 'Mengirim...' : 'Kirim RSVP'}
      </button>
      {rsvpMessage ? <p className="form-message">{rsvpMessage}</p> : null}
    </form>
  )
}

function InviteBottomNav() {
  return (
    <nav className="invite-bottom-nav">
      {['Cover', 'Acara', 'RSVP'].map((item) => (
        <a href={item === 'Cover' ? '#' : item === 'RSVP' ? '#rsvp' : '#detail-acara'} key={item}>
          {item}
        </a>
      ))}
    </nav>
  )
}

function Nav() {
  return (
    <nav className="nav page-shell">
      <a className="brand" href="/">
        CintaBuku<span>.</span>
      </a>
      <div className="nav-links">
        <a href="/templates">Template</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/u/joko-cikita">Demo Undangan</a>
      </div>
      <a className="button nav-button" href="/dashboard">
        Mulai SaaS
      </a>
    </nav>
  )
}

function invitationURL(slug: string) {
  return `${window.location.origin}/u/${slug}`
}

export default App
