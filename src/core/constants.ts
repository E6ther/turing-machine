export const DIGITS = [1, 2, 3, 4, 5] as const;

// Code index mapping:
//   code[0] = ▲ = Blue (三角)
//   code[1] = ■ = Yellow (方块)
//   code[2] = ● = Purple (圆)

export const ALL_CODES: [number, number, number][] = (() => {
  const codes: [number, number, number][] = [];
  for (let a = 1; a <= 5; a++)
    for (let b = 1; b <= 5; b++)
      for (let c = 1; c <= 5; c++)
        codes.push([a, b, c]);
  return codes;
})();
