export default function Spinner({ full = false }) {
  const ring = (
    <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
  );
  if (!full) return ring;
  return <div className="flex min-h-[50vh] items-center justify-center">{ring}</div>;
}
