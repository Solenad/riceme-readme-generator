"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";
import { lzStringEncode } from "@/lib/compress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEMES, DEFAULT_THEME } from "@/lib/themes";
import {
  DEFAULT_FIELDS,
  MAX_FIELDS,
  addRowToFields,
  duplicateRowInFields,
  moveRowInFields,
  removeRowFromFields,
  resetFieldsToDefaults,
  serializeFields,
  toggleRowVisibility,
  type InfoField,
} from "@/lib/fields";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

function yearsSince(dateStr: string): string {
  const created = new Date(dateStr);
  const now = new Date();
  let years = now.getFullYear() - created.getFullYear();
  const m = now.getMonth() - created.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < created.getDate())) years--;
  return `${Math.max(1, years)} years on GitHub`;
}

async function fetchProfile(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { "User-Agent": "RiceMe" },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("User not found on GitHub");
    if (res.status === 403)
      throw new Error("Rate limited by GitHub. Try again later.");
    throw new Error(`GitHub API error (${res.status})`);
  }
  return res.json();
}

function mapProfileToFields(
  profile: Record<string, unknown>,
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (typeof profile.name === "string" && profile.name)
    fields.host = profile.name;
  if (typeof profile.bio === "string" && profile.bio)
    fields.kernel = profile.bio;
  if (typeof profile.company === "string" && profile.company)
    fields.school = profile.company;
  if (typeof profile.location === "string" && profile.location)
    fields.distro = profile.location;
  if (typeof profile.created_at === "string" && profile.created_at) {
    fields.uptime = yearsSince(profile.created_at);
  }
  return fields;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const builderContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.15 },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const fieldGrid = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const fieldItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

const snippetContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const snippetItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function ReadmeBuilder() {
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [fetchTarget, setFetchTarget] = useState<string | null>(null);
  const [fields, setFields] = useState<InfoField[]>(() =>
    DEFAULT_FIELDS.map((f) => ({ ...f, value: "" })),
  );
  const [showAscii, setShowAscii] = useState(true);
  const [showCrt, setShowCrt] = useState(true);
  const [customAscii, setCustomAscii] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [compressedAscii, setCompressedAscii] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileQuery = useQuery({
    queryKey: ["github-profile", fetchTarget],
    queryFn: () => fetchProfile(fetchTarget!),
    enabled: !!fetchTarget,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    meta: { errorMessage: "Failed to fetch profile" },
  });

  useEffect(() => {
    if (profileQuery.data) {
      const mapped = mapProfileToFields(profileQuery.data);
      setFields((prev) =>
        prev.map((f) =>
          mapped[f.id] !== undefined ? { ...f, value: mapped[f.id] } : f,
        ),
      );
      toast.success(`Fetched profile for ${fetchTarget}`, { duration: 2000 });
    }
  }, [profileQuery.data, fetchTarget]);

  useEffect(() => {
    if (profileQuery.error) {
      toast.error(profileQuery.error.message, { duration: 4000 });
    }
  }, [profileQuery.error]);

  const debouncedFields = useDebounce(fields, 500);
  const debouncedUsername = useDebounce(username, 500);
  const debouncedAscii = useDebounce(customAscii, 500);
  const debouncedTheme = useDebounce(selectedTheme, 200);

  // Compress ASCII art asynchronously — result feeds into buildPreviewUrl
  useEffect(() => {
    let cancelled = false;
    if (!debouncedAscii) {
      setCompressedAscii("");
      return;
    }
    const encoded = lzStringEncode(debouncedAscii);
    if (!cancelled) setCompressedAscii(encoded);
    return () => {
      cancelled = true;
    };
  }, [debouncedAscii]);

  const previewUrl = buildPreviewUrl(
    origin,
    debouncedUsername,
    debouncedFields,
    showAscii,
    debouncedAscii,
    showCrt,
    debouncedTheme,
    compressedAscii,
  );

  const updateRow = useCallback(
    (id: string, patch: Partial<Omit<InfoField, "id">>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      );
    },
    [],
  );

  const addRow = useCallback(() => {
    setFields((prev) => addRowToFields(prev));
  }, []);

  const removeRow = useCallback((id: string) => {
    setFields((prev) => removeRowFromFields(prev, id));
  }, []);

  const moveRow = useCallback((id: string, dir: -1 | 1) => {
    setFields((prev) => moveRowInFields(prev, id, dir));
  }, []);

  const duplicateRow = useCallback((id: string) => {
    setFields((prev) => duplicateRowInFields(prev, id));
  }, []);

  const toggleVisible = useCallback((id: string) => {
    setFields((prev) => toggleRowVisibility(prev, id));
  }, []);

  const resetFields = useCallback(() => {
    setFields(resetFieldsToDefaults());
  }, []);

  const handleFetch = useCallback(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error("Enter a GitHub username first");
      return;
    }
    setFetchTarget(trimmed);
  }, [username]);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
      },
      () => toast.error("Failed to copy"),
    );
  }, []);

  const fullUrl = buildPreviewUrl(
    origin,
    username,
    fields,
    showAscii,
    customAscii,
    showCrt,
    selectedTheme,
    compressedAscii,
  );
  const markdown = `![${username}](${fullUrl})`;
  const html = `<p align="center">\n  <img src="${fullUrl}" alt="${username}" />\n</p>`;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleFetch();
    },
    [handleFetch],
  );

  return (
    <motion.div
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      variants={builderContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="space-y-6" variants={slideLeft}>
        <div>
          <div className="mb-4 flex items-end gap-3">
            <div className="flex-1">
              <Label
                htmlFor="gh-username"
                className="mb-1.5 block text-xs text-muted-foreground"
              >
                GitHub Username
              </Label>
              <Input
                id="gh-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Solenad"
                className="font-mono placeholder:text-muted-foreground/30"
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={profileQuery.isFetching}
              variant="default"
              className="shrink-0"
            >
              {profileQuery.isFetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Fetching...
                </span>
              ) : (
                "Fetch Profile"
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="ascii-toggle"
              checked={showAscii}
              onCheckedChange={setShowAscii}
            />
            <Label
              htmlFor="ascii-toggle"
              className="text-xs text-muted-foreground"
            >
              Show ASCII art
            </Label>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Switch
              id="crt-toggle"
              checked={showCrt}
              onCheckedChange={setShowCrt}
            />
            <Label
              htmlFor="crt-toggle"
              className="text-xs text-muted-foreground"
            >
              CRT effect
            </Label>
          </div>
          <div className="mt-3">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Theme
            </Label>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["light", "warm-dark", "deep-dark", "cool-dark"] as const
                ).map((cat) => {
                  const catLabel =
                    cat === "warm-dark"
                      ? "Warm Dark"
                      : cat === "deep-dark"
                        ? "Deep Dark"
                        : cat === "cool-dark"
                          ? "Cool Dark"
                          : "Light";
                  const grouped = THEMES.filter((t) => t.category === cat);
                  return (
                    <SelectGroup key={cat}>
                      <SelectLabel>{catLabel}</SelectLabel>
                      {grouped.map((t) => (
                        <SelectItem
                          key={t.name}
                          value={t.name}
                          className="font-mono text-xs"
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex overflow-hidden rounded">
                              {[t.bg, t.card, t.ascii, t.host, t.fg].map(
                                (c, i) => (
                                  <span
                                    key={i}
                                    className="inline-block h-4 w-3"
                                    style={{ backgroundColor: c }}
                                  />
                                ),
                              )}
                            </span>
                            {t.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {showAscii && (
            <div className="mt-3">
              <Label
                htmlFor="ascii-art"
                className="mb-1 block text-xs text-muted-foreground"
              >
                Custom ASCII art <br /> (add whitespace above the art as needed)
              </Label>
              <Textarea
                id="ascii-art"
                value={customAscii}
                onChange={(e) => setCustomAscii(e.target.value)}
                placeholder="Paste your ASCII art here..."
                className="max-h-48 min-h-[80px] font-mono text-xs leading-tight placeholder:text-muted-foreground/30"
              />
            </div>
          )}
        </div>

        <motion.div className="space-y-3" variants={fieldGrid} initial="hidden" animate="show">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Info rows{" "}
              <span className="font-mono">
                ({fields.length}/{MAX_FIELDS})
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                onClick={resetFields}
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button
                onClick={addRow}
                disabled={fields.length >= MAX_FIELDS}
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add row
              </Button>
            </div>
          </div>
          <motion.div
            className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2"
            variants={fieldGrid}
            initial="hidden"
            animate="show"
          >
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                variants={fieldItem}
                className="rounded-md border border-border/60 bg-card/40 p-2"
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <input
                    type="color"
                    value={field.color}
                    onChange={(e) =>
                      updateRow(field.id, { color: e.target.value })
                    }
                    title="Label color"
                    aria-label={`Color for ${field.id}`}
                    className="h-5 w-6 shrink-0 cursor-pointer rounded border-none bg-transparent p-0"
                  />
                  <Input
                    value={field.label}
                    maxLength={32}
                    onChange={(e) =>
                      updateRow(field.id, { label: e.target.value })
                    }
                    placeholder="Label"
                    aria-label={`Label for ${field.id}`}
                    className="h-7 flex-1 font-mono text-xs placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    value={field.value}
                    onChange={(e) =>
                      updateRow(field.id, { value: e.target.value })
                    }
                    placeholder={field.placeholder ?? "Value"}
                    className="h-8 flex-1 font-mono text-xs placeholder:text-muted-foreground/30"
                  />
                  <div className="flex shrink-0 items-center gap-0.5">
                    <RowIconButton
                      onClick={() => moveRow(field.id, -1)}
                      disabled={index === 0}
                      label="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </RowIconButton>
                    <RowIconButton
                      onClick={() => moveRow(field.id, 1)}
                      disabled={index === fields.length - 1}
                      label="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </RowIconButton>
                    <RowIconButton
                      onClick={() => toggleVisible(field.id)}
                      label={field.visible ? "Hide row" : "Show row"}
                    >
                      {field.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </RowIconButton>
                    <RowIconButton
                      onClick={() => duplicateRow(field.id)}
                      disabled={fields.length >= MAX_FIELDS}
                      label="Duplicate row"
                    >
                      <Copy className="h-3 w-3" />
                    </RowIconButton>
                    <RowIconButton
                      onClick={() => removeRow(field.id)}
                      label="Delete row"
                      className="hover:text-term-red"
                    >
                      <Trash2 className="h-3 w-3" />
                    </RowIconButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="space-y-6" variants={slideRight}>
        <div className="overflow-hidden rounded-lg border border-border bg-card/40 p-2">
          <img
            src={previewUrl}
            alt="README card preview"
            className="block w-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0.5";
            }}
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.opacity = "1";
            }}
          />
        </div>

        <motion.div
          className="space-y-3"
          variants={snippetContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={snippetItem}>
            <Snippet
              label="Markdown"
              value={markdown}
              copied={copiedKey === "md"}
              onCopy={() => copy(markdown, "md")}
            />
          </motion.div>
          <motion.div variants={snippetItem}>
            <Snippet
              label="HTML (centered, for GitHub profile README)"
              value={html}
              copied={copiedKey === "html"}
              onCopy={() => copy(html, "html")}
            />
          </motion.div>
          <motion.div variants={snippetItem}>
            <Snippet
              label="Direct image URL"
              value={fullUrl}
              copied={copiedKey === "url"}
              onCopy={() => copy(fullUrl, "url")}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Snippet({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="cursor-pointer rounded border border-border bg-card px-2 py-1 font-bold text-term-green hover:border-term-green/60 hover:bg-card/80 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-card/60 p-3 text-xs text-foreground/90">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function RowIconButton({
  onClick,
  disabled,
  label,
  children,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-border/60 bg-card/50 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function buildPreviewUrl(
  origin: string,
  username: string,
  fields: InfoField[],
  showAscii: boolean,
  customAscii?: string,
  showCrt?: boolean,
  theme?: string,
  compressedAscii?: string,
): string {
  const params = new URLSearchParams();
  params.set("username", username);
  params.set("ascii", showAscii ? "1" : "0");
  params.set("crt", showCrt !== false ? "1" : "0");
  if (theme && theme !== DEFAULT_THEME) params.set("theme", theme);
  for (const [key, value] of serializeFields(fields)) {
    params.set(key, value);
  }
  if (compressedAscii) {
    params.set("aa", compressedAscii);
  } else if (customAscii) {
    params.set("ascii_art", customAscii.replace(/\n/g, "\\n"));
  }
  const base = origin || "http://localhost:3000";
  return `${base}/api/public/readme.svg?${params.toString()}`;
}
