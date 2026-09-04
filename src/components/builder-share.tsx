"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { type BuilderState, writeToBuildUrl, writeToSvgUrl } from "@/lib/builder-state";

interface BuilderShareProps {
  state: BuilderState;
}

function truncate(str: string, len = 60): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "…";
}

export function BuilderShare({ state }: BuilderShareProps) {
  const [origin, setOrigin] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const buildUrl = writeToBuildUrl(state);
  const svgUrl = writeToSvgUrl(state);
  const fullBuildUrl = origin ? `${origin}${buildUrl}` : buildUrl;
  const fullSvgUrl = origin ? `${origin}${svgUrl}` : svgUrl;
  const markdown = `![${state.username || "preview"}](${fullSvgUrl})`;
  const html = `<p align="center">\n  <img src="${fullSvgUrl}" alt="${state.username || "preview"}" />\n</p>`;

  const doCopy = useCallback((text: string, key: string, preview: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(key);
        toast.success("Copied to clipboard", {
          description: truncate(preview, 80),
          duration: 2000,
        });
        setTimeout(() => setCopiedKey(null), 1500);
      },
      () => toast.error("Failed to copy"),
    );
  }, []);

  const copyShareLink = useCallback(() => {
    doCopy(fullBuildUrl, "share", fullBuildUrl);
  }, [fullBuildUrl, doCopy]);

  const copyMarkdown = useCallback(() => {
    doCopy(markdown, "md", markdown);
  }, [markdown, doCopy]);

  const copyHtml = useCallback(() => {
    doCopy(html, "html", html);
  }, [html, doCopy]);

  const copySvgUrl = useCallback(() => {
    doCopy(fullSvgUrl, "svg", fullSvgUrl);
  }, [fullSvgUrl, doCopy]);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Share link (opens builder)</span>
          <button
            type="button"
            onClick={copyShareLink}
            className="cursor-pointer rounded border border-border bg-card px-2 py-1 font-bold text-term-green hover:border-term-green/60 hover:bg-card/80 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            {copiedKey === "share" ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-card/60 p-3 text-xs text-foreground/90">
          <code>{fullBuildUrl}</code>
        </pre>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Markdown</span>
          <button
            type="button"
            onClick={copyMarkdown}
            className="cursor-pointer rounded border border-border bg-card px-2 py-1 font-bold text-term-green hover:border-term-green/60 hover:bg-card/80 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            {copiedKey === "md" ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-card/60 p-3 text-xs text-foreground/90">
          <code>{markdown}</code>
        </pre>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">HTML (centered, for GitHub profile README)</span>
          <button
            type="button"
            onClick={copyHtml}
            className="cursor-pointer rounded border border-border bg-card px-2 py-1 font-bold text-term-green hover:border-term-green/60 hover:bg-card/80 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            {copiedKey === "html" ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-card/60 p-3 text-xs text-foreground/90">
          <code>{html}</code>
        </pre>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Direct image URL</span>
          <button
            type="button"
            onClick={copySvgUrl}
            className="cursor-pointer rounded border border-border bg-card px-2 py-1 font-bold text-term-green hover:border-term-green/60 hover:bg-card/80 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            {copiedKey === "svg" ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-card/60 p-3 text-xs text-foreground/90">
          <code>{fullSvgUrl}</code>
        </pre>
      </div>
    </div>
  );
}
