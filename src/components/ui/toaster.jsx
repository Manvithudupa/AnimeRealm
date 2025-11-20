import { useToast } from "@/src/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-3 rounded-lg bg-neutral-800 text-white shadow-lg border border-neutral-700 animate-in fade-in slide-in-from-top-2"
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
