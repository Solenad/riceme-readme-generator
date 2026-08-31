export interface InfoField {
  id: string;
  label: string;
  value: string;
  color: string;
  visible: boolean;
  placeholder?: string;
}

export const MAX_FIELDS = 16;

export const DEFAULT_FIELDS: InfoField[] = [
  {
    id: "distro",
    label: "Distro",
    value: "Windows 11",
    color: "#8bd5ca",
    visible: true,
    placeholder: "Windows 11",
  },
  {
    id: "host",
    label: "Host",
    value: "Solenad",
    color: "#eed49f",
    visible: true,
    placeholder: "Solenad",
  },
  {
    id: "uptime",
    label: "Uptime",
    value: "21 years",
    color: "#a6da95",
    visible: true,
    placeholder: "21 years",
  },
  {
    id: "kernel",
    label: "Kernel",
    value: "Software Developer Intern @ Siklab, Tech Lead @ LSCS",
    color: "#f5bde6",
    visible: true,
    placeholder: "Software Developer Intern...",
  },
  {
    id: "school",
    label: "School",
    value: "BS Computer Science @ De La Salle University Manila",
    color: "#8aadf4",
    visible: true,
    placeholder: "BS Computer Science...",
  },
  {
    id: "shell",
    label: "Shell",
    value: "PowerShell + WezTerm",
    color: "#c6a0f6",
    visible: true,
    placeholder: "PowerShell + WezTerm",
  },
  {
    id: "wm",
    label: "WM",
    value: "GlazeWM + Zebar",
    color: "#f5a97f",
    visible: true,
    placeholder: "GlazeWM + Zebar",
  },
  {
    id: "editor",
    label: "Editor",
    value: "Neovim",
    color: "#a6da95",
    visible: true,
    placeholder: "Neovim",
  },
  {
    id: "languages",
    label: "Languages",
    value: "C, Java, JavaScript, TypeScript, Python, R",
    color: "#91d7e3",
    visible: true,
    placeholder: "C, Java, JavaScript...",
  },
  {
    id: "stack",
    label: "Stack",
    value: "React, Next.js, Node.js, Express, Django",
    color: "#eed49f",
    visible: true,
    placeholder: "React, Next.js...",
  },
  {
    id: "db",
    label: "DB",
    value: "PostgreSQL, MySQL, MongoDB, Redis, SQLite",
    color: "#ee99a0",
    visible: true,
    placeholder: "PostgreSQL, MySQL...",
  },
  {
    id: "tools",
    label: "Tools",
    value: "Git, Docker, GitHub Actions, Contentful",
    color: "#b7bdf8",
    visible: true,
    placeholder: "Git, Docker...",
  },
  {
    id: "ai",
    label: "AI",
    value: "Opencode, Openspec",
    color: "#b7bdf8",
    visible: true,
    placeholder: "Opencode, Openspec",
  },
];

export function slugifyId(label: string, taken: Set<string>): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const candidate = base || "row";
  let id = candidate;
  let n = 2;
  while (taken.has(id)) {
    id = `${candidate}-${n}`;
    n++;
  }
  return id;
}

function resolveRow(
  id: string,
  params: URLSearchParams,
  palette: readonly string[],
  index: number,
  hasExplicitFields: boolean,
): InfoField {
  const def = DEFAULT_FIELDS.find((f) => f.id === id);
  const rawValue = params.get(id);
  const value =
    rawValue !== null ? rawValue : hasExplicitFields ? "" : (def?.value ?? "");
  const label = params.get(`${id}_label`) ?? def?.label ?? id;
  const color =
    params.get(`${id}_color`) ?? def?.color ?? palette[index % palette.length];
  return {
    id,
    label,
    value,
    color,
    visible: params.get(`${id}_hide`) !== "1",
  };
}

export function parseFields(
  params: URLSearchParams,
  palette: readonly string[],
): InfoField[] {
  const idsParam = params.get("f");

  if (idsParam === null) {
    return DEFAULT_FIELDS.map((f, i) => ({
      id: f.id,
      label: params.get(`${f.id}_label`) ?? f.id,
      value: params.get(f.id) ?? f.value,
      color: params.get(`${f.id}_color`) ?? palette[i % palette.length],
      visible: params.get(`${f.id}_hide`) !== "1",
    }));
  }

  const hasExplicitFields = true;
  return idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_FIELDS)
    .map((id, i) => resolveRow(id, params, palette, i, hasExplicitFields));
}

export function serializeFields(fields: InfoField[]): URLSearchParams {
  const params = new URLSearchParams();
  params.set("f", fields.map((f) => f.id).join(","));
  for (const field of fields) {
    params.set(field.id, field.value);
    params.set(`${field.id}_label`, field.label);
    params.set(`${field.id}_color`, field.color);
    if (!field.visible) params.set(`${field.id}_hide`, "1");
  }
  return params;
}

export function addRowToFields(fields: InfoField[]): InfoField[] {
  if (fields.length >= MAX_FIELDS) return fields;
  const id = slugifyId("", new Set(fields.map((f) => f.id)));
  const palette = ["#8bd5ca", "#eed49f", "#a6da95", "#f5bde6", "#8aadf4", "#c6a0f6", "#f5a97f", "#91d7e3"];
  const color = palette[fields.length % palette.length];
  return [
    ...fields,
    { id, label: "", value: "", color, visible: true, placeholder: "Value" },
  ];
}

export function removeRowFromFields(
  fields: InfoField[],
  id: string,
): InfoField[] {
  return fields.filter((f) => f.id !== id);
}

export function moveRowInFields(
  fields: InfoField[],
  id: string,
  dir: -1 | 1,
): InfoField[] {
  const idx = fields.findIndex((f) => f.id === id);
  const target = idx + dir;
  if (idx === -1 || target < 0 || target >= fields.length) return fields;
  const next = [...fields];
  [next[idx], next[target]] = [next[target], next[idx]];
  return next;
}

export function duplicateRowInFields(
  fields: InfoField[],
  id: string,
): InfoField[] {
  const idx = fields.findIndex((f) => f.id === id);
  if (idx === -1 || fields.length >= MAX_FIELDS) return fields;
  const source = fields[idx];
  const copyId = slugifyId(source.label, new Set(fields.map((f) => f.id)));
  const next = [...fields];
  next.splice(idx + 1, 0, { ...source, id: copyId });
  return next;
}

export function toggleRowVisibility(
  fields: InfoField[],
  id: string,
): InfoField[] {
  return fields.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f));
}

export function resetFieldsToDefaults(): InfoField[] {
  return [
    { id: "distro", label: "", value: "", color: DEFAULT_FIELDS[0].color, visible: true, placeholder: "Value" },
    { id: "host", label: "", value: "", color: DEFAULT_FIELDS[1].color, visible: true, placeholder: "Value" },
  ];
}
