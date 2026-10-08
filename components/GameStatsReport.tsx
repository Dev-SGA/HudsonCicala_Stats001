"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats, PassResultBreakdown } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted" | "warn";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <span className="legend__label">{primaryLabel}</span>
          <strong>
            {primary} · {percent(primary, total)}%
          </strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>
            {secondary} · {percent(secondary, total)}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function PassResultsMeter({ title, breakdown }: { title: string; breakdown: PassResultBreakdown }) {
  const total = breakdown.progressive + breakdown.neutral + breakdown.lost;
  const progressivePct = percent(breakdown.progressive, total);
  const neutralPct = percent(breakdown.neutral, total);
  const lostPct = percent(breakdown.lost, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{total} passes</p>
      <div
        className="meter"
        role="img"
        aria-label={`Progressive: ${breakdown.progressive}. Neutral: ${breakdown.neutral}. Lost: ${breakdown.lost}.`}
      >
        <span className="meter__seg meter__seg--positive" style={{ width: `${progressivePct}%` }} />
        <span className="meter__seg meter__seg--accent" style={{ width: `${neutralPct}%` }} />
        <span className="meter__seg meter__seg--negative" style={{ width: `${lostPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className="legend__dot legend__dot--positive" />
          <span className="legend__label">Progressive plays</span>
          <strong>
            {breakdown.progressive} · {progressivePct}%
          </strong>
        </li>
        <li>
          <span className="legend__dot legend__dot--accent" />
          <span className="legend__label">Neutral plays</span>
          <strong>
            {breakdown.neutral} · {neutralPct}%
          </strong>
        </li>
        <li>
          <span className="legend__dot legend__dot--negative" />
          <span className="legend__label">Lost plays</span>
          <strong>
            {breakdown.lost} · {lostPct}%
          </strong>
        </li>
      </ul>
    </div>
  );
}

function PossessionStat({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: BarTone;
}) {
  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{label}</h3>
      <span className="metric-card__value">{value}</span>
      <span className="metric-card__pct">{percent(value, total)}% of possessions</span>
      <div className="meter meter--thin" role="presentation">
        <span className={`meter__seg meter__seg--${tone}`} style={{ width: `${percent(value, total)}%` }} />
      </div>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, passesUnderPressure, passResults, possessions, meta } = stats;

  const topics: Topic[] = [
    {
      id: "passes-pressure",
      title: "Passes Under Pressure vs Not",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="total" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Total passes</h3>
                <span className="metric-card__value">{passesUnderPressure.total}</span>
                <p className="metric-card__caption">Passes tracked in the match</p>
              </div>,
              <SplitMeter
                key="split"
                title="Pressure context"
                headline={`${passesUnderPressure.underPressure} under pressure · ${passesUnderPressure.notUnderPressure} not under pressure`}
                primary={passesUnderPressure.underPressure}
                secondary={passesUnderPressure.notUnderPressure}
                primaryLabel="Under pressure"
                secondaryLabel="Not under pressure"
                primaryTone="warn"
                secondaryTone="accent"
              />,
            ]}
          />
          <ClipLinks scope="passesPressure" />
        </>
      ),
    },
    {
      id: "pass-results",
      title: "Pass Results",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <PassResultsMeter key="up" title="Under pressure" breakdown={passResults.underPressure} />,
              <PassResultsMeter key="nop" title="Not under pressure" breakdown={passResults.notUnderPressure} />,
            ]}
          />
          <ClipLinks scope="passResults" />
        </>
      ),
    },
    {
      id: "possessions",
      title: "Possessions",
      phase: "build-up",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <h3 className="metric-card__title">Total possessions</h3>
            <span className="metric-card__value">{possessions.total}</span>
            <p className="metric-card__caption">Ball possessions in the match</p>
          </div>
          <MetricFlow
            items={[
              <PossessionStat key="lb" label="Lost balls" value={possessions.lostBalls} total={possessions.total} tone="negative" />,
              <PossessionStat
                key="wp"
                label="Wrong passes"
                value={possessions.wrongPasses}
                total={possessions.total}
                tone="warn"
              />,
              <PossessionStat key="to" label="Turnovers" value={possessions.turnovers} total={possessions.total} tone="muted" />,
            ]}
          />
          <ClipLinks scope="possessions" />
        </>
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialPassesUnderPressureVideoLink={passesUnderPressure.videoLink}
      initialPassResultsVideoLink={passResults.videoLink}
      initialPossessionsVideoLink={possessions.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <TopicsBoard topics={topics} />
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
