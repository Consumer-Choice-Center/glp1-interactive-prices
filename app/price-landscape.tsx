"use client";

import { useCallback, useEffect, useRef } from "react";

export default function PriceLandscape() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resizeToContent = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;
    const height = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
    if (height > 0) iframe.style.height = `${height + 2}px`;
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => resizeToContent();
    iframe.addEventListener("load", handleLoad);
    window.addEventListener("resize", resizeToContent);
    if (iframe.contentDocument?.readyState === "complete") handleLoad();
    return () => {
      iframe.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", resizeToContent);
    };
  }, [resizeToContent]);

  return (
    <section className="price-landscape-frame" aria-label="Interactive three-dimensional price comparison">
      <iframe
        ref={iframeRef}
        title="Interactive three-dimensional GLP-1 price landscape"
        src="/interactive-price-chart"
        style={{ display: "block", width: "100%", height: 580, border: 0 }}
        loading="lazy"
        scrolling="no"
      />
    </section>
  );
}
