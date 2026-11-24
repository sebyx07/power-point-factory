// Opt-in audit for the two image-size advisories. This is not a general dependency audit.
export {};

type RecordValue = Record<string, unknown>;

function object(value: unknown, label: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw `Invalid ${label}`;
  return value as RecordValue;
}

function dependencies(value: unknown, label: string): string[] {
  const entry = object(value, label);
  const names = new Set<string>();
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    if (entry[field] === undefined) continue;
    const deps = object(entry[field], `${label}.${field}`);
    for (const [name, range] of Object.entries(deps)) {
      if (!name || typeof range !== "string" || !range) throw `Invalid dependency in ${label}`;
      names.add(name);
    }
  }
  return [...names];
}

function parentKey(key: string): string {
  return key.replace(/(?:^|\/)(?:@[^/]+\/)?[^/]+$/, "");
}

function audit(raw: unknown): string[] {
  const lock = object(raw, "lockfile");
  if (lock.lockfileVersion !== 2) throw "Unsupported lockfile version";
  const workspaces = object(lock.workspaces, "workspaces");
  if (!Object.hasOwn(workspaces, "")) throw "Missing root workspace";
  const packages = object(lock.packages, "packages");
  const entries = new Map<string, { name: string; version: string; deps: string[] }>();
  for (const [key, value] of Object.entries(packages)) {
    if (
      !/^(?:@[A-Za-z0-9._~!'()*-]+\/[A-Za-z0-9._~!'()*-]+|[A-Za-z0-9~!'()*-][A-Za-z0-9._~!'()*-]*)(?:\/(?:@[A-Za-z0-9._~!'()*-]+\/[A-Za-z0-9._~!'()*-]+|[A-Za-z0-9~!'()*-][A-Za-z0-9._~!'()*-]*))*$/.test(
        key,
      )
    ) {
      throw `Invalid package key ${key}`;
    }
    if (!Array.isArray(value) || value.length !== 4 || typeof value[0] !== "string" || typeof value[1] !== "string" || typeof value[3] !== "string") {
      throw `Invalid package ${key}`;
    }
    const match = /^((?:@[^/]+\/)?[^@/]+)@(.+)$/.exec(value[0]);
    if (!match) throw `Invalid package resolution ${key}`;
    const [, name, version] = match;
    if (!name || !version) throw `Invalid package resolution ${key}`;
    if (name === "image-size" && !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
      throw `Invalid image-size version ${version}`;
    }
    entries.set(key, { name, version, deps: dependencies(value[2], key) });
  }
  const resolve = (from: string, name: string): string => {
    let scope = from;
    while (true) {
      const candidate = scope ? `${scope}/${name}` : name;
      if (entries.has(candidate)) return candidate;
      if (!scope) throw `Unresolved dependency ${name} from ${from || "workspace"}`;
      const parent = parentKey(scope);
      if (parent.length >= scope.length) throw `Invalid package scope ${scope}`;
      scope = parent;
    }
  };
  const findings: string[] = [];
  const visited = new Set<string>();
  const visit = (key: string, path: string[]) => {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = entries.get(key);
    if (!entry) throw `Missing package ${key}`;
    const next = [...path, `${entry.name}@${entry.version}`];
    if (entry.name === "image-size" && (entry.version.includes("-") || Bun.semver.satisfies(entry.version, ">=0.6.3 <2.0.3"))) {
      findings.push(`${next.join(" -> ")}: GHSA-w3rx-r6r6-pgpr, GHSA-5p2g-fcmc-qvqq (check advisory ranges)`);
    }
    for (const name of entry.deps) visit(resolve(key, name), next);
  };
  for (const [workspace, value] of Object.entries(workspaces)) {
    for (const name of dependencies(value, `workspace ${workspace}`)) visit(resolve("", name), [workspace || "root"]);
  }
  // Audit all locked resolutions, even those not reachable from workspace declarations.
  for (const key of entries.keys()) visit(key, [`locked ${key}`]);
  return findings;
}

try {
  const lockPath = process.argv[2] ?? "bun.lock";
  const findings = audit(Bun.JSONC.parse(await Bun.file(lockPath).text()));
  if (findings.length) {
    console.error(findings.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("No affected image-size resolutions found for the audited advisories.");
  }
} catch (error) {
  console.error(`Dependency audit failed: ${String(error)}`);
  process.exitCode = 1;
}
