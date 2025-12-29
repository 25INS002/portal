export default function SectionDivider() {
  return (
    <div className="relative my-24">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-4 text-xs uppercase tracking-widest text-muted-foreground">
          • • •
        </span>
      </div>
    </div>
  );
}
