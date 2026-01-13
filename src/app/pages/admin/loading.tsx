
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[600px] w-full flex flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
      <p>Loading...</p>
    </div>
  );
}
