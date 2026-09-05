import { useState } from "react";
import { ChevronDown } from "lucide-react";
import threatMapAssetUrl from "@/assets/threat-map.png";
import { Panel } from "./primitives";

const views = ["Global View", "Americas", "EMEA", "APAC"];

export function ThreatMap() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(views[0]);

  return (
    <Panel className="relative">
      {/* Custom absolute header so it overlays the map */}
      <header className="absolute top-0 z-20 flex w-full items-center justify-between gap-2 bg-transparent px-3 py-[7px]">
        <h2 className="panel-title truncate flex items-center gap-1.5 rounded-md border border-cyan/25 bg-cyan/8 px-2 py-[3px] backdrop-blur-sm text-cyan neon-text-cyan">Threat Map</h2>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-cyan/25 bg-cyan/8 px-2 py-[3px] text-[10.5px] text-cyan neon-text-cyan backdrop-blur-sm"
          >
            {view} <ChevronDown size={12} />
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-30 mt-1 w-[120px] rounded-md border border-cyan/20 bg-background/95 p-1 text-[11px] shadow-lg backdrop-blur-md">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setView(v);
                    setOpen(false);
                  }}
                  className="block w-full rounded px-2 py-1 text-left text-muted-foreground hover:bg-cyan/10 hover:text-foreground"
                >
                  {v}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 50% 50%, rgba(0,140,255,0.14), transparent 70%)",
        }}
      />
      <img
        src={threatMapAssetUrl}
        alt="Global threat activity map"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ mixBlendMode: "screen" }}
      />
      </div>
    </Panel>
  );
}
