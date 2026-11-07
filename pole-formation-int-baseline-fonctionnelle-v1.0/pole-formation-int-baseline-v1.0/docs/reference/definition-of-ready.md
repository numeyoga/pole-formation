---
title: "Definition of Ready et Definition of Done"
created: 2026-11-07
updated: 2026-11-07
version: "1.0.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Definition of Ready et Definition of Done

## Sommaire

- [Definition of Ready (DoR)](#definition-of-ready-dor)
- [Definition of Done (DoD)](#definition-of-done-dod)
- [Références](#références)

## Definition of Ready (DoR)

Une story est prête à démarrer lorsque :

- [ ] Le bénéficiaire, le besoin et la valeur sont décrits.
- [ ] Le périmètre et les exclusions sont délimités.
- [ ] Les règles métier concernées sont identifiées et arbitrées.
- [ ] Les critères Given/When/Then sont vérifiables (nominal, erreurs, limites).
- [ ] Les autorisations nécessaires sont définies.
- [ ] Les dépendances sont identifiées.
- [ ] Les données de test et principaux cas de recette existent.
- [ ] La story est suffisamment petite pour être estimée ; sinon, elle est découpée sans perdre les critères.
- [ ] Le représentant métier accepte ces critères.

Une story contenant une convention proposée non arbitrée ne doit pas être déclarée prête si cette convention modifie son comportement.

## Definition of Done (DoD)

- [ ] Critères d’acceptation démontrés et validés.
- [ ] Tests unitaires couvrant invariants et transitions.
- [ ] Tests d’intégration couvrant persistance, concurrence sur la capacité et audit.
- [ ] Autorisations vérifiées au niveau de l’API, pas seulement de l’UI.
- [ ] Parcours E2E principaux vérifiés.
- [ ] Accessibilité contrôlée : clavier, focus, libellés, erreurs ; revue complémentaire aux outils automatiques.
- [ ] Migrations, documentation et traçabilité mises à jour.
- [ ] Aucun défaut bloquant/critique connu.
- [ ] Opérations sensibles et corrections auditées lorsque requis.

## Références

- [Backlog](backlog-mvp.md)
- [Guide de recette](../how-to/recette-fonctionnelle.md)
