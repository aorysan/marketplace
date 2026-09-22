const modern = require('../skills/builder/scripts/themes/modern');
const brand = { name: 'Venturo Pro', primaryColor: '#009BAD', secondaryColor: '#006D79' };

const hero = modern.renderModernHero({ title: 'Venturo Pro', content: 'Tagline here\n\nDesc here longer than thirty chars yes' }, brand, 0, '', 9);
if (!hero.includes('hero-layout-grid') || !hero.includes('Venturo Pro')) { console.error('FAIL: hero'); process.exit(1); }

const welcome = modern.renderModernWelcome({ title: 'Masalah yang Dihadapi', content: 'Intro line here\n\n- **Biaya naik** — tagihan cloud\n- **Brand lepas** — template generik' }, brand, 1, 'problem', '', 9);
if (!welcome.includes('two-col-layout-grid') || !welcome.includes('01') || !welcome.includes('Biaya naik')) { console.error('FAIL: welcome'); process.exit(1); }

const services = modern.renderModernServices({ title: 'Layanan Unggulan', content: 'Intro\n\n- **Brand DNA** — kunci identitas\n- **Pipeline** — render lokal' }, brand, 3, '', 9);
if (!services.includes('services-layout-grid') || !services.includes('Brand DNA')) { console.error('FAIL: services'); process.exit(1); }
// Zero-hallucination: 2 cards in, no invented 3rd/4th card titles
if (/Paket \d|Fitur Utama \d/.test(services)) { console.error('FAIL: services invented defaults'); process.exit(1); }

if (modern.classifyModernArchetype({ title: 'Paket & Kerjasama', content: '' }, 7, 9) !== 'pricing') { console.error('FAIL: classify'); process.exit(1); }
// Classifier routing (§5.3): density-first feature-cards, opt-in feature-split
const dense5 = Array.from({length: 5}, (_, i) => `- **F${i+1}** — desc`).join('\n');
if (modern.classifyModernArchetype({ title: 'Solusi & Nilai Tambah', content: dense5 }, 3, 9) !== 'feature-cards') { console.error('FAIL: classify dense generic solution -> feature-cards'); process.exit(1); }
if (modern.classifyModernArchetype({ title: 'Layanan Unggulan', content: Array.from({length: 6}, (_, i) => `- **F${i+1}** — desc`).join('\n') }, 3, 9) !== 'feature-cards') { console.error('FAIL: classify 6-bullet services -> feature-cards'); process.exit(1); }
if (modern.classifyModernArchetype({ title: 'WhatsApp AI Agent', content: '- **Cek tagihan** — tanya via chat' }, 4, 9) !== 'feature-split') { console.error('FAIL: classify WA narrative -> feature-split'); process.exit(1); }
if (modern.classifyModernArchetype({ title: 'Layanan Unggulan', content: '- **A** — x\n- **B** — y' }, 3, 9) !== 'services') { console.error('FAIL: classify sparse services stays services'); process.exit(1); }
const eco = modern.renderModernEcosystem({ title: 'Arsitektur & Ekosistem', content: '- **Groq** — chat copilot\n- **ComfyUI** — render lokal' }, brand, 4, '', 9);
if (!eco.includes('ecosystem-grid-split') || !eco.includes('Groq') || !eco.includes('<svg')) { console.error('FAIL: ecosystem'); process.exit(1); }

const met = modern.renderModernMetrics({ title: 'Pencapaian & Bukti', content: '- **~90%** margin kontribusi — setelah biaya cloud\n- **20:1** rasio LTV:CAC — ambang sehat' }, brand, 5, '', 9);
if (!met.includes('metrics-layout-grid') || !met.includes('~90%') || !met.includes('20:1')) { console.error('FAIL: metrics'); process.exit(1); }

const diff = modern.renderModernDifferentiator({ title: 'Mengapa Kami', content: 'Intro jujur\n\n| Aspek | Venturo Pro | SaaS Cloud |\n|---|---|---|\n| Biaya | Flat | Per-generasi |\n\n**Intinya:** butuh GPU 8 GB' }, brand, 6, '', 9);
if (!diff.includes('</table>') || !diff.includes('col-brand') || !diff.includes('Catatan Transparansi')) { console.error('FAIL: differentiator'); process.exit(1); }
const price = modern.renderModernPricing({ title: 'Paket & Kerjasama', content: 'Intro harga\n\n| Tier | Harga | Fitur |\n|---|---|---|\n| Lite | Rp0 | 5 video; watermark |\n| Pro | Rp99rb | unlimited; tanpa watermark |\n| Team | Rp299rb | 5 seat; support |' }, brand, 7, '', 9);
if (!price.includes('pricing-cards-grid') || !price.includes('Best Seller') || !price.includes('Rp99rb')) { console.error('FAIL: pricing'); process.exit(1); }

const close = modern.renderModernClosing({ title: 'Hubungi Kami', content: 'Mulai hari ini\n\n- WhatsApp: +62 812-0000-0000\n- Email: halo@venturo.pro' }, brand, 8, '', 9);
if (!close.includes('closing-3col-grid') || !close.includes('+62 812-0000-0000')) { console.error('FAIL: closing'); process.exit(1); }

const proof = modern.renderModernSocialProof({ title: 'Testimoni & Kepercayaan', content: '- **Budi, CTO** — "Memangkas waktu 60%"\n- **Siti, VP** — "Stabil dan intuitif"' }, brand, 7, '', 9);
if (!proof.includes('quote') || !proof.includes('Budi')) { console.error('FAIL: social-proof'); process.exit(1); }
console.log('PASS: modern hero/welcome/services render');
const feat = modern.renderFeatureCards({ title: 'Warga dan Iuran', content: 'Intro\n\n- **Hak Akses** — atur peran pengurus\n- **Bayar Iuran** — VA QRIS multibank\n- **Reminder** — notifikasi otomatis\n- **Laporan Kas** — grafik realtime' }, brand, 3, '', 9);
if (!feat.includes('feature-cards-grid') || !feat.includes('Hak Akses')) { console.error('FAIL: feature-cards'); process.exit(1); }
const split = modern.renderFeatureSplit({ title: 'WhatsApp AI Agent', content: '<!-- image: solution -- query: support agent; keywords: chat, ai, phone; style: photo -->\nUrusan beres lewat WA\n\n- **Cek tagihan** — tanya status via chat' }, brand, 4, '', 9);
if (!split.includes('feature-split') || !split.includes('WhatsApp AI Agent')) { console.error('FAIL: feature-split'); process.exit(1); }
console.log('PASS: feature-cards + feature-split render');
process.exit(0);
