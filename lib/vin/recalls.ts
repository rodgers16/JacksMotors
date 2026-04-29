/**
 * NHTSA Recalls API — free, no key. Returns active safety recalls for a
 * given year/make/model triplet.
 *
 * Endpoint: https://api.nhtsa.gov/recalls/recallsByVehicle
 * Note: this looks up by year/make/model, not VIN. For VIN-specific recall
 * status NHTSA's vinRecall endpoint is more accurate; the bigger Recalls
 * dataset is used here for breadth.
 */

export type Recall = {
  /** NHTSA campaign number, e.g. "23V-321" */
  campaignNumber: string;
  /** Manufacturer's recall report received date (YYYY-MM-DD) */
  reportReceivedDate?: string;
  /** Component group, e.g. "AIR BAGS" */
  component?: string;
  /** Plain-language summary of the issue */
  summary?: string;
  /** Plain-language consequence — what could go wrong */
  consequence?: string;
  /** Plain-language remedy from manufacturer */
  remedy?: string;
};

type NhtsaRaw = {
  Campaign?: string;
  NHTSACampaignNumber?: string;
  ReportReceivedDate?: string;
  Component?: string;
  Summary?: string;
  Consequence?: string;
  Remedy?: string;
};
type NhtsaResp = { results?: NhtsaRaw[]; Count?: number };

export async function lookupRecalls(
  year: number,
  make: string,
  model: string
): Promise<Recall[]> {
  const params = new URLSearchParams({
    make,
    model,
    modelYear: String(year),
  });
  let json: NhtsaResp;
  try {
    const res = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    json = (await res.json()) as NhtsaResp;
  } catch {
    return [];
  }

  const results = json.results ?? [];
  return results.map((r) => ({
    campaignNumber: r.NHTSACampaignNumber ?? r.Campaign ?? "",
    reportReceivedDate: r.ReportReceivedDate,
    component: r.Component,
    summary: r.Summary,
    consequence: r.Consequence,
    remedy: r.Remedy,
  })).filter((r) => r.campaignNumber);
}
