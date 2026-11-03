import { pendingJob, setPending } from "./cache";

/**
 * Start-or-resume a paid job: reuse a pending id from an earlier (crashed) run, else start one and
 * record its id before polling. The id is cleared only once the result is safely on disk.
 */
export async function runJob<R>(
  deckDir: string,
  key: string,
  start: () => Promise<{ generation_id: string; estimated_cost_credits?: number | null }>,
  wait: (id: string) => Promise<R>,
  save: (r: R, id: string, credits: number | null) => Promise<void>,
): Promise<void> {
  let id = await pendingJob(deckDir, key);
  let credits: number | null = null;
  if (!id) {
    const job = await start();
    id = job.generation_id;
    credits = job.estimated_cost_credits ?? null;
    await setPending(deckDir, key, id);
  }
  const result = await wait(id);
  await save(result, id, credits);
  await setPending(deckDir, key, null);
}
