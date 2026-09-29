"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Expand, RotateCcw, X } from "lucide-react";
import UniverseScene from "./universe-scene";
import PolicyStory from "./policy-story";
import PriceLandscape from "./price-landscape";
import { productDoseColor } from "./dose-colors";
import { getExplorePrice } from "../data/glp1-prices";
import "./universe.css";

type Drug = { id:string; name:string; molecule:string; maker:"Novo Nordisk"|"Eli Lilly"; form:string; approved:string; doses:string[]; note:string; accent:string; source:string; sourceName:string; model:"pen"|"vial"|"bottle"; };

const drugs:Drug[] = [
  {id:"saxenda",name:"Saxenda",molecule:"liraglutide",maker:"Novo Nordisk",form:"Daily multi-dose injection",approved:"Dec 2014",doses:["0.6","1.2","1.8","2.4","3.0"],note:"The earlier GLP-1 weight-management entrant. One multi-dose pen delivers five dose settings.",accent:"#78dbc9",model:"pen",source:"https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-weight-management-drug-patients-aged-12-and-older",sourceName:"FDA approval history"},
  {id:"wegovy",name:"Wegovy",molecule:"semaglutide",maker:"Novo Nordisk",form:"Weekly single-dose injection",approved:"Jun 2021",doses:["0.25","0.5","1","1.7","2.4"],note:"Five weekly pen strengths. The 2.4 mg dose is the usual recommended maintenance dose.",accent:"#79c8f7",model:"pen",source:"https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s033lbl.pdf",sourceName:"FDA prescribing information"},
  {id:"zepbound",name:"Zepbound",molecule:"tirzepatide · GIP / GLP-1",maker:"Eli Lilly",form:"Weekly injection · pen, vial or KwikPen",approved:"Nov 2023",doses:["2.5","5","7.5","10","12.5","15"],note:"Six strengths across multiple delivery formats. The vial is a small injection vial, not a pill bottle.",accent:"#ffbe78",model:"vial",source:"https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/217806Orig1s020lbl.pdf",sourceName:"FDA prescribing information"},
  {id:"oral-wegovy",name:"Wegovy pill",molecule:"semaglutide",maker:"Novo Nordisk",form:"Daily tablet",approved:"Dec 2025",doses:["1.5","4","9","25"],note:"The first oral GLP-1 approved in the U.S. for weight management. Approved Dec 22, 2025, before Foundayo.",accent:"#ee99c4",model:"bottle",source:"https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/218316Orig1s000lbl.pdf",sourceName:"FDA tablet label"},
  {id:"wegovy-hd",name:"Wegovy HD",molecule:"semaglutide",maker:"Novo Nordisk",form:"Weekly single-dose injection",approved:"Mar 2026",doses:["7.2"],note:"A higher semaglutide dose for eligible adults who have tolerated 2.4 mg for at least four weeks and need further weight reduction.",accent:"#c6a3f4",model:"pen",source:"https://www.fda.gov/news-events/press-announcements/fda-approves-fourth-product-under-national-priority-voucher-program-higher-dose-semaglutide",sourceName:"FDA approval announcement"},
  {id:"foundayo",name:"Foundayo",molecule:"orforglipron",maker:"Eli Lilly",form:"Daily tablet",approved:"Apr 2026",doses:["0.8","2.5","5.5","9","14.5","17.2"],note:"Lilly’s oral GLP-1 was approved Apr 1, 2026 and became available Apr 9, about three months after oral Wegovy’s U.S. arrival.",accent:"#f5a88f",model:"bottle",source:"https://www.fda.gov/news-events/press-announcements/fda-approves-first-new-molecular-entity-under-national-priority-voucher-program",sourceName:"FDA approval announcement"}
];

