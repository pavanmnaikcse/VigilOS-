import { Database, Hexagon, Box } from "lucide-react";
import { Panel, StatusDot } from "./primitives";

const services = [
  { name: "MongoDB", icon: Database },
  { name: "Neo4j", icon: Hexagon },
  { name: "ChromaDB", icon: Box },
];

function Radar() {
  return (
    <div className="relative grid h-full min-h-0 place-items-center">
      <div className="relative aspect-square h-full max-h-[104px]">
        {[100, 72, 46, 22].map((size) => (
          <span
            key={size}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20"
            style={{ width: `${size}%`, height: `${size}%` }}
          />
        ))}
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-cyan/15" />
        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-cyan/15" />
        <span
          className="animate-radar absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0,229,255,0.28), transparent 25%)",
          }}
        />
        <span
          className="animate-breathe absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan"
          style={{ boxShadow: "0 0 18px rgba(0,229,255,0.95)" }}
        />
      </div>
    </div>
  );
}

export function SystemHealth() {
  return (
    <Panel title="System Health">
      <div className="grid h-full grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2 px-3 py-0">
        <ul className="flex min-h-0 flex-col justify-center gap-0">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.name}
                className="flex items-center gap-2 border-b border-cyan/8 py-[4px] last:border-0"
              >
                <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border border-teal/25 bg-teal/10 text-teal">
                  <Icon size={13} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/85">
                  {s.name}
                </span>
                <StatusDot />
                <span className="text-[11px] text-teal">Online</span>
              </li>
            );
          })}
        </ul>
        <Radar />
      </div>
    </Panel>
  );
}
