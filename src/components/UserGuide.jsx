import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { GUIDE_SECTIONS } from "../data/guideNotes";

function Section({ section }) {
  return (
    <div style={{ borderTop: "1px solid var(--border-soft)" }} className="py-5">
      <h4 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
        {section.title}
      </h4>
      <p className="text-xs whitespace-pre-line" style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
        {section.body}
      </p>
    </div>
  );
}

// Mirrors InspectEngine's drawer pattern (same shell, opposite side) —
// bottom-left / slide-from-left so the two floating buttons never
// compete for the same corner. This one is plain-language orientation
// for a first-time visitor; Inspect Engine is the methodology deep-dive
// for the curious. Kept as two separate entry points on purpose.
export default function UserGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 mono text-xs flex items-center gap-2 px-4 py-3 rounded-full glass-panel glass-panel-hover transition-colors duration-150 z-40"
        style={{ color: "var(--text-muted)" }}
      >
        <HelpCircle size={14} />
        how to use
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-full max-w-md z-50 glass-panel overflow-y-auto"
              style={{ background: "#0d1220" }}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="mono text-xs tracking-widest mb-2" style={{ color: "var(--text-faint)" }}>
                      HOW TO USE
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Getting around this site
                    </h3>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ color: "var(--text-faint)" }}>
                    <X size={20} />
                  </button>
                </div>
                <p className="text-xs mt-2 mb-2" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                  A quick orientation — four things to know before you dig in.
                </p>

                {GUIDE_SECTIONS.map((section) => (
                  <Section key={section.id} section={section} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
