const SHAPES = [
  "triangle",
  "square",
  "circle",
] as const;

export const SHAPE_COLORS = ["#56b3dc", "#febc11", "#7f66ad"];

interface ColorShapeProps {
  index: number;
  size?: number;
}

export function ColorShape({ index, size = 18 }: ColorShapeProps) {
  const color = SHAPE_COLORS[index];
  const shape = SHAPES[index];
  const s = size;

  if (shape === "triangle") {
    return (
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: `${s * 0.5}px solid transparent`,
          borderRight: `${s * 0.5}px solid transparent`,
          borderBottom: `${s}px solid ${color}`,
          display: "inline-block",
        }}
      />
    );
  }

  if (shape === "square") {
    return (
      <span
        style={{
          width: s,
          height: s,
          backgroundColor: color,
          borderRadius: 3,
          display: "inline-block",
        }}
      />
    );
  }

  return (
    <span
      style={{
        width: s,
        height: s,
        backgroundColor: color,
        borderRadius: "50%",
        display: "inline-block",
      }}
    />
  );
}
