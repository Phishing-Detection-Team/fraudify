import { ExtensionPopup, ExtensionPopupSafe } from "@/components/ExtensionPopup";

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16 px-8">
      <div className="flex flex-col lg:flex-row gap-16 items-center justify-center flex-wrap w-full">
        {/* Threat detected variant */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Threat Detected
          </span>
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-r from-accent-red/20 to-accent-red/5 blur-3xl rounded-full pointer-events-none" />
            <ExtensionPopup />
          </div>
        </div>

        {/* Safe variant */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Looks Safe
          </span>
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-r from-accent-green/20 to-accent-green/5 blur-3xl rounded-full pointer-events-none" />
            <ExtensionPopupSafe />
          </div>
        </div>
      </div>
    </div>
  );
}
