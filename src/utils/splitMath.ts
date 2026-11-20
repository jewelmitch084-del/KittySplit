import type {
  Participant,
  PersonBreakdown,
  PersonItemLine,
  ReceiptData,
  SettlementTransfer,
  SplitSummary,
} from "../types/receipt";

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  MXN: "MX$",
  ARS: "AR$",
  COP: "CO$",
  CLP: "CL$",
  USD: "$",
  CAD: "CA$",
  AUD: "A$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  SGD: "S$",
  HKD: "HK$",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
}

export function formatMoney(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const isZeroDecimal = code === "JPY" || code === "KRW";
  const symbol = getCurrencySymbol(code);
  const abs = Math.abs(amount);
  const formatted = isZeroDecimal
    ? Math.round(abs).toLocaleString("en-US")
    : abs.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

function roundCents(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Distributes a dollar amount across participants proportionally by weights
 * while guaranteeing the sum of rounded cents equals the exact target amount.
 */
function distributeExactCents(totalAmount: number, weights: number[]): number[] {
  const count = weights.length;
  if (count === 0) return [];

  const totalCents = Math.round(totalAmount * 100);
  const weightSum = weights.reduce((acc, w) => acc + w, 0);

  if (weightSum <= 0) {
    const equalWeight = 1;
    const rawCents = weights.map(() => (totalCents * equalWeight) / count);
    const floors = rawCents.map((c) => Math.floor(c));
    let remainder = totalCents - floors.reduce((a, b) => a + b, 0);
    const result = [...floors];
    for (let i = 0; i < count && remainder !== 0; i++) {
      if (remainder > 0) {
        result[i] += 1;
        remainder -= 1;
      } else {
        result[i] -= 1;
        remainder += 1;
      }
    }
    return result.map((c) => c / 100);
  }

  const exactCents = weights.map((w) => (totalCents * w) / weightSum);
  const floors = exactCents.map((c) => Math.floor(c));
  const remainder = totalCents - floors.reduce((a, b) => a + b, 0);

  // Largest remainder method for penny fairness
  const rankedIndices = exactCents
    .map((val, idx) => ({ idx, frac: val - floors[idx] }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (let i = 0; i < Math.abs(remainder); i++) {
    const targetIdx = rankedIndices[i % count].idx;
    result[targetIdx] += remainder > 0 ? 1 : -1;
  }

  return result.map((c) => c / 100);
}

export function calculateSplit(
  receipt: ReceiptData,
  participants: Participant[]
): SplitSummary {
  const validParticipantIds = new Set(participants.map((p) => p.id));
  const subtotal = roundCents(
    receipt.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
  );

  const grandTotal = roundCents(
    Math.max(0, subtotal + receipt.tax + receipt.tip - receipt.discount)
  );

  const perPersonLines = new Map<string, PersonItemLine[]>();
  const perPersonSubtotals = new Map<string, number>();

  for (const p of participants) {
    perPersonLines.set(p.id, []);
    perPersonSubtotals.set(p.id, 0);
  }

  let assignedSubtotal = 0;
  let unassignedSubtotal = 0;
  let unassignedCount = 0;

  for (const item of receipt.items) {
    const price = Number(item.totalPrice) || 0;
    const assigned = item.assignedTo.filter((id) => validParticipantIds.has(id));

    if (assigned.length === 0) {
      unassignedSubtotal += price;
      unassignedCount += 1;
      continue;
    }

    assignedSubtotal += price;
    const splitWeights = assigned.map(() => 1);
    const shares = distributeExactCents(price, splitWeights);
    const ratioLabel = assigned.length === 1 ? "Full" : `1/${assigned.length}`;

    assigned.forEach((pid, idx) => {
      const shareAmt = shares[idx];
      perPersonSubtotals.set(pid, roundCents((perPersonSubtotals.get(pid) ?? 0) + shareAmt));
      perPersonLines.get(pid)?.push({
        itemId: item.id,
        itemName: item.name,
        shareRatio: ratioLabel,
        amount: shareAmt,
      });
    });
  }

  assignedSubtotal = roundCents(assignedSubtotal);
  unassignedSubtotal = roundCents(unassignedSubtotal);

  // Determine weights for Tax, Tip, and Discount
  const weights = participants.map((p) => {
    if (receipt.allocationMode === "equal") return 1;
    return perPersonSubtotals.get(p.id) ?? 0;
  });

  const anyAssigned = assignedSubtotal > 0;
  const activeMask = participants.map((p) =>
    receipt.allocationMode === "equal" ? 1 : (perPersonSubtotals.get(p.id) ?? 0)
  );
  const allocationWeights = anyAssigned ? weights : activeMask;

  // Allocate tax, tip, discount based on proportional or equal weights
  // If some items are unassigned in proportional mode, still show projected share of tax/tip on assigned items
  // OR scale proportionally across assigned people so assigned total reconciles cleanly when all items are assigned.
  const taxShares = distributeExactCents(receipt.tax, allocationWeights);
  const tipShares = distributeExactCents(receipt.tip, allocationWeights);
  const discountShares = distributeExactCents(receipt.discount, allocationWeights);

  const payer =
    participants.find((p) => p.id === receipt.payerId) ?? participants[0];

  const breakdowns: PersonBreakdown[] = participants.map((p, idx) => {
    const itemsSubtotal = perPersonSubtotals.get(p.id) ?? 0;
    const taxShare = taxShares[idx] ?? 0;
    const tipShare = tipShares[idx] ?? 0;
    const discountShare = discountShares[idx] ?? 0;
    const totalOwed = roundCents(
      Math.max(0, itemsSubtotal + taxShare + tipShare - discountShare)
    );

    return {
      participant: p,
      itemsSubtotal,
      taxShare,
      tipShare,
      discountShare,
      totalOwed,
      lines: perPersonLines.get(p.id) ?? [],
      isPayer: payer ? p.id === payer.id : false,
    };
  });

  const transfers: SettlementTransfer[] = [];
  if (payer) {
    for (const b of breakdowns) {
      if (b.participant.id !== payer.id && b.totalOwed > 0) {
        transfers.push({
          from: b.participant,
          to: payer,
          amount: b.totalOwed,
        });
      }
    }
  }

  return {
    subtotal,
    grandTotal,
    assignedSubtotal,
    unassignedSubtotal,
    unassignedCount,
    breakdowns,
    transfers,
  };
}

export function buildTextSummary(
  receipt: ReceiptData,
  summary: SplitSummary
): string {
  const payer = summary.breakdowns.find((b) => b.isPayer)?.participant;
  const lines: string[] = [
    `${receipt.merchantName || "Receipt Split"} (${receipt.date || "Today"})`,
    `Total: ${formatMoney(summary.grandTotal, receipt.currency)}`,
    payer ? `Paid by: ${payer.name}` : "",
    "",
  ];

  for (const b of summary.breakdowns) {
    if (b.totalOwed === 0 && b.lines.length === 0) continue;
    const status = b.isPayer ? " (Payer)" : "";
    lines.push(
      `${b.participant.name}${status}: ${formatMoney(b.totalOwed, receipt.currency)}`
    );
    for (const item of b.lines) {
      lines.push(
        `  - ${item.itemName} (${item.shareRatio}): ${formatMoney(
          item.amount,
          receipt.currency
        )}`
      );
    }
    if (b.taxShare > 0 || b.tipShare > 0) {
      lines.push(
        `  - Tax & Tip: ${formatMoney(b.taxShare + b.tipShare, receipt.currency)}`
      );
    }
  }

  if (summary.transfers.length > 0) {
    lines.push("");
    lines.push("Settlement:");
    for (const t of summary.transfers) {
      lines.push(
        `- ${t.from.name} owes ${t.to.name} ${formatMoney(t.amount, receipt.currency)}`
      );
    }
  }

  return lines.filter((l) => l !== undefined).join("\n");
}
