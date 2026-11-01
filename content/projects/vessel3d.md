## Engineering purpose
Conceptual ship models are more useful when geometry and naval architecture properties can be explored together. Vessel3D brings ship visualization into the browser using Three.js.

## My contribution
The public repository names me as the author, with academic and technical support from NTNU and ShipLab. It acknowledges Vessel.js as groundwork rather than presenting the library as independent of that earlier work.

My commits include the live editor, linking drag controls to ship calculations, and updates to stability calculations and ship-component interactions. The live editor allows code and a rendered model to be viewed together.

## Methods and implementation
The library builds on JavaScript and Three.js. It accepts hull data in the Vessel.js format and includes basic hydrostatics and stability functionality. A scene can combine a hull, compartments, an ocean, and coordinate helpers.

## Demonstrated capability
The default editor example builds and renders a conceptual vessel from code. The library is an early-stage conceptual modelling tool; the presence of stability calculations does not establish certification or suitability for design approval.

The [Gunnerus visualization](/projects/gunnerus-visualization/) shows a related use of browser-based vessel models in the wider ShipLab work.
