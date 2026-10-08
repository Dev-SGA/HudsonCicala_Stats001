import { BRAND } from "@/lib/brand";
import type { GameStats, PassResultBreakdown } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

type Tone = "blue" | "green" | "red" | "grey" | "warn" | "pass-progressive" | "pass-neutral" | "pass-lost";

const PHASE_LABEL: Record<Phase, string> = {
  "build-up": "Build-Up",
  defensive: "Defensive Phase",
};

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
  segments: { value: number; tone: Tone }[];
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

function PassResultAside({ title, breakdown }: { title: string; breakdown: PassResultBreakdown }) {
  const total = breakdown.progressive + breakdown.neutral + breakdown.lost;
  return (
    <div className="spdf-pass-block">
      <p className="spdf-pass-block__title">{title}</p>
      <StatTiles
        items={[
          {
            label: "Progressive",
            value: breakdown.progressive,
            tone: "pass-progressive",
            detail: `${pct(breakdown.progressive, total)}%`,
          },
          {
            label: "Neutral",
            value: breakdown.neutral,
            tone: "pass-neutral",
            detail: `${pct(breakdown.neutral, total)}%`,
          },
          {
            label: "Lost",
            value: breakdown.lost,
            tone: "pass-lost",
            detail: `${pct(breakdown.lost, total)}%`,
          },
        ]}
      />
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  aside,
  footer,
  layout = "default",
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
  layout?: "default" | "wide";
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}${layout === "wide" ? " spdf-section--wide" : ""}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{value}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
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

        <div className="spdf-grid spdf-grid--hudson">
          <Section
            phase="build-up"
            title="Passes Under Pressure"
            value={passTotal}
            unit="Total passes"
            aside={
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
            }
            footer={
              <RateBar
                label="Under pressure share"
                value={pct(passesUnderPressure.underPressure, passTotal)}
                note={`${passesUnderPressure.underPressure} of ${passTotal} passes under pressure`}
                segments={[
                  { value: passesUnderPressure.underPressure, tone: "warn" },
                  { value: passesUnderPressure.notUnderPressure, tone: "blue" },
                ]}
              />
            }
          />

          <Section
            phase="build-up"
            title="Possessions"
            value={possessions.total}
            unit="Total possessions"
            aside={
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
            }
          />

          <Section
            phase="build-up"
            title="Pass Results"
            value={passResults.underPressure.progressive + passResults.notUnderPressure.progressive}
            unit="Progressive (combined)"
            layout="wide"
            aside={
              <>
                <PassResultAside title="Under pressure" breakdown={passResults.underPressure} />
                <PassResultAside title="Not under pressure" breakdown={passResults.notUnderPressure} />
              </>
            }
          />
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
