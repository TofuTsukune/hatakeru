interface Props {
  icon: string;
  message: string;
}

export function EmptyState({ icon, message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#a0aec0]">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
