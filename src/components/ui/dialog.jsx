import { useEffect } from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return children;
};

export const DialogContent = ({ className = "", children, onOpenChange }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange?.(false)}
      />

      {/* Modal Content */}
      <div
        className={`relative z-50 animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ className = "", children }) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ className = "", children }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ className = "", children }) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};
