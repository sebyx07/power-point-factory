import { CommandError } from "@/core/errors";

/** ALL subprocesses go through here: captured output, exit code checked, timeout enforced. */
export async function run(cmd: string[], opts: { cwd?: string; timeoutMs?: number } = {}): Promise<string> {
  const proc = Bun.spawn(cmd, { ...(opts.cwd ? { cwd: opts.cwd } : {}), stdout: "pipe", stderr: "pipe" });
  const timer = setTimeout(() => proc.kill("SIGKILL"), opts.timeoutMs ?? 120_000);
  const [out, err, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  clearTimeout(timer);
  if (code !== 0) throw new CommandError(`${cmd[0]} exited ${code}: ${(err || out).trim().slice(0, 500)}`, `ran: ${cmd.join(" ")}`);
  return out;
}
