import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cog, X } from "lucide-react";
import { ENGINE_NOTES } from "../data/engineNotes";

function Entry({ note }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid var(--border-soft)" }} className="py-5">
      <button className="w-full text-left" onClick={() => setOpen((o) => !o)}>
        <div className="mono text-xs mb-2" style={{ color: "var(--text-faint)" }}>
          {note.category}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-medium" style={{ color: open ? "var(--accent-gold)" : "var(--text-primary)" }}>
            {note.title}
          </h4>
          <span
            className="mono text-xs flex-shrink-0 transition-transform duration-200"
            style={{ color: "var(--text-faint)", transform: open ? "rotate(90deg)" : "none" }}
          >
            →
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
          {note.summary}
        </p>
      </button>
      {open && (
        <div
          className="mt-4 text-xs whitespace-pre-line pl-4"
          style={{ color: "var(--text-muted)", lineHeight: 1.9, borderLeft: "1px solid var(--border-soft)" }}
        >
          {note.body}
        </div>
      )}
    </div>
  );
}

export default function InspectEngine() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 mono text-xs flex items-center gap-2 px-4 py-3 rounded-full glass-panel glass-panel-hover transition-colors duration-150 z-40"
        style={{ color: "var(--text-muted)" }}
      >
        <Cog size={14} />
        inspect engine
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(4, 6, 12, 0.6)" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-50 glass-panel overflow-y-auto"
              style={{ background: "#0d1220" }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="mono text-xs tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>
                      INSPECT ENGINE
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Under the hood
                    </h3>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ color: "var(--text-faint)" }}>
                    <X size={20} />
                  </button>
                </div>
                <p className="text-xs mt-2 mb-2" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                  The real design decisions and real bugs behind these numbers — pulled
                  from the rating system's own 44-page design journal.
                </p>

                {ENGINE_NOTES.map((note) => (
                  <Entry key={note.id} note={note} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
