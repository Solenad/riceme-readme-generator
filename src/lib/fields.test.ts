import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FIELDS,
  MAX_FIELDS,
  addRowToFields,
  duplicateRowInFields,
  moveRowInFields,
  parseFields,
  removeRowFromFields,
  resetFieldsToDefaults,
  serializeFields,
  slugifyId,
  toggleRowVisibility,
  type InfoField,
} from "./fields.ts";

const PALETTE = ["#p0", "#p1", "#p2", "#p3", "#p4", "#p5", "#p6", "#p7"];

function makeParams(entries: Array<[string, string]>): URLSearchParams {
  return new URLSearchParams(entries);
}

test("legacy URL without f parameter renders defaults with value overrides", () => {
  const parsed = parseFields(
    makeParams([
      ["username", "Solenad"],
      ["distro", "Ubuntu"],
    ]),
    PALETTE,
  );

  assert.equal(parsed.length, DEFAULT_FIELDS.length);
  assert.equal(parsed[0].id, "distro");
  assert.equal(parsed[0].value, "Ubuntu");
  assert.equal(parsed[0].label, "distro");
  assert.equal(parsed[0].color, PALETTE[0]);
});

test("legacy URL keeps default value when param absent", () => {
  const parsed = parseFields(makeParams([]), PALETTE);

  assert.equal(parsed[0].value, DEFAULT_FIELDS[0].value);
  assert.equal(parsed[1].value, DEFAULT_FIELDS[1].value);
});

test("legacy URL empty param yields empty value", () => {
  const parsed = parseFields(makeParams([["host", ""]]), PALETTE);

  assert.equal(parsed[1].value, "");
});

test("f parameter controls order and includes custom rows", () => {
  const parsed = parseFields(
    makeParams([
      ["f", "custom,distro"],
      ["custom", "Hello"],
      ["distro", "Windows 11"],
    ]),
    PALETTE,
  );

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].id, "custom");
  assert.equal(parsed[0].label, "custom");
  assert.equal(parsed[0].value, "Hello");
  assert.equal(parsed[0].color, PALETTE[0]);
  assert.equal(parsed[1].id, "distro");
  assert.equal(parsed[1].label, "Distro");
  assert.equal(parsed[1].color, "#8bd5ca");
});

test("label, color, and hide overrides resolve for default rows", () => {
  const parsed = parseFields(
    makeParams([
      ["f", "distro"],
      ["distro", "Windows 11"],
      ["distro_label", "OS"],
      ["distro_color", "#123456"],
      ["distro_hide", "1"],
    ]),
    PALETTE,
  );

  assert.equal(parsed[0].label, "OS");
  assert.equal(parsed[0].color, "#123456");
  assert.equal(parsed[0].visible, false);
});

test("rows are clamped to MAX_FIELDS", () => {
  const ids = Array.from({ length: 30 }, (_, i) => `field-${i}`);
  const parsed = parseFields(makeParams([["f", ids.join(",")]]), PALETTE);

  assert.equal(parsed.length, MAX_FIELDS);
  assert.equal(parsed[0].id, "field-0");
  assert.equal(parsed[MAX_FIELDS - 1].id, `field-${MAX_FIELDS - 1}`);
});

test("serializeFields produces ordered f list and per-row params", () => {
  const fields = [
    {
      id: "distro",
      label: "Distro",
      value: "Windows 11",
      color: "#8bd5ca",
      visible: true,
    },
    {
      id: "custom",
      label: "Custom",
      value: "Hello",
      color: "#123456",
      visible: false,
    },
  ];
  const params = serializeFields(fields);

  assert.equal(params.get("f"), "distro,custom");
  assert.equal(params.get("distro"), "Windows 11");
  assert.equal(params.get("distro_label"), "Distro");
  assert.equal(params.get("distro_color"), "#8bd5ca");
  assert.equal(params.get("distro_hide"), null);
  assert.equal(params.get("custom_hide"), "1");
});

test("serialize then parse round-trips fields", () => {
  const fields = [
    {
      id: "distro",
      label: "OS",
      value: "Windows 11",
      color: "#123456",
      visible: true,
    },
    {
      id: "custom",
      label: "Custom",
      value: "Hello",
      color: "#654321",
      visible: false,
    },
  ];

  const parsed = parseFields(serializeFields(fields), PALETTE);

  assert.deepEqual(parsed, fields);
});

