const COLORS = [
  '#68d391', '#63b3ed', '#f6ad55', '#fc8181', '#b794f4',
  '#76e4f7', '#f687b3', '#faf089', '#9ae6b4', '#fbb6ce',
];

export { COLORS };

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            borderColor: value === c ? '#fff' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}
