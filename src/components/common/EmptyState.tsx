interface Props {
  icon: string;
  message: string;
}

export function EmptyState({ icon, message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--c-faint)' }}>
      <span className="text-4xl mb-3 opacity-40">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
