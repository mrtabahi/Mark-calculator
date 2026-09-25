import './style.css';
import { calculate, DEFAULT_SHIFTS, formatMarks, type Result, type Shift } from './calculator';
import { supabase, supabaseConfigured } from './supabase';

const youtubeUrl = 'https://youtube.com/@decoding_hcm?si=xExH2PeEjsnDMRSD';
const telegramUrl = 'https://t.me/decoding_hcm';
const adsenseClient = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) || '';

let shifts: Shift[] = [...DEFAULT_SHIFTS];
let lastResults: Result[] = [];
let selectedMethod: 'method1' | 'method2' = 'method1';

const root = document.querySelector<HTMLDivElement>('#root')!;

function appTemplate() {
  root.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">D</div>
          <div>
            <div class="brand-name">DECODING HCM</div>
            <div class="brand-sub">BSF HCM Normalization Calculator</div>
          </div>
        </div>
        <div class="top-actions">
          <span class="status-dot"></span><span id="db-status">Calculator ready</span>
        </div>
      </header>

      <main class="container">
        <section class="hero card">
          <div class="hero-copy">
            <span class="eyebrow">UNOFFICIAL ESTIMATE TOOL</span>
            <h1>BSF HCM Shift Normalization Calculator</h1>
            <p>अपने raw marks डालें और नीचे सभी 6 shifts के estimated normalized marks देखें।</p>
          </div>
          <div class="watermark">DECODING HCM</div>
        </section>

        <section class="card input-card">
          <div class="section-head">
            <div>
              <h2>1. अपने Raw Marks डालें</h2>
              <p>उदाहरण: 80, 82.5, 90 आदि</p>
            </div>
            <span class="pill">6 Shifts</span>
          </div>
          <form id="calc-form" class="calc-form">
            <label for="rawMarks">Raw Marks</label>
            <div class="input-row">
              <input id="rawMarks" name="rawMarks" type="number" inputmode="decimal" min="0" max="200" step="0.01" placeholder="जैसे 80" required autocomplete="off" />
              <button type="submit" class="primary-btn">Calculate <span>→</span></button>
            </div>
            <div id="error" class="error" role="alert"></div>
          </form>
        </section>

        <section class="card method-card">
          <div class="section-head">
            <div>
              <h2>2. Result Method चुनें</h2>
              <p>दोनों methods एक ही calculation के नीचे compare कर सकते हैं।</p>
            </div>
          </div>
          <div class="method-tabs">
            <button class="method-tab active" data-method="method1">Method 1 · Formula</button>
            <button class="method-tab" data-method="method2">Method 2 · Easy Shift Adjusted</button>
          </div>
          <div id="method-explanation" class="formula-box"></div>
        </section>

        <section id="results-section" class="card results-card hidden">
          <div class="section-head result-head">
            <div>
              <span class="eyebrow">CALCULATION RESULT</span>
              <h2>Shift-wise Estimated Marks</h2>
            </div>
            <div class="raw-badge">Raw: <strong id="raw-display">—</strong></div>
          </div>
          <div id="results-grid" class="results-grid"></div>
          <div class="compare-note">
            <strong>Reference shift:</strong> 2 Sep · 3rd Shift is marked as the easy/reference shift for Method 2.
          </div>
          <button id="copy-btn" class="secondary-btn">Copy Result Summary</button>
        </section>

        <section class="card details-card">
          <div class="section-head">
            <div>
              <h2>Calculation Details</h2>
              <p>यह values आपकी दी हुई handwritten calculation/image से entered हैं।</p>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Shift</th><th>Tq</th><th>Sq</th><th>Reference</th></tr></thead>
              <tbody id="shift-table"></tbody>
            </table>
          </div>
        </section>

        <section class="card info-card">
          <h2>Formula</h2>
          <div class="formula-large">A = [12.96 ÷ (Tq − Sq)] × (B − Sq) + 76.54</div>
          <p><strong>B</strong> = आपका raw mark · <strong>Tq</strong> और <strong>Sq</strong> = selected shift के parameters.</p>
          <p class="small-note">Method 2 की implementation: पहले Method 1 निकाला जाता है, फिर 2 Sep 3rd Shift के raw-vs-normalized difference को सभी shifts के Method 1 result में समान रूप से add किया जाता है। इससे reference shift का Method 2 result raw mark के बराबर हो जाता है.</p>
        </section>

        <section class="ad-slot" aria-label="Advertisement">
          <span>Advertisement</span>
          <ins class="adsbygoogle" style="display:block" data-ad-format="auto" data-full-width-responsive="true"></ins>
        </section>

        <section class="card disclaimer">
          <strong>Important:</strong> यह Decoding HCM का unofficial calculation tool है। यह official BSF result/normalization notice नहीं है। Actual normalization/result के लिए BSF की official notice को final authority मानें।
        </section>
      </main>

      <footer class="footer">
        <div><strong>DECODING HCM</strong><br><span>BSF HCM preparation & educational resources</span></div>
        <div class="footer-links">
          <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer">Telegram Doubt Group</a>
          <a href="/privacy.html">Privacy Policy</a>
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
        </div>
        <div class="copyright">© ${new Date().getFullYear()} Decoding HCM · All rights reserved</div>
      </footer>
    </div>
  `;

  renderFormulaExplanation();
  renderShiftTable();
  bindEvents();
}

function renderFormulaExplanation() {
  const el = document.querySelector<HTMLDivElement>('#method-explanation')!;
  if (selectedMethod === 'method1') {
    el.innerHTML = `<div class="formula-line">A = [12.96 ÷ (Tq − Sq)] × (B − Sq) + 76.54</div><div class="formula-sub">यह आपकी image में दिया गया primary formula है।</div>`;
  } else {
    el.innerHTML = `<div class="formula-line">M2ᵢ = M1ᵢ + (B − M1<sub>easy</sub>)</div><div class="formula-sub">Easy/reference = 2 Sep, 3rd Shift. इसका उद्देश्य उस reference shift को raw marks के बराबर align करना है।</div>`;
  }
}

function renderShiftTable() {
  const body = document.querySelector<HTMLTableSectionElement>('#shift-table')!;
  body.innerHTML = shifts.map(s => `
    <tr class="${s.easy ? 'easy-row' : ''}">
      <td>${s.dateLabel}</td><td>${s.shiftLabel}</td><td>${s.tq}</td><td>${s.sq}</td><td>${s.easy ? '<span class="reference">Easy / Reference</span>' : '—'}</td>
    </tr>`).join('');
}

function renderResults(results: Result[], raw: number) {
  const section = document.querySelector('#results-section')!;
  section.classList.remove('hidden');
  document.querySelector('#raw-display')!.textContent = formatMarks(raw);
  const grid = document.querySelector<HTMLDivElement>('#results-grid')!;
  const valueKey = selectedMethod;
  grid.innerHTML = results.map(r => {
    const value = r[valueKey];
    return `<article class="result-item ${r.easy ? 'easy-card' : ''}">
      <div class="result-top"><span>${r.dateLabel}</span>${r.easy ? '<span class="easy-chip">EASY / REF</span>' : ''}</div>
      <div class="shift-title">${r.shiftLabel}</div>
      <div class="result-value">${formatMarks(value)}</div>
      <div class="result-meta">Tq ${r.tq} · Sq ${r.sq}</div>
    </article>`;
  }).join('');
}

async function saveCalculation(raw: number, results: Result[]) {
  if (!supabase) return;
  try {
    await supabase.from('calculation_logs').insert({
      raw_marks: raw,
      method1_results: results.map(r => ({ shift_id: r.id, value: r.method1 })),
      method2_results: results.map(r => ({ shift_id: r.id, value: r.method2 }))
    });
  } catch {
    // Logging is intentionally non-blocking; calculator works even if logging fails.
  }
}

function bindEvents() {
  document.querySelector<HTMLFormElement>('#calc-form')!.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>('#rawMarks')!;
    const error = document.querySelector<HTMLDivElement>('#error')!;
    const raw = Number(input.value);
    if (!Number.isFinite(raw) || raw < 0 || raw > 200) {
      error.textContent = 'कृपया 0 से 200 के बीच valid marks डालें।';
      return;
    }
    error.textContent = '';
    lastResults = calculate(raw, shifts);
    renderResults(lastResults, raw);
    await saveCalculation(raw, lastResults);
    document.querySelector('#results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll<HTMLButtonElement>('.method-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMethod = btn.dataset.method as 'method1' | 'method2';
      document.querySelectorAll('.method-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFormulaExplanation();
      const raw = Number((document.querySelector<HTMLInputElement>('#rawMarks')!).value);
      if (lastResults.length && Number.isFinite(raw)) renderResults(lastResults, raw);
    });
  });

  document.querySelector<HTMLButtonElement>('#copy-btn')!.addEventListener('click', async () => {
    const raw = document.querySelector<HTMLInputElement>('#rawMarks')!.value;
    const methodName = selectedMethod === 'method1' ? 'Method 1' : 'Method 2';
    const lines = lastResults.map(r => `${r.dateLabel} ${r.shiftLabel}: ${formatMarks(r[selectedMethod])}`).join('\n');
    const text = `Decoding HCM Normalization Calculator\nRaw Marks: ${raw}\n${methodName}\n${lines}\n\nUnofficial estimate — verify with official BSF notice.`;
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.querySelector<HTMLButtonElement>('#copy-btn')!;
      const old = btn.textContent;
      btn.textContent = 'Copied ✓';
      setTimeout(() => btn.textContent = old || 'Copy Result Summary', 1400);
    } catch {
      alert(text);
    }
  });
}

async function loadRemoteConfig() {
  const status = document.querySelector('#db-status');
  if (!supabase) {
    if (status) status.textContent = 'Demo data loaded';
    return;
  }
  const { data, error } = await supabase
    .from('normalization_shifts')
    .select('id,date_label,shift_label,tq,sq,easy,active,sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (!error && data && data.length >= 6) {
    shifts = data.map((r: any) => ({
      id: r.id,
      dateLabel: r.date_label,
      shiftLabel: r.shift_label,
      tq: Number(r.tq),
      sq: Number(r.sq),
      easy: Boolean(r.easy)
    }));
    renderShiftTable();
    if (status) status.textContent = 'Supabase connected';
  } else if (status) {
    status.textContent = 'Using built-in shift data';
  }
}

appTemplate();
loadRemoteConfig();

// AdSense is injected only after a real publisher client is supplied.
if (adsenseClient && !adsenseClient.includes('XXXXXXXX')) {
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`;
  document.head.appendChild(script);
  script.addEventListener('load', () => {
    try {
      // @ts-ignore Google AdSense global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  });
}
