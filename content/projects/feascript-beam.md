## Engineering purpose
A finite element implementation should make both the numerical model and its checks explicit. Beam bending is a useful example: a small implementation can be compared with classical solutions before tackling more complex structural systems.

## My contribution
FEAScript lists me as a contributor. The public history records my co-authored pull requests for the Euler–Bernoulli beam solver (#86, with cubic Hermite elements) and testing work (#83). The beam contribution includes boundary-condition handling, unit tests, and a regression example.

The work is part of the collaborative FEAScript library.

## Methods and implementation
Cubic Hermite interpolation represents both transverse displacement and rotation, providing the continuity needed for the fourth-order beam equation. The documented model supports fixed and pinned supports, prescribed rotations, point forces, moments, and spring supports.

For a cantilever with length $L$, constant bending stiffness $EI$, and a tip force $P$, the classical tip deflection is:

$$
w(L) = rac{PL^3}{3EI}
$$

## Demonstrated capability
The figure on this page was computed from the public FEAScript 0.3.1 cantilever example using 20 elements, $L=4$ m, $EI=100000$ N·m², and $P=-1000$ N. The computed tip deflection was checked against the classical expression before generating the plot.

This reference calculation checks one documented beam case. The contribution’s regression documentation also describes checks of element stiffness, cantilever response, and global equilibrium for its supported test cases.

[Download the computed figure as SVG](/images/optimized/feascript-beam.svg). The [project source](https://github.com/FEAScript/FEAScript-core) contains the solver and its tests.
