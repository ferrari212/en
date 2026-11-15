// Reproduce the public FEAScript cantilever example; no library code is copied.
// Usage: node scripts/figures/feascript-beam.cjs /path/to/FEAScript-core/dist/feascript.cjs
const { FEAScriptModel } = require(
  require("node:path").resolve(process.argv[2]),
);
const { writeFileSync } = require("node:fs");
const model = new FEAScriptModel();
const L = 4,
  EI = 100000,
  P = -1000,
  elements = 20;
model.setModelConfig("eulerBernoulliBeamScript", {
  coefficientFunctions: { EI: () => EI },
});
model.setMeshConfig({
  meshDimension: "1D",
  elementOrder: "linear",
  numElementsX: elements,
  maxX: L,
});
model.addBoundaryCondition("1", [["fixed"]]);
model.addBoundaryCondition(String(elements + 1), [["force", P]]);
model.setSolverMethod("lusolve");
const { fields } = model.solve();
const points = Array.from(fields.w, (w, i) => ({
  x: (i * L) / elements,
  w,
  exact:
    (P * ((i * L) / elements) ** 2 * (3 * L - (i * L) / elements)) / (6 * EI),
}));
if (Math.abs(points.at(-1).w - (P * L ** 3) / (3 * EI)) > 1e-8)
  throw Error("Reference cantilever check failed");
writeFileSync(
  "content/figures/feascript-cantilever.json",
  JSON.stringify(
    {
      source: "FEAScript/FEAScript-core",
      version: "0.3.1",
      sourceCommit: "c0dabd998cb47fd77969ee778bdebaf81c7c5563",
      method: "Euler-Bernoulli beam, cubic Hermite elements, LU solver",
      parameters: { L, EI, P, elements },
      points,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Reference tip deflection check PASS; wrote computed nodal values.",
);
