"use client";
import { useRef, useState } from "react";

export default function InvoiceFrame({ html }: { html: string }) {
    const ref = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState(600);

    // Inject a white background so the dark page theme doesn't bleed through
    const injected = html.includes("<head>")
        ? html.replace("<head>", `<head><style>html,body{background:#fff!important;}</style>`)
        : `<style>html,body{background:#fff!important;}</style>` + html;

    function onLoad() {
        const doc = ref.current?.contentDocument;
        if (doc) {
            setHeight(doc.documentElement.scrollHeight);
        }
    }

    return (
        <iframe
            ref={ref}
            srcDoc={injected}
            onLoad={onLoad}
            className="w-full border-0 block"
            style={{ height }}
            title="Kvittering"
            sandbox="allow-same-origin"
        />
    );
}