function ExplorePriceLineChart({ points, color, expanded = false }: { points: { label: string; value: number }[]; color: string; expanded?: boolean }) {
 if (points.length === 0) return <p className="price-chart-empty">No dated regular-price changes are available for this dose.</p>;
 const width=900, height=expanded?410:220, left=58, right=24, top=30, bottom=expanded?52:42;
 const values=points.map(point=>point.value);
 const min=Math.max(0,Math.floor(Math.min(...values)/100)*100-100);
 const max=Math.ceil(Math.max(...values)/100)*100+100;
 const x=(index:number)=>left+(index/Math.max(1,points.length-1))*(width-left-right);
 const y=(value:number)=>top+((max-value)/Math.max(1,max-min))*(height-top-bottom);
 const line=points.map((point,index)=>`${x(index)},${y(point.value)}`).join(" ");
 return <svg className="explore-price-line" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Price history line chart">
  {[0,1,2,3].map(row=>{const value=max-(max-min)*row/3;return <g key={row}><line x1={left} y1={y(value)} x2={width-right} y2={y(value)}/><text x={left-7} y={y(value)+4} textAnchor="end">${Math.round(value)}</text></g>})}
  <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  {points.map((point,index)=><g key={`${point.label}-${index}`}><circle cx={x(index)} cy={y(point.value)} r="4.5" fill={color}><title>{`${point.label}: $${point.value}`}</title></circle><text className="price-chart-date" x={x(index)} y={height-7} textAnchor="middle">{point.label}</text><text className="price-chart-value" x={x(index)} y={y(point.value)-10} textAnchor="middle">${point.value}</text></g>)}
 </svg>;
}

