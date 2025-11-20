import { useToast } from "@/src/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-4 py-3 rounded-lg bg-neutral-900 text-white shadow-xl border border-neutral-700 
          animate-in fade-in slide-in-from-top-4 max-w-sm transition-opacity duration-500
          ${!toast.open ? "opacity-0" : "opacity-100"}`}
        >
          <p className="font-semibold">{toast.title}</p>
          {toast.description && (
            <p className="text-sm opacity-80">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
