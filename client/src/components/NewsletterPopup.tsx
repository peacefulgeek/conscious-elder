import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const dismissed = localStorage.getItem("nl_popup_closed");
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 35000);
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.45) { setShow(true); window.removeEventListener("scroll", onScroll); }
    };
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  const mutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (d: any) => { if (d?.success) { setStatus("success"); localStorage.setItem("nl_popup_closed", "1"); } else setStatus("error"); },
    onError: () => setStatus("error"),
  });

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!email) return; setStatus("loading"); mutation.mutate({ email, source: "popup" }); };
  const close = () => { setShow(false); localStorage.setItem("nl_popup_closed", "1"); };

  if (!show || status === "success") return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.5)" }} onClick={close}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5 text-gray-400" /></button>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Stay in the loop</h3>
        <p className="text-sm text-gray-500 mb-4">Get insights delivered free. No spam, unsubscribe anytime.</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400" />
          <button type="submit" disabled={status === "loading"} className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">{status === "loading" ? "Joining\u2026" : "Join Free"}</button>
        </form>
        {status === "error" && <p className="text-xs text-red-500 mt-2">Something went wrong. Try again.</p>}
        <p className="text-xs text-gray-400 mt-3 text-center">We respect your privacy.</p>
      </div>
    </div>
  );
}
