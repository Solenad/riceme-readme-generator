import LZString from "lz-string";
import { DEFAULT_THEME, getTheme } from "@/lib/themes";
import {
  parseFields,
  resetFieldsToDefaults,
  serializeFields,
  type InfoField,
} from "@/lib/fields";

export interface TypewriterState {
  phrase1: string;
  phrase2: string;
  speed: number;
  pause: number;
}

export const DEFAULT_TYPEWRITER: TypewriterState = {
  phrase1: "",
  phrase2: "",
  speed: 1.0,
  pause: 500,
};

export interface BuilderState {
  username: string;
  theme: string;
  ascii: boolean;
  crt: boolean;
  customAscii: string;
  fields: InfoField[];
  typewriter: TypewriterState;
}

/**
 * Validates GitHub username format.
 * Regex: ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$
 * - 1-39 chars, alphanumeric and hyphens, cannot start/end with hyphen
 */
export function isValidUsername(username: string): boolean {
  if (username.length === 0) return false;
  if (username.length > 39) return false;
  const re = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return re.test(username);
}

/**
 * Returns a map of duplicate labels (case-insensitive, excluding empty) to their counts.
 * Only labels appearing more than once are included.
 */
export function findDuplicateLabels(
  fields: InfoField[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const field of fields) {
    const trimmed = field.label.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const duplicates = new Map<string, number>();
  for (const [key, count] of counts) {
    if (count > 1) duplicates.set(key, count);
  }
  return duplicates;
}

function buildSharedParams(state: BuilderState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.username) params.set("username", state.username);
  if (!state.ascii) params.set("ascii", "0");
  if (!state.crt) params.set("crt", "0");
  if (state.theme && state.theme !== DEFAULT_THEME) {
    params.set("theme", state.theme);
  }

  const fieldParams = serializeFields(state.fields);
  for (const [key, value] of fieldParams) {
    params.set(key, value);
  }

  if (state.customAscii) {
    const compressed = LZString.compressToEncodedURIComponent(
      state.customAscii,
    );
    params.set("aa", compressed);
  }

  if (state.typewriter.phrase1) params.set("tw_p1", state.typewriter.phrase1);
  if (state.typewriter.phrase2) params.set("tw_p2", state.typewriter.phrase2);
  if (state.typewriter.speed !== 1.0) params.set("tw_spd", String(state.typewriter.speed));
  if (state.typewriter.pause !== 500) params.set("tw_pau", String(state.typewriter.pause));

  return params;
}

export function writeToBuildUrl(state: BuilderState): string {
  const params = buildSharedParams(state);
  const qs = params.toString();
  return qs ? `/build?${qs}` : "/build";
}

export function writeToSvgUrl(state: BuilderState): string {
  const params = buildSharedParams(state);
  // SVG endpoint always needs username param (even if empty, use empty string for preview)
  // But to keep consistency with build URL, only set if present; ensure at least params have fields
  // If username is empty, svg route will default to "your-username" — that's fine.
  // We keep params as built above.
  const qs = params.toString();
  return qs ? `/api/public/readme.svg?${qs}` : "/api/public/readme.svg";
}

export function readBuilderState(params: URLSearchParams): BuilderState {
  const username = params.get("username") ?? "";
  const theme = params.get("theme") ?? DEFAULT_THEME;
  const ascii = params.get("ascii") !== "0";
  const crt = params.get("crt") !== "0";

  const compressed = params.get("aa");
  const rawAsciiArt = params.get("ascii_art");
  let customAscii = "";
  if (compressed) {
    const decompressed =
      LZString.decompressFromEncodedURIComponent(compressed);
    if (decompressed !== null) {
      customAscii = decompressed;
    } else if (rawAsciiArt) {
      customAscii = rawAsciiArt.replace(/\\n/g, "\n");
    }
  } else if (rawAsciiArt) {
    customAscii = rawAsciiArt.replace(/\\n/g, "\n");
  }

  const phrase1 = params.get("tw_p1") ?? "";
  const phrase2 = params.get("tw_p2") ?? "";
  const speed = params.get("tw_spd") !== null
    ? Math.min(2.0, Math.max(0.5, Number(params.get("tw_spd")) || 1.0))
    : 1.0;
  const pause = params.get("tw_pau") !== null
    ? Math.min(3000, Math.max(0, Number(params.get("tw_pau")) || 500))
    : 500;

  // Determine palette from theme for field parsing
  const themeObj = getTheme(theme);
  let fields: InfoField[];
  // Fresh builder: no params at all -> reset to 2 empty rows
  // Check if params is effectively empty (no keys)
  const hasAnyParam = Array.from(params.keys()).length > 0;
  if (!hasAnyParam) {
    fields = resetFieldsToDefaults();
  } else {
    fields = parseFields(params, themeObj.palette);
  }

  return {
    username,
    theme,
    ascii,
    crt,
    customAscii,
    fields,
    typewriter: { phrase1, phrase2, speed, pause },
  };
}
