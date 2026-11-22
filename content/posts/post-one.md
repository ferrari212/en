+++
title = "Can AI solve the maritime industry's lifecycle information problem?"
date = 2026-11-21
summary = "How AI could help connect information across the maritime lifecycle, what makes its results trustworthy, and how my PhD research will explore the challenge."
tags = ["AI", "Digital Twin", "Industrial AI", "Maritime"]
projects = []
draft = false
+++

The maritime industry is composed from ship designers, shipyards, equipment suppliers, classification societies, shipowners, operators, and research organizations. Each stakeholder creates valuable information, but this information is commonly stored in tools and structures optimized for a particular lifecycle phase. Consequently, the intangible value created in one phase of the life cycle can be difficult to transfer to other parts of the life cycle, for example, knowledge created during design and construction can be difficult to reuse during operation, while operational experience is not always easily transferred back to later designs or sister vessels.

Digital ship models, system descriptions, analysis results, equipment information, sensor data, maintenance records, and engineering assessments represent different views of the same physical asset. Previous work has demonstrated the potential of open architectures and multiple taxonomies for connecting lifecycle views [<a href="#ref-1">1</a>, <a href="#ref-2">2</a>]. However, relationships between vessel configurations, engineering models, operational observations, and derived assessment results can remain implicit or fragmented because the difficult on orchestrating a data structure for the whole life cycle.

This challenge becomes particularly important in Digital Twin applications. Consider, for example, the structural engineering Digital Twin application: fatigue and integrity assessments may combine vessel configuration, finite-element and hydrodynamic models, operational history, environmental conditions, sensor information, and data-driven predictions. Artificial Intelligence (AI) techniques can help extract, link, query, and infer information across these sources, but engineering use requires more than prediction: the origin, assumptions, dependencies, uncertainty, and accuracy of results must remain traceable and quantifiable.

# Connecting lifecycle information

Ontologies, knowledge graphs, graph databases, multi-taxonomy structures, and hybrid approaches offer
different mechanisms for representing heterogeneous engineering knowledge. Existing research demonstrates
their potential for integrating ship models and supporting knowledge reuse [<a href="#ref-3">3</a>]. At the same time, recent maritime applications show that data-driven and physics-informed machine-learning methods can accelerate or improve engineering assessments [<a href="#ref-4">4</a>]. A remaining challenge is to connect these two directions: representing lifecycle engineering knowledge in a form that AI can use while preserving the context required for reliable engineering decisions.

My PhD project is organized around three key questions that are relevant to many maritime engineering applications:

1. How can different ship lifecycle information, engineering models, and operational data be represented and structured to enable reliable AI-supported applications across design, construction, and operation?
2. How can AI methods use ship data representations to extract, connect, query, and infer engineering knowledge, including dependencies, missing information, previous design knowledge, and data-driven assessment results?
3. How can AI-supported approaches be evaluated in realistic maritime engineering cases with respect to accuracy, risk, uncertainty, traceability, physical consistency, and interoperability?

Three complementary perspectives help explain how these questions can be approached.

First, **lifecycle interoperability** concerns how information about the same vessel is represented differently during design, construction, and operation. Open ship-data frameworks and multiple taxonomies illustrate both the value of lifecycle-specific views and the difficulty of maintaining compatibility between them [<a href="#ref-1">1</a>, <a href="#ref-2">2</a>]. In practice, this means checking whether information created for one phase can still be understood and reused in another.

Second, **semantic knowledge representation** describes engineering entities, relationships, origins, and dependencies in a machine-readable form. Ontologies and knowledge graphs have already been used to integrate heterogeneous ship-process information and support reuse [<a href="#ref-3">3</a>]. Making these connections explicit can help people and AI systems understand how different vessel models and engineering evidence relate to one another.

Third, **hybrid engineering intelligence** combines physical knowledge, operational data, and AI-generated information. Maritime studies have demonstrated the use of physics-informed machine learning for engineering prediction [<a href="#ref-4">4</a>]. For these approaches to support engineering work, the information representation needs to preserve model context, assumptions, uncertainty, and traceability. Engineering change propagation is a related example: understanding dependencies can help assess the consequences of a modification [<a href="#ref-5">5</a>].

# Conclusion

Returning to the question in the title—whether AI can solve the maritime industry’s lifecycle information problem—the answer is not simply yes. AI alone cannot address a challenge that also depends on stakeholders adopting shared practices and ways of connecting information. Its contribution will depend on whether data from different lifecycle phases can be linked while preserving the engineering context, assumptions, and uncertainty needed to interpret it.

These questions also guide my proposed PhD research, which will investigate how semantic representations and AI methods might support such connections in maritime engineering cases. For anyone considering AI for an engineering task, a useful starting point is to ask whether the information it relies on is connected and understandable, and whether its results can be checked before they inform a decision.

I would be interested to hear if others encounter these information gaps in practice, and what they would need to trust an AI-supported engineering result.

## References

<ol>
<li id="ref-1">Í. A. Fonseca, F. F. de Oliveira, and H. M. Gaspar. Open Framework for Digital Twin Ship Data: Case Studies on Handling of Multiple Taxonomies and Navigation Simulation. <em>International Journal of Maritime Engineering</em>, Vol. 165, No. A1, pp. A23–A42, 2023. <a href="https://doi.org/10.5750/ijme.v165iA1.813">https://doi.org/10.5750/ijme.v165iA1.813</a></li>
<li id="ref-2">F. F. de Oliveira, Í. A. Fonseca, and H. M. Gaspar. Applying Open Web Architectures Towards Collaborative Maritime Design and Simulation. <em>Proceedings of the ASME 2022 41st International</em> <a href="https://doi.org/10.1115/OMAE2022-81505">https://doi.org/10.1115/OMAE2022-81505</a></li>
<li id="ref-3">J. Dong, X. Jing, X. Lu, J. Liu, H. Li, X. Cao, C. Du, J. Li, and L. Li. Process Knowledge Graph Modeling Techniques and Application Methods for Ship Heterogeneous Models. <em>Scientific Reports</em>, Vol. 12, Article 2911, 2022. <a href="https://doi.org/10.1038/s41598-022-06940-y">https://doi.org/10.1038/s41598-022-06940-y</a></li>
<li id="ref-4">Q. Liang, P. Han, E. Vanem, K. E. Knutsen, and H. Zhang. A Hybrid Approach Integrating Physics-Based Models and Expert-Augmented Neural Networks for Ship Fuel Consumption Prediction. <em>Journal of Offshore Mechanics and Arctic Engineering</em>, Vol. 147, 2025. <a href="https://doi.org/10.1115/1.4066945">https://doi.org/10.1115/1.4066945</a></li>
<li id="ref-5">Y. Tsutsui, Y. Kogamoto, and A. Tsumaya. <em>Assessing the Risk of Functional Change Propagation in Early-Stage Redesign: A Network-Based Approach Integrating Qualitative and Quantitative Design Representations</em>. Procedia CIRP, Vol. 142, pp. 462–467, 2026. <a href="https://doi.org/10.1016/j.procir.2026.05.292">https://doi.org/10.1016/j.procir.2026.05.292</a></li>
</ol>
