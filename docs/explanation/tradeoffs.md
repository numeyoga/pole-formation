---
title: "Compromis, risques et alternatives"
description: "Décisions prises et risques techniques/conceptuels à surveiller."
created: 2026-11-07
updated: 2026-11-07
status: accepted
type: explanation
tags:
  - architecture
  - risks
---

# Compromis, risques et alternatives

## Sommaire
- [Alternatives écartées](#alternatives-écartées)
- [Risques et mitigations](#risques-et-mitigations)

## Alternatives écartées

| Alternative | Motif de non-sélection au démarrage |
|---|---|
| Vue + PrimeVue | Très productif, mais moins aligné avec objectif Web Components Vanilla et CSS maîtrisé |
| Vue + Reka UI / shadcn-vue | Bonne approche headless, mais dépendante de Vue |
| Thymeleaf + HTMX | Simplicité serveur intéressante, moins adaptée à l'UI interactive envisagée |
| Tailwind / Open Props | Peu de gain réel face aux tokens maison et CSS Lit |
| Angular/React | Écosystèmes robustes, mais surcharge de choix ou conventions pour petite équipe |
| Microservices | Coût opérationnel non justifié |

## Risques et mitigations

| Risque | Mesure |
|---|---|
| Slab très jeune | Épingler version, isoler comportements critiques, tests clavier/axe, plan de substitution |
| Java 27 non-LTS | Vérifier support Spring et dépendances à chaque upgrade, CI répétable |
| Trop d'hexagonal | Ports uniquement aux vraies frontières ; privilégier lisibilité |
| Frontend reconstruit un framework | Router natif minimal, état local, HTML natif |
| Accessibilité supposée « offerte » | Audits axe + parcours clavier + tests manuels |
| Modèle métier surspécifié | Hypothèses ouvertes explicitement, arbitrage avant implémentation |
| Projection des acquis individuels | Invariant option B, tests métier explicites |
| CSS hétérogène généré par IA | Tokens, styles locaux, conventions vérifiées |

Lire aussi [registre](../reference/architecture/open-questions.md) et [ADR](../decisions/README.md).