test("slugifyId slugifies, dedupes, and falls back for empty labels", () => {
  assert.equal(slugifyId("My Field!", new Set()), "my-field");
  assert.equal(slugifyId("", new Set()), "row");
  assert.equal(
    slugifyId("distro", new Set(["distro", "distro-2"])),
    "distro-3",
  );
});

function blankFields(): InfoField[] {
  return DEFAULT_FIELDS.map((f) => ({ ...f, value: "" }));
}

function fullFields(): InfoField[] {
  const extra = Array.from(
    { length: MAX_FIELDS - DEFAULT_FIELDS.length },
    (_, i) => ({
      id: `extra-${i}`,
      label: `Extra ${i}`,
      value: "",
      color: "#fff",
      visible: true,
    }),
  );
  return [...blankFields(), ...extra];
}

test("addRowToFields appends a row with generated id and stops at the cap", () => {
  const base = resetFieldsToDefaults();
  const added = addRowToFields(base);

  assert.equal(added.length, base.length + 1);
  assert.equal(added[added.length - 1].id, "row");
  assert.equal(added[added.length - 1].visible, true);
  assert.equal(added[added.length - 1].label, "");
  assert.equal(added[added.length - 1].value, "");

  const atCap = addRowToFields(Array.from({ length: MAX_FIELDS }, (_, i) => ({
    id: `f-${i}`, label: "", value: "", color: "#fff", visible: true,
  })));
  assert.equal(atCap.length, MAX_FIELDS);
});

test("addRowToFields dedupes generated ids", () => {
  const fields = resetFieldsToDefaults();
  fields.push({ id: "row", label: "", value: "", color: "#fff", visible: true });

  const added = addRowToFields(fields);

  assert.equal(added[added.length - 1].id, "row-2");
});

test("removeRowFromFields removes the row and keeps order", () => {
  const result = removeRowFromFields(blankFields(), "host");

  assert.equal(result.length, DEFAULT_FIELDS.length - 1);
  assert.equal(result.some((f) => f.id === "host"), false);
  assert.equal(result[0].id, "distro");
  assert.equal(result[1].id, "uptime");
});

test("moveRowInFields swaps with neighbor and respects boundaries", () => {
  const base = blankFields().slice(0, 3);

  const up = moveRowInFields(base, "uptime", -1);
  assert.deepEqual(up.map((f) => f.id), ["distro", "uptime", "host"]);

  const down = moveRowInFields(base, "distro", 1);
  assert.deepEqual(down.map((f) => f.id), ["host", "distro", "uptime"]);

  const firstUp = moveRowInFields(base, "distro", -1);
  assert.deepEqual(firstUp.map((f) => f.id), ["distro", "host", "uptime"]);

  const lastDown = moveRowInFields(base, "uptime", 1);
  assert.deepEqual(lastDown.map((f) => f.id), ["distro", "host", "uptime"]);
});

test("duplicateRowInFields appends a copy with unique id after the source", () => {
  const result = duplicateRowInFields(blankFields(), "distro");

  assert.equal(result.length, DEFAULT_FIELDS.length + 1);
  assert.equal(result[1].id, "distro-2");
  assert.equal(result[1].label, result[0].label);
  assert.equal(result[1].color, result[0].color);
  assert.equal(result[1].value, result[0].value);

  const atCap = duplicateRowInFields(fullFields(), "distro");
  assert.equal(atCap.length, MAX_FIELDS);
});

test("toggleRowVisibility flips the visible flag", () => {
  const hidden = toggleRowVisibility(blankFields(), "distro");
  assert.equal(hidden[0].visible, false);
  const shown = toggleRowVisibility(hidden, "distro");
  assert.equal(shown[0].visible, true);
});

test("resetFieldsToDefaults restores 2 rows with empty label/value", () => {
  const reset = resetFieldsToDefaults();

  assert.equal(reset.length, 2);
  assert.equal(reset[0].id, "distro");
  assert.equal(reset[0].value, "");
  assert.equal(reset[0].label, "");
  assert.equal(reset[0].visible, true);
  assert.equal(reset[1].id, "host");
  assert.equal(reset[1].value, "");
  assert.equal(reset[1].label, "");
  assert.equal(reset[1].visible, true);
});
