import { useEffect, useState } from "react";

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

const slugify = (value, fallback = "section") => {
  if (!value) return fallback;
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || fallback;
};

const parseFrontmatter = (rawText, src) => {
  const match = rawText.match(FRONTMATTER_REGEX);
  if (!match) return { meta: {}, body: rawText };

  try {
    const meta = JSON.parse(match[1]);
    return { meta, body: rawText.slice(match[0].length) };
  } catch (err) {
    throw new Error(`Frontmatter for ${src} is not valid JSON: ${err.message || err}`);
  }
};

const extractHeadings = (html) => {
  if (typeof document === "undefined") return [];

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const nodes = temp.querySelectorAll("h1, h2, h3");
  return Array.from(nodes).map((node) => {
    const label = (node.textContent || "").trim();
    const depth = Number(node.tagName?.replace("H", "")) || 0;
    const id = node.getAttribute("id") || slugify(label);

    return { id, label, depth };
  });
};

const useMarkdown = (src) => {
  const [state, setState] = useState({
    html: "",
    meta: {},
    headings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    async function run() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await fetch(src, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`);

        const rawText = await res.text();
        if (!alive) return;

        const [{ marked }, DOMPurifyMod] = await Promise.all([import("marked"), import("dompurify")]);
        const { meta, body } = parseFrontmatter(rawText, src);

        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false,
        });

        const tokens = marked.lexer(body);
        const dirty = marked.parser(tokens);
        const DOMPurify = DOMPurifyMod.default || DOMPurifyMod;
        const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
        const headings = extractHeadings(clean);

        if (alive) {
          setState({ html: clean, meta, headings, loading: false, error: null });
        }
      } catch (err) {
        if (alive) {
          setState({ html: "", meta: {}, headings: [], loading: false, error: err });
        }
      }
    }

    if (src) {
      run();
    }

    return () => {
      alive = false;
    };
  }, [src]);

  return state;
};

export default useMarkdown;
