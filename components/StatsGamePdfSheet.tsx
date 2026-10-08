import { BRAND } from "@/lib/brand";
import type { GameStats, PassResultBreakdown } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Tone = "blue" | "red" | "warn" | "pass-progressive" | "pass-neutral" | "pass-lost";

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function StatTiles({
  items,
}: {
  items: { label: string; value: number; tone?: Tone; detail?: string; emphasizeDetail?: boolean }[];
}) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className={`spdf-stat${item.emphasizeDetail ? " spdf-stat--emphasis" : ""}`}>
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
          <span className="spdf-stat__label">{item.label}</span>
          {item.detail ? (
            <span className={`spdf-stat__detail${item.emphasizeDetail ? " spdf-stat__detail--emphasis" : ""}`}>{item.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function RateBar({
  label,
  value,
  note,
  segments,
}: {
  label: string;
  value: number;
  note: string;
  segments: { value: number; tone: "warn" | "blue" }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="spdf-rate">
      <div className="spdf-rate__head">
        <span className="spdf-rate__label">{label}</span>
        <span className="spdf-rate__value">{value}%</span>
      </div>
      <div className="spdf-rate__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-rate__seg spdf-rate__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <p className="spdf-rate__note">{note}</p>
    </div>
  );
}

function PassResultPanel({ title, breakdown }: { title: string; breakdown: PassResultBreakdown }) {
  const total = breakdown.progressive + breakdown.neutral + breakdown.lost;
  const segments = [
    { value: breakdown.progressive, tone: "pass-progressive" as const },
    { value: breakdown.neutral, tone: "pass-neutral" as const },
    { value: breakdown.lost, tone: "pass-lost" as const },
  ];

  return (
    <div className="spdf-pass-panel">
      <div className="spdf-pass-panel__head">
        <p className="spdf-pass-panel__title">{title}</p>
        <span className="spdf-pass-panel__total">{total} passes</span>
      </div>
      <div className="spdf-pass-panel__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-pass-panel__seg spdf-pass-panel__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="spdf-pass-panel__legend">
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-progressive" />
          <span className="spdf-pass-panel__legend-label">Progressive</span>
          <strong>
            {breakdown.progressive} · {pct(breakdown.progressive, total)}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-neutral" />
          <span className="spdf-pass-panel__legend-label">Neutral</span>
          <strong>
            {breakdown.neutral} · {pct(breakdown.neutral, total)}%
          </strong>
        </li>
        <li>
          <span className="spdf-pass-panel__dot spdf-pass-panel__dot--pass-lost" />
          <span className="spdf-pass-panel__legend-label">Lost</span>
          <strong>
            {breakdown.lost} · {pct(breakdown.lost, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function PdfSection({
  title,
  kpi,
  unit,
  children,
  footer,
  size = "md",
}: {
  title: string;
  kpi: number;
  unit: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <section className={`spdf-section spdf-section--build-up spdf-section--${size}`}>
      <div className="spdf-section__top">
        <p className="spdf-section__phase">Build-Up</p>
        <h3 className="spdf-section__title">{title}</h3>
      </div>
      <div className="spdf-section__content">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{kpi}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__panel">{children}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, passesUnderPressure, passResults, possessions } = stats;
  const passTotal = passesUnderPressure.total;

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-stack">
          <PdfSection
            title="Passes Under Pressure vs Not"
            kpi={passTotal}
            unit="Total passes"
            footer={
              <RateBar
                label="Under pressure share"
                value={pct(passesUnderPressure.underPressure, passTotal)}
                note={`${passesUnderPressure.underPressure} of ${passTotal} under pressure`}
                segments={[
                  { value: passesUnderPressure.underPressure, tone: "warn" },
                  { value: passesUnderPressure.notUnderPressure, tone: "blue" },
                ]}
              />
            }
          >
            <StatTiles
              items={[
                {
                  label: "Under pressure",
                  value: passesUnderPressure.underPressure,
                  tone: "warn",
                  detail: `${pct(passesUnderPressure.underPressure, passTotal)}%`,
                },
                {
                  label: "Not under pressure",
                  value: passesUnderPressure.notUnderPressure,
                  tone: "blue",
                  detail: `${pct(passesUnderPressure.notUnderPressure, passTotal)}%`,
                },
              ]}
            />
          </PdfSection>

          <PdfSection title="Possessions" kpi={possessions.total} unit="Total possessions">
            <StatTiles
              items={[
                {
                  label: "Lost balls",
                  value: possessions.lostBalls,
                  tone: "red",
                  detail: `${pct(possessions.lostBalls, possessions.total)}%`,
                },
                {
                  label: "Wrong passes",
                  value: possessions.wrongPasses,
                  tone: "warn",
                  detail: `${pct(possessions.wrongPasses, possessions.total)}%`,
                },
                {
                  label: "Turnovers",
                  value: possessions.turnovers,
                  tone: "blue",
                  detail: `${pct(possessions.turnovers, possessions.total)}%`,
                  emphasizeDetail: true,
                },
              ]}
            />
          </PdfSection>

          <PdfSection title="Pass Results" kpi={passTotal} unit="Passes" size="lg">
            <div className="spdf-pass-row">
              <PassResultPanel title="Under pressure" breakdown={passResults.underPressure} />
              <PassResultPanel title="Not under pressure" breakdown={passResults.notUnderPressure} />
            </div>
          </PdfSection>
        </div>

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
