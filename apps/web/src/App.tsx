type Template = {
  id: string
  name: string
  slug: string
  style: string
  price: string
  accent: string
}

type Invitation = {
  slug: string
  couple: string
  template: string
  eventDate: string
  status: 'Draft' | 'Published'
  rsvpCount: number
}

const templates: Template[] = [
  {
    id: 'tmp-jawa-001',
    name: 'Adat Jawa Klasik',
    slug: 'adat-jawa',
    style: 'Tradisional, batik, krem emas',
    price: 'Premium',
    accent: '#9b5f2e',
  },
  {
    id: 'tmp-modern-001',
    name: 'Modern Editorial',
    slug: 'modern-editorial',
    style: 'Clean, foto besar, tipografi elegan',
    price: 'Basic',
    accent: '#334155',
  },
  {
    id: 'tmp-floral-001',
    name: 'Floral Soft Garden',
    slug: 'floral-garden',
    style: 'Bunga lembut, pastel, romantis',
    price: 'Premium',
    accent: '#8a6f76',
  },
]

const invitations: Invitation[] = [
  {
    slug: 'joko-cikita',
    couple: 'Joko & Cikita',
    template: 'Adat Jawa Klasik',
    eventDate: '2026-06-20',
    status: 'Published',
    rsvpCount: 128,
  },
  {
    slug: 'demo-adat-jawa',
    couple: 'Rama & Shinta',
    template: 'Adat Jawa Klasik',
    eventDate: '2026-08-12',
    status: 'Draft',
    rsvpCount: 0,
  },
]

const stats = [
  ['1.240+', 'undangan aktif'],
  ['42 ms', 'target respons cache'],
  ['Static', 'public output'],
]

function getInvitation(slug: string) {
  return invitations.find((item) => item.slug === slug) ?? invitations[0]
}

function App() {
  const pathname = window.location.pathname

  if (pathname.startsWith('/dashboard')) {
    return <DashboardPage />
  }

  if (pathname.startsWith('/templates')) {
    return <TemplatesPage />
  }

  if (pathname.startsWith('/u/')) {
    const slug = pathname.split('/').filter(Boolean)[1] ?? 'joko-cikita'
    return <PublicInvitationPage invitation={getInvitation(slug)} />
  }

  return <HomePage />
}

function HomePage() {
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
                  <span>{item.status}</span>
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

function TemplatesPage() {
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
          {templates.map((template) => (
            <article className="template-card" key={template.id}>
              <div
                className="template-art"
                style={{
                  background: `radial-gradient(circle at 50% 25%, ${template.accent}40, transparent 34%), linear-gradient(145deg, #fff8ec, #ead7bd)`,
                }}
              />
              <div className="template-body">
                <p>{template.price}</p>
                <h2>{template.name}</h2>
                <span>{template.style}</span>
                <a
                  className="button secondary"
                  href={`/u/${template.slug === 'adat-jawa' ? 'joko-cikita' : 'demo-adat-jawa'}`}
                >
                  Preview
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function DashboardPage() {
  const totalRSVP = invitations.reduce((sum, item) => sum + item.rsvpCount, 0)

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
          <button className="button gold" type="button">
            Buat Undangan
          </button>
        </header>

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
                <a href={`/u/${item.slug}`}>Preview</a>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function PublicInvitationPage({ invitation }: { invitation: Invitation }) {
  const eventDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date(invitation.eventDate))

  return (
    <main className="paper-grain min-screen">
      <section className="public-invite">
        <p className="eyebrow ornament">The wedding of</p>
        <h1>{invitation.couple}</h1>
        <p>Sabtu, {eventDate}</p>
        <div className="guest-card">
          <span>Kepada Yth.</span>
          <strong>Bapak/Ibu/Saudara/i</strong>
          <button className="button primary" type="button">
            Buka Undangan
          </button>
        </div>
        <div className="event-grid">
          {['Akad Nikah', 'Resepsi', 'Live Streaming'].map((item) => (
            <article key={item}>
              <h2>{item}</h2>
              <p>Detail acara siap dihubungkan ke editor.</p>
            </article>
          ))}
        </div>
        <a className="credit" href="/">
          Dibuat dengan CintaBuku
        </a>
      </section>
    </main>
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

export default App
