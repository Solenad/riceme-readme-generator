"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

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
  const [fields, setFields] = useState<InfoField[]>(() =>
    resetFieldsToDefaults(),
  );
  const [showAscii, setShowAscii] = useState(true);
  const [showCrt, setShowCrt] = useState(true);
  const [customAscii, setCustomAscii] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [compressedAscii, setCompressedAscii] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(true);
  const [isPreviewUpdating, setIsPreviewUpdating] = useState(false);
  const prevPreviewUrl = useRef<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  useEffect(() => {
    if (prevPreviewUrl.current === null) {
      prevPreviewUrl.current = previewUrl;
      return;
    }
    if (prevPreviewUrl.current !== previewUrl) {
      prevPreviewUrl.current = previewUrl;
      setIsPreviewUpdating(true);
      setPreviewLoaded(false);
    }
  }, [previewUrl]);

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

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
      },
      () => toast.error("Failed to copy"),
    );
  }, []);

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

  return (
    <motion.div
      className="grid grid-cols-1 gap-8 lg:grid-cols-2"
      variants={builderContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="space-y-6" variants={slideLeft}>
        <div>
          <div className="mb-4">
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
              placeholder="e.g. Solenad"
              className="font-mono placeholder:text-muted-foreground/30"
            />
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
      </motion.div>

      <motion.div className="space-y-6" variants={slideRight}>
        <div
          className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card/40 p-2"
          onClick={() => setPreviewModalOpen(true)}
        >
          {isPreviewUpdating && !previewLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center animate-pulse rounded bg-muted/50">
              <span className="text-xs text-muted-foreground">Loading preview...</span>
            </div>
          )}
          <img
            src={previewUrl}
            alt="README card preview"
            className={`block w-full transition-opacity duration-300 group-hover:blur-[2px] ${previewLoaded ? "opacity-100" : "opacity-0"}`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0.5";
            }}
            onLoad={() => {
              setPreviewLoaded(true);
              setIsPreviewUpdating(false);
            }}
          />
          {previewLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="text-xs font-medium text-foreground drop-shadow-md">
                Preview
              </span>
            </div>
          )}
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

      <dialog
        ref={(el) => {
          if (el) {
            if (previewModalOpen && !el.open) {
              el.showModal();
            } else if (!previewModalOpen && el.open) {
              el.close();
            }
          }
        }}
        onClose={() => setPreviewModalOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPreviewModalOpen(false);
        }}
        className="group fixed inset-0 z-50 m-auto max-w-4xl cursor-pointer rounded-lg border border-border bg-card p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="cursor-default p-4">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(false)}
            className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-card/80 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-foreground hover:bg-card"
            aria-label="Close preview"
          >
            ✕
          </button>
          <img
            key={previewUrl}
            src={previewUrl}
            alt="README card preview full size"
            className="block w-full"
          />
        </div>
      </dialog>
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

function SortableRow({
  field,
  index,
  updateRow,
  duplicateRow,
  toggleVisible,
  removeRow,
  fieldsLength,
}: {
  field: InfoField;
  index: number;
  updateRow: (id: string, patch: Partial<Omit<InfoField, "id">>) => void;
  duplicateRow: (id: string) => void;
  toggleVisible: (id: string) => void;
  removeRow: (id: string) => void;
  fieldsLength: number;
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
