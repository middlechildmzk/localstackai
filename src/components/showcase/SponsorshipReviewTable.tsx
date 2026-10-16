"use client";

import { useState } from "react";
import { Check, X, ExternalLink, Loader2, Ban } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { SponsorshipWithTool, SponsorshipPaymentStatus } from "./tiers";

const PAYMENT_LABELS: Record<SponsorshipPaymentStatus, { label: string; className: string }> = {
  unpaid: { label: "Awaiting payment", className: "text-zinc-500" },
  paid: { label: "Paid — awaiting approval", className: "text-amber-400" },
  expired: { label: "Payment expired", className: "text-zinc-600" },
  refunded: { label: "Refunded", className: "text-zinc-600" },
};

function statusOf(s: SponsorshipWithTool): string {
  const now = Date.now();
  if (s.is_active && new Date(s.ends_at).getTime() > now) return "live";
  if (s.is_active) return "expired-window";
  if (s.payment_status === "paid") return "pending-approval";
  return "pending-payment";
}

/**
 * Admin review table for paid sponsorships. Approve/reject/expire call server
 * actions defined in src/app/admin/sponsorships/page.tsx — the ONLY code
 * paths allowed to set is_active=true (approve) or false (reject/expire).
 * The Stripe webhook can mark payment_status='paid' but can never activate.
 */
export function SponsorshipReviewTable({
  sponsorships,
  onApprove,
  onReject,
  onExpire,
}: {
  sponsorships: SponsorshipWithTool[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onExpire: (id: string) => Promise<void>;
}) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(id: string, action: (id: string) => Promise<void>) {
    setProcessing(id);
    setError(null);
    try {
      await action(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
    setProcessing(null);
  }

  const pending = sponsorships.filter((s) => statusOf(s) === "pending-approval");
  const awaitingPayment = sponsorships.filter((s) => statusOf(s) === "pending-payment");
  const live = sponsorships.filter((s) => statusOf(s) === "live");
  const done = sponsorships.filter((s) => ["expired-window"].includes(statusOf(s)));

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5" role="alert">
          {error}
        </p>
      )}

      <QueueSection
        title={`Pending approval (${pending.length})`}
        emptyText="No paid sponsorships awaiting approval."
      >
        {pending.map((s) => (
          <Row
            key={s.id}
            s={s}
            processing={processing}
            actions={
              <>
                <ActionButton
                  title="Approve — goes live now"
                  onClick={() => run(s.id, onApprove)}
                  className="bg-brand-600/20 text-brand-400 hover:bg-brand-600/30"
                >
                  <Check size={14} />
                </ActionButton>
                <ActionButton
                  title="Reject — never goes live"
                  onClick={() => run(s.id, onReject)}
                  className="bg-red-600/20 text-red-400 hover:bg-red-600/30"
                >
                  <X size={14} />
                </ActionButton>
              </>
            }
          />
        ))}
      </QueueSection>

      <QueueSection
        title={`Live (${live.length})`}
        emptyText="No live sponsorships."
      >
        {live.map((s) => (
          <Row
            key={s.id}
            s={s}
            processing={processing}
            actions={
              <ActionButton
                title="Expire now — removes from slots immediately"
                onClick={() => run(s.id, onExpire)}
                className="bg-zinc-600/20 text-zinc-400 hover:bg-zinc-600/30"
              >
                <Ban size={14} />
              </ActionButton>
            }
          />
        ))}
      </QueueSection>

      <QueueSection
        title={`Awaiting payment (${awaitingPayment.length})`}
        emptyText="No unpaid checkouts."
      >
        {awaitingPayment.map((s) => (
          <Row key={s.id} s={s} processing={processing} actions={null} dimmed />
        ))}
      </QueueSection>

      {done.length > 0 && (
        <QueueSection
          title={`Ended (${done.length})`}
          emptyText=""
        >
          {done.slice(0, 20).map((s) => (
            <Row key={s.id} s={s} processing={processing} actions={null} dimmed />
          ))}
        </QueueSection>
      )}
    </div>
  );
}

function QueueSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <div className="space-y-2">
        {children}
        {emptyText && <p className="text-zinc-600 text-sm">{emptyText}</p>}
      </div>
    </div>
  );
}

function Row({
  s,
  processing,
  actions,
  dimmed,
}: {
  s: SponsorshipWithTool;
  processing: string | null;
  actions: React.ReactNode;
  dimmed?: boolean;
}) {
  const payment = PAYMENT_LABELS[s.payment_status];
  return (
    <div className={`glass p-4 flex items-start gap-4 ${dimmed ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-white text-sm">
            {s.tool?.name ?? "Unknown tool"}
          </span>
          {s.tool && (
            <a
              href={`/tools/${s.tool.slug}`}
              target="_blank"
              rel="noopener"
              className="text-zinc-600 hover:text-brand-400 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <span className="badge badge-sponsored">Sponsored</span>
          <span className={`text-xs font-medium ${payment.className}`}>{payment.label}</span>
        </div>
        <p className="text-xs text-zinc-500">
          {s.placement} · ${s.amount_usd ?? "?"} · {timeAgo(s.created_at)}
          {s.paid_at && ` · paid ${timeAgo(s.paid_at)}`}
        </p>
        <p className="text-xs text-zinc-700 mt-0.5 font-mono truncate" title={s.id}>
          {s.id}
          {s.stripe_session_id && ` · session ${s.stripe_session_id.slice(0, 24)}…`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {processing === s.id ? (
          <Loader2 size={14} className="animate-spin text-zinc-500" />
        ) : (
          actions
        )}
      </div>
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