export default function Page(){
 const [selected,setSelected]=useState("wegovy"); const [dose,setDose]=useState<string|null>("2.4"); const [view,setView]=useState<"universe"|"compare"|"policy">("universe"); const [chartExpanded,setChartExpanded]=useState(false);
 const item=drugs.find(d=>d.id===selected)!;
 const displayedPrice=getExplorePrice(item.name,dose||item.doses[item.doses.length-1],item.model==="vial"?"Vial":item.model==="bottle"?"Tablet":"Pen");
 const selectedAccent=item.id==="wegovy"&&dose==="2.4"?"#b9c6cf":productDoseColor(item.id,dose||undefined,item.accent);
 const choose=(id:string)=>{const d=drugs.find(x=>x.id===id)!;setSelected(id);setDose(d.doses[d.doses.length-1]);};
 useEffect(()=>{if(!chartExpanded)return;const handleKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")setChartExpanded(false)};window.addEventListener("keydown",handleKeyDown);return()=>window.removeEventListener("keydown",handleKeyDown)},[chartExpanded]);
 return <main className={`app-shell${view==="policy"?" policy-mode":""}`}>
  <UniverseScene selected={selected} dose={dose} drugs={drugs} onSelect={choose} />
  <div className="space-grain" aria-hidden="true" />
  <header className="site-header">
   <button className="wordmark" onClick={()=>{setView("universe");choose("wegovy")}} aria-label="Return to universe"><span className="ccc-brand"><img src="/ccc-logo.png" alt="Consumer Choice Center" /></span><span className="site-title">GLP-1 UNIVERSE</span></button>
   <nav className="main-nav" aria-label="Main navigation"><button className={view==="universe"?"active":""} onClick={()=>setView("universe")}>Explore</button><button className={view==="compare"?"active":""} onClick={()=>setView("compare")}>Compare the lineup</button><button className={view==="policy"?"active":""} onClick={()=>setView("policy")}>Policy story</button></nav>
   <div className="header-meta"><span>U.S. FDA APPROVALS · SEP 2026</span></div>
  </header>
  {view==="policy" ? <PolicyStory /> : view==="universe" ? <>
   <section className="intro" aria-label="Introduction"><div className="eyebrow">CURRENTLY TRACKING</div><h1>Novo Nordisk<br/><em>& Eli Lilly.</em></h1><p>Explore the U.S. GLP-1 and dual GIP/GLP-1 products currently represented by these two manufacturers. Select a product to compare its format, doses, approval date, and price snapshot. This is informational content, not medical advice.</p><div className="intro-scroll">SELECT A PRODUCT <ArrowDownRight size={17}/></div></section>
   <aside className="detail-panel" key={item.id} style={{"--accent":selectedAccent} as React.CSSProperties} aria-label={`${item.name} details`}>
    <div className="panel-top"><span className="panel-kicker">{item.maker} <span className="tiny-star">·</span> {item.approved}</span><span className="panel-index">{String(drugs.indexOf(item)+1).padStart(2,"0")} / 06</span></div>
    <h2>{item.name}</h2><div className="molecule">{item.molecule}</div><div className="thin-rule"/>
    <div className="fact-row"><span>FORMAT</span><strong>{item.form}</strong></div><div className="fact-row"><span>FDA APPROVAL</span><strong>{item.approved}</strong></div>
    <div className="dose-head"><span>DOSE OPTIONS</span><span>CURRENT PRICE</span></div><div className="dose-grid">{item.doses.map(n=>{const dosePrice=getExplorePrice(item.name,n,item.model==="vial"?"Vial":item.model==="bottle"?"Tablet":"Pen");return <button key={n} className={dose===n?"selected":""} style={{"--dose-accent":productDoseColor(item.id,n,item.accent)} as React.CSSProperties} onClick={()=>setDose(n)} aria-pressed={dose===n} aria-label={`${n} mg, current snapshot ${dosePrice?.headline??"price unavailable"}`}><span className="dose-value">{n}<small>mg</small></span><span className="dose-price">{dosePrice?.headline??"—"}</span></button>})}</div>
    {displayedPrice && <div className="price-module dose-price-chart"><div className="price-title"><span>{item.name.toUpperCase()} · {dose} MG · PRICE HISTORY</span><strong>{displayedPrice.headline}<small> / {displayedPrice.periodDays} days</small></strong></div><button type="button" className="expand-chart-button" onClick={()=>setChartExpanded(true)} aria-label="Expand price chart"><Expand size={15}/> Expand chart</button><ExplorePriceLineChart points={displayedPrice.series} color={selectedAccent}/><p>{displayedPrice.detail}</p><div className="price-sources"><a href={displayedPrice.source} target="_blank" rel="noreferrer">Price source ↗</a>{displayedPrice.offerSources.map(offer=><a key={offer.label} href={offer.source} target="_blank" rel="noreferrer">{offer.label}</a>)}</div></div>}
    <p className="item-note">{item.note}</p>
    <a className="source-link" href={item.source} target="_blank" rel="noreferrer">{item.sourceName} <ArrowUpRight size={15}/></a>
   </aside>
   <div className="scene-hint"><RotateCcw size={15}/> DRAG TO ROTATE · SELECT TO FOCUS</div><div className="orbit-legend" aria-label="Orbit colors"><span><i className="novo-line"/> Novo Nordisk</span><span><i className="lilly-line"/> Eli Lilly</span></div>
   <div className="orbit-dock" aria-label="Select a medicine">{drugs.map((d,i)=><button key={d.id} onClick={()=>choose(d.id)} className={selected===d.id?"current":""} style={{"--accent":d.id==="wegovy"&&(selected===d.id?dose:d.doses[d.doses.length-1])==="2.4"?"#b9c6cf":selected===d.id?selectedAccent:productDoseColor(d.id,d.doses[d.doses.length-1],d.accent)} as React.CSSProperties} aria-pressed={selected===d.id}><span className="dock-orb"/><span className="dock-copy"><strong>{d.name}</strong><small>{d.maker}</small></span><span className="dock-number">0{i+1}</span></button>)}</div>
  </> : <section className="comparison"><div className="compare-heading"><div className="eyebrow"><span className="pulse"/> THE APPROVED MARKET</div><h1>Two makers.<br/><em>Six presentations.</em></h1><p>Count distinct product and form presentations here. Dose options are labeled strengths or selectable pen settings, not a measure of potency or clinical equivalence. Pricing and availability can vary by pharmacy, channel, and affordability program.</p></div><PriceLandscape/><div className="compare-columns"><div className="maker-column novo">
    <div className="maker-heading"><span>NOVO NORDISK</span><strong>4 <small>presentations</small></strong><strong>15 <small>dose options</small></strong></div>
    {drugs.filter(d=>d.maker==="Novo Nordisk").map(d=><button key={d.id} onClick={()=>{choose(d.id);setView("universe")}}><span><b>{d.name}</b><small>{d.form} · {d.approved}</small></span><span>{d.doses.length} doses <ArrowUpRight size={17}/></span></button>)}</div>
    <div className="maker-column lilly">
    <div className="maker-heading"><span>ELI LILLY</span><strong>2 <small>presentations</small></strong><strong>12 <small>dose options</small></strong></div>
    {drugs.filter(d=>d.maker==="Eli Lilly").map(d=><button key={d.id} onClick={()=>{choose(d.id);setView("universe")}}><span><b>{d.name}</b><small>{d.form} · {d.approved}</small></span><span>{d.doses.length} doses <ArrowUpRight size={17}/></span></button>)}</div>
  </div>
  <div className="compare-insight"><span>THE TIMELINE, CORRECTED</span><p>Oral Wegovy was FDA-approved on <b>December 22, 2025</b>. Foundayo followed on <b>April 1, 2026</b>. Wegovy HD’s 7.2 mg is the highest <i>semaglutide</i> weekly injection dose in this lineup; milligrams across different molecules do not rank their strength or effectiveness. This summary is for educational use and not a substitute for medical guidance.</p><div><a href="https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/218316Orig1s000lbl.pdf" target="_blank" rel="noreferrer">Oral Wegovy FDA label ↗</a><a href="https://www.fda.gov/news-events/press-announcements/fda-approves-first-new-molecular-entity-under-national-priority-voucher-program" target="_blank" rel="noreferrer">Foundayo FDA approval ↗</a></div></div><p className="method-note">Scope: branded FDA-approved weight-management GLP-1 receptor agonists and tirzepatide (dual GIP/GLP-1), through September 2026. Saxenda is included. Diabetes-only brands and compounded products are excluded. Wegovy injection and HD are shown separately to make the new 7.2 mg presentation visible; they share semaglutide and the Wegovy brand. Pricing, where shown, is a manufacturer self-pay offer for a specified dose/channel, not list or net price. The 3D objects are stylized illustrations, not product photographs.</p></section>}
  <footer className="site-footer"><span>RESEARCH & DESIGN · ARACELI VARGAS</span><span>PRODUCT INFORMATION ONLY · NOT MEDICAL ADVICE</span></footer>
  {chartExpanded&&displayedPrice&&<div className="chart-modal-backdrop" onClick={()=>setChartExpanded(false)}><section className="chart-modal" role="dialog" aria-modal="true" aria-labelledby="expanded-chart-title" onClick={event=>event.stopPropagation()}><div className="chart-modal-heading"><div><span className="panel-kicker">PRICE HISTORY · {item.name.toUpperCase()} · {dose} MG</span><h2 id="expanded-chart-title">{displayedPrice.headline}<small> / {displayedPrice.periodDays} days</small></h2></div><button type="button" onClick={()=>setChartExpanded(false)} aria-label="Close expanded chart"><X size={20}/></button></div><ExplorePriceLineChart points={displayedPrice.series} color={selectedAccent} expanded/><p>{displayedPrice.detail}</p><div className="price-sources"><a href={displayedPrice.source} target="_blank" rel="noreferrer">Price source ↗</a>{displayedPrice.offerSources.map(offer=><a key={offer.label} href={offer.source} target="_blank" rel="noreferrer">{offer.label}</a>)}</div></section></div>}
 </main>
}
