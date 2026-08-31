"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  readBuilderState,
  writeToBuildUrl,
  isValidUsername,
  findDuplicateLabels,
  type BuilderState,
} from "@/lib/builder-state";
import { BuilderShare } from "@/components/builder-share";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [fetchTarget, setFetchTarget] = useState<string | null>(null);
  const [fields, setFields] = useState<InfoField[]>(() =>
    resetFieldsToDefaults(),
  );
  const [showAscii, setShowAscii] = useState(true);
  const [showCrt, setShowCrt] = useState(true);
  const [customAscii, setCustomAscii] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [compressedAscii, setCompressedAscii] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // 2.2 Hydrate from URL on mount
  useEffect(() => {
    if (hasHydratedRef.current) return;
    const params = new URLSearchParams(searchParams.toString());
    const state = readBuilderState(params);
    // Only hydrate if there is any meaningful state or f param? 
    // readBuilderState handles empty -> resetFieldsToDefaults (fresh)
    // For empty params, we keep initial defaults (2 empty) - no need to set
    // But we still need to hydrate username/theme/toggles if present
    if (state.username) setUsername(state.username);
    if (state.theme) setSelectedTheme(state.theme);
    setShowAscii(state.ascii);
    setShowCrt(state.crt);
    if (state.customAscii) setCustomAscii(state.customAscii);
    // Hydrate fields: if params has any keys, use parsed fields; else keep defaults
    const hasAnyParam = Array.from(params.keys()).length > 0;
    if (hasAnyParam) {
      setFields(state.fields);
    }
    hasHydratedRef.current = true;
    setHasHydrated(true);
  }, [searchParams]);

  // 2.3 + 2.4 URL sync debounced 300ms
  useEffect(() => {
    if (!hasHydrated) return;
    const timer = setTimeout(() => {
      const state: BuilderState = {
        username,
        theme: selectedTheme,
        ascii: showAscii,
        crt: showCrt,
        customAscii,
        fields,
      };
      const url = writeToBuildUrl(state);
      const current = `${window.location.pathname}${window.location.search}`;
      // Avoid pushing identical URL
      if (url !== current) {
        router.replace(url, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [username, selectedTheme, showAscii, showCrt, customAscii, fields, hasHydrated, router]);

  // 4.2 usernameError computed
  const usernameError = useMemo(() => {
    if (!username) return null;
    if (!isValidUsername(username.trim())) {
      return "Must be 1-39 chars, alphanumeric and hyphens";
    }
    return null;
  }, [username]);

  // 5.1 duplicate labels
  const duplicateLabels = useMemo(() => findDuplicateLabels(fields), [fields]);

  // 5.4 field count color
  const fieldCountColor = useMemo(() => {
    if (fields.length >= 16) return "text-red-500";
    if (fields.length >= 14) return "text-yellow-500";
    return "text-muted-foreground";
  }, [fields.length]);

  // 4.6 clear fetch status when username changes is handled via conditional rendering (username !== fetchTarget)

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
    if (usernameError) {
      toast.error(usernameError);
      return;
    }
    setFetchTarget(trimmed);
  }, [username, usernameError]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setFields((items) => {
          const oldIndex = items.findIndex((f) => f.id === active.id);
          const newIndex = items.findIndex((f) => f.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleFetch();
    },
    [handleFetch],
  );

  const builderState: BuilderState = useMemo(() => ({
    username,
    theme: selectedTheme,
    ascii: showAscii,
    crt: showCrt,
    customAscii,
    fields,
  }), [username, selectedTheme, showAscii, showCrt, customAscii, fields]);

  // Determine fetch status for inline display (4.5)
  const fetchStatus = useMemo(() => {
    if (!fetchTarget) return null;
    if (username.trim() !== fetchTarget) return null; // cleared when username changes (4.6)
    if (profileQuery.isFetching) return null; // handled via button spinner
    if (profileQuery.data) {
      const data = profileQuery.data as Record<string, unknown>;
      const repos = typeof data.public_repos === "number" ? data.public_repos : 0;
      const followers = typeof data.followers === "number" ? data.followers : 0;
      return {
        type: "success" as const,
        message: `Profile found · ${repos} repos · ${followers} followers`,
      };
    }
    if (profileQuery.error) {
      const msg = (profileQuery.error as Error).message;
      if (msg.includes("Rate limited")) {
        return { type: "warning" as const, message: msg };
      }
      if (msg.includes("not found") || msg.includes("User not found")) {
        return { type: "error" as const, message: "User not found on GitHub" };
      }
      return { type: "error" as const, message: "Failed to fetch profile" };
    }
    return null;
  }, [fetchTarget, username, profileQuery.data, profileQuery.error, profileQuery.isFetching]);

  return (
    <motion.div
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      variants={builderContainer}
      initial="hidden"
      animate="show"
    >
      {/* Form column - order 2 on mobile (below sticky preview), order 1 on desktop */}
      <motion.div className="space-y-6 lg:order-1 order-2" variants={slideLeft}>
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
                className={`font-mono placeholder:text-muted-foreground/30 ${usernameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {usernameError && (
                <p className="mt-1.5 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-500">
                  {usernameError}
                </p>
              )}
              {fetchStatus && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${fetchStatus.type === "success" ? "text-green-600" : fetchStatus.type === "warning" ? "text-yellow-600" : "text-red-500"}`}>
                  {fetchStatus.type === "success" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                  {fetchStatus.type === "error" && <XCircle className="h-3.5 w-3.5 shrink-0" />}
                  {fetchStatus.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                  <span>{fetchStatus.message}</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleFetch}
              disabled={!!usernameError || !username.trim() || profileQuery.isFetching}
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
              <span className={`font-mono ${fieldCountColor}`}>
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
            className="max-h-[420px] space-y-2 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,black_calc(100%_-_24px),transparent)]"
            variants={fieldGrid}
            initial="hidden"
            animate="show"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <SortableRow
                      key={field.id}
                      field={field}
                      index={index}
                      updateRow={updateRow}
                      duplicateRow={duplicateRow}
                      toggleVisible={toggleVisible}
                      removeRow={removeRow}
                      fieldsLength={fields.length}
                      duplicateMap={duplicateLabels}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeId ? (
                  <div className="rounded-md border border-border bg-card p-2 shadow-xl ring-2 ring-term-cyan/30">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground/50">
                        {String(fields.findIndex((f) => f.id === activeId) + 1).padStart(2, "0")}
                      </span>
                      <GripVertical className="h-3 w-3 text-term-cyan/60" />
                      <input
                        type="color"
                        value={fields.find((f) => f.id === activeId)?.color ?? "#fff"}
                        readOnly
                        className="h-5 w-6 shrink-0 cursor-pointer rounded border-none bg-transparent p-0"
                      />
                      <span className="h-7 flex-1 truncate rounded bg-card/60 px-2 font-mono text-xs">
                        {fields.find((f) => f.id === activeId)?.label || (
                          <span className="text-muted-foreground/30">Label</span>
                        )}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Eye className="h-3 w-3 text-muted-foreground/40" />
                        <Copy className="h-3 w-3 text-muted-foreground/40" />
                        <Trash2 className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 pl-[52px]">
                      <div className="h-8 flex-1 truncate rounded bg-card/60 px-2 font-mono text-xs text-muted-foreground/30">
                        {fields.find((f) => f.id === activeId)?.value || "Value"}
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </motion.div>
        </motion.div>

        {/* Share buttons for mobile - below fields (6.6) */}
        <motion.div
          className="lg:hidden"
          variants={snippetContainer}
          initial="hidden"
          animate="show"
        >
          <BuilderShare state={builderState} />
        </motion.div>
      </motion.div>

      {/* Preview + Share (desktop) - sticky on mobile (6.2), collapsible (6.1, 6.3, 6.4) */}
      <motion.div className="space-y-6 lg:order-2 order-1 lg:static sticky top-0 z-10" variants={slideRight}>
        <div className={`relative overflow-hidden rounded-lg border border-border bg-card/40 p-2 transition-all duration-300 ${previewCollapsed ? "max-h-[60px] lg:max-h-none" : "max-h-[40vh] lg:max-h-none lg:overflow-visible"} lg:max-h-none`}>
          <button
            type="button"
            onClick={() => setPreviewCollapsed(!previewCollapsed)}
            aria-label={previewCollapsed ? "Expand preview" : "Collapse preview"}
            className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded bg-card/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors lg:hidden"
          >
            {previewCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
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

        {/* Share buttons for desktop - hidden on mobile */}
        <motion.div
          className="hidden lg:block space-y-3"
          variants={snippetContainer}
          initial="hidden"
          animate="show"
        >
          <BuilderShare state={builderState} />
        </motion.div>
      </motion.div>

      {/* Fallback share for desktop hidden duplicate handling - already above */}
    </motion.div>
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

function SortableRow({
  field,
  index,
  updateRow,
  duplicateRow,
  toggleVisible,
  removeRow,
  fieldsLength,
  duplicateMap,
}: {
  field: InfoField;
  index: number;
  updateRow: (id: string, patch: Partial<Omit<InfoField, "id">>) => void;
  duplicateRow: (id: string) => void;
  toggleVisible: (id: string) => void;
  removeRow: (id: string) => void;
  fieldsLength: number;
  duplicateMap: Map<string, number>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const trimmedLabel = field.label.trim().toLowerCase();
  const dupCount = trimmedLabel ? duplicateMap.get(trimmedLabel) : undefined;
  const isDuplicate = dupCount !== undefined && dupCount > 1;

  const valueLen = field.value.length;
  const showCharCount = valueLen >= 48;
  const charCountColor = valueLen >= 64 ? "text-yellow-500" : "text-muted-foreground";

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2 }}
        className="rounded-md border border-border/60 bg-card/40 p-2"
      >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground/50">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label="Drag to reorder"
          className="flex h-5 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>
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
        {isDuplicate && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            appears {dupCount} times
          </span>
        )}
        <div className="flex shrink-0 items-center gap-0.5">
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
            disabled={fieldsLength >= MAX_FIELDS}
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
      <div className="flex items-center gap-1.5 pl-[52px]">
        <Input
          value={field.value}
          onChange={(e) =>
            updateRow(field.id, { value: e.target.value })
          }
          placeholder={field.placeholder ?? "Value"}
          className="h-8 flex-1 font-mono text-xs placeholder:text-muted-foreground/30"
        />
        {showCharCount && (
          <span className={`shrink-0 font-mono text-xs ${charCountColor}`}>
            {valueLen}/64
          </span>
        )}
      </div>
      </motion.div>
    </div>
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
