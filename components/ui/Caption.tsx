import type { Work } from "@/data/types";
import { formatMeta } from "@/data/works";

export function Caption({ work }: { work: Work }) {
  return <p className="meta">{formatMeta(work)}</p>;
}
