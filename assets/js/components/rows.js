// Explorer row renderer (one fixed-height row per paper, HTML string for the virtual list).
import { esc, fmt, fmtInt, highlight } from "../core/util.js";
import { icon } from "../core/icons.js";
import { chipsHTML, ratingColor, STATUS_LABEL } from "../core/scale.js";
import { isStarred, listsOf } from "../core/store.js";
import { listDotsHTML } from "./listmenu.js";

const I_SHEET = icon("sheet"), I_PDF = icon("pdf"), I_STAR = icon("star"), I_STARF = icon("starFill"), I_LIST = icon("list");

/**
 * @param {{tax:any, rankedCount:number, terms:()=>string[], sem:()=>({map:Map, top:number}|null)}} ctx
 */
export function makeRowRenderer(ctx) {
  return (p, i, selected) => {
    const { tax } = ctx;
    const m = tax.major(p.maj);
    const fine = p.fine[0] ? tax.fine(p.fine[0]).name : "";
    const more = p.fine.length > 1 ? ` <span class="muted">+${p.fine.length - 1}</span>` : "";
    const st = isStarred(p.id);
    const sem = ctx.sem();
    const hit = sem?.map.get(p.id);
    let rank;
    if (hit) {
      const w = Math.max(4, Math.min(100, (100 * hit.s) / (sem.top || 1)));
      rank = `<b>${p.rk != null ? fmtInt(p.rk) : "—"}</b><span class="relbar" title="relevance ${fmt(hit.s, 3)} · cosine ${fmt(hit.sem, 3)} · lexical ${fmt(hit.lex, 2)}"><i style="width:${w}%"></i></span>`;
    } else if (p.rk != null) rank = `<b>${fmtInt(p.rk)}</b><span>by score</span>`;
    else rank = `<b class="muted">—</b><span>${esc(p.s === "active" ? "no reviews" : STATUS_LABEL[p.s] || p.s)}</span>`;
    return `<div class="row${selected ? " sel" : ""}${p.s !== "active" ? " inactive" : ""}" data-i="${i}">
      <div class="c-rank">${rank}</div>
      <div class="c-main"><div class="t" title="${esc(p.t)}">${highlight(p.t, ctx.terms())}</div>
        <div class="m"><span class="tag" style="--c:${m.color}"><i></i>${esc(m.name)}</span>${fine ? `<span class="tag fine" style="--c:${m.color}"><i></i>${esc(fine)}${more}</span>` : ""}${listDotsHTML(listsOf(p.id))}<span class="kws">#${p.n}${p.kw.length ? ` · ${esc(p.kw.slice(0, 4).join(" · "))}` : ""}</span></div></div>
      <div class="c-chips">${chipsHTML(p.rs)}</div>
      <div class="c-score"><b style="--sc:${p.r != null ? ratingColor(p.r) : "transparent"}">${p.r != null ? fmt(p.r) : "—"}</b><span>${p.nr || 0} reviews</span></div>
      <div class="c-sd">${p.sd != null ? fmt(p.sd) : "—"}</div>
      <div class="c-cw">${fmt(p.cw)}</div>
      <div class="c-flags"><span class="fl${p.fs ? " on" : ""}" title="${p.fs ? "Has fact sheet" : ""}">${p.fs ? I_SHEET : ""}</span><span class="fl${p.pdf ? " on" : ""}" title="${p.pdf ? "Local PDF" : ""}">${p.pdf ? I_PDF : ""}</span>
        <button class="star${st ? " on" : ""}" data-star="${esc(p.id)}" title="Star (s)" aria-label="Star">${st ? I_STARF : I_STAR}</button>
        <button class="star lists-btn" data-lists="${esc(p.id)}" title="Add to list (l)" aria-label="Add to list">${I_LIST}</button></div>
    </div>`;
  };
}
