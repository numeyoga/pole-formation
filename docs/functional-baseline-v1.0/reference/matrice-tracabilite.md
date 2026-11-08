---
title: "Matrice de traçabilité"
created: 2026-11-07
updated: 2026-11-08
version: "1.5.0"
status: "baseline-v1.0"
diataxis: "reference"
---

# Matrice de traçabilité

## Sommaire

- [Matrice décision → user stories](#matrice-décision-user-stories)
- [Matrice story → dépendances et priorité](#matrice-story-dépendances-et-priorité)
- [Invariants ↔ recettes transversales](#invariants-recettes-transversales)
- [Références](#références)

## Matrice décision → user stories

Cette table relie les décisions explicitement validées aux fonctionnalités vérifiables du backlog.

| Décision | Stories couvertes |
|---|---|
| DEC-01 | US-01.01, US-01.02, US-01.03, US-01.04 |
| DEC-02 | US-02.02, US-02.03 |
| DEC-03 | US-03.02 |
| DEC-04 | US-03.01, US-05.01, US-06.02 |
| DEC-05 | US-06.01 |
| DEC-06 | US-05.04 |
| DEC-07 | US-06.02, US-06.03, US-06.04 |
| DEC-08 | US-02.02 |
| DEC-09 | US-05.02 |
| DEC-10 | US-06.01 |
| ARB-01 | US-06.03 |
| ARB-02 | US-05.01, US-06.02 |
| ARB-03 | US-05.04 |
| ARB-04 | US-05.02, US-05.04, US-06.02 |
| ARB-05 | US-06.02, US-06.04 |
| ARB-06 | US-05.05 |
| ARB-07 | US-06.03, US-08.01 |
| ARB-08 | US-05.05, US-07.01, US-07.02 |
| ARB-09 | US-01.01, US-01.02, US-01.03, US-02.02, US-03.02 |
| ARB-10 | US-06.01 |
| OUV-01 | US-05.01, US-06.02, US-06.04 |
| OUV-02 | US-05.01 |
| OUV-03 | US-05.05 |
| OUV-04 | US-06.03, US-08.02 |
| OUV-05 | US-08.01 |
| OUV-06 | US-05.02, US-05.04, US-06.02 |
| OUV-07 | US-06.01 |
| OUV-08 | US-03.01 |
| OUV-09 | US-05.02, US-05.04, US-08.02 |
| OUV-10 | US-05.05, US-07.01, US-07.02 |
| HB-01 | US-06.01 |
| HB-02 | US-05.03, US-08.01 |
| HB-03 | US-05.05, US-07.01 |
| HB-04 | US-05.05, US-06.03 |
| HB-05 | US-05.02, US-08.02 |
| HB-06 | US-03.01 |
| SEC-01 | US-02.02, US-06.03, US-08.01, US-08.02 |
| AUD-02 | US-05.02, US-06.02, US-06.03, US-08.02 |
| REF-01 | US-01.01 |
| REF-02 | US-01.02 |
| REF-03 | US-01.03 |

## Matrice story → dépendances et priorité

| Story | Epic | Priorité | Dépendances | Nombre de critères |
|---|---|---|---|---:|
| US-01.01 | EP-01 | Must | US-08.01 | 3 |
| US-01.02 | EP-01 | Must | US-01.01 | 3 |
| US-01.03 | EP-01 | Must | US-01.02 | 3 |
| US-01.04 | EP-01 | Must | US-01.01, US-01.02, US-01.03 | 3 |
| US-02.01 | EP-02 | Must | US-08.01 | 3 |
| US-02.02 | EP-02 | Must | US-08.01 | 4 |
| US-02.03 | EP-02 | Must | US-01.03, US-02.01, US-02.02 | 3 |
| US-02.04 | EP-02 | Must | US-02.03 | 3 |
| US-03.01 | EP-03 | Must | US-08.01, US-08.02 | 4 |
| US-03.02 | EP-03 | Must | US-01.03, US-03.01 | 3 |
| US-03.03 | EP-03 | Must | US-03.01, US-03.02 | 3 |
| US-04.01 | EP-04 | Must | US-02.03, US-03.02, US-03.03 | 4 |
| US-04.02 | EP-04 | Must | US-04.01 | 4 |
| US-05.01 | EP-05 | Must | US-03.01, US-08.01 | 5 |
| US-05.02 | EP-05 | Must | US-05.01, US-08.02 | 6 |
| US-05.03 | EP-05 | Must | US-08.01 | 4 |
| US-05.04 | EP-05 | Must | US-05.01, US-05.02, US-05.03, US-08.02 | 5 |
| US-05.05 | EP-05 | Must | US-05.01, US-06.03, US-08.02 | 6 |
| US-06.01 | EP-06 | Must | US-08.01 | 5 |
| US-06.02 | EP-06 | Must | US-05.01, US-05.02, US-06.01, US-08.02 | 6 |
| US-06.03 | EP-06 | Must | US-05.04, US-06.02, US-08.01, US-08.02 | 7 |
| US-06.04 | EP-06 | Must | US-06.02, US-08.02 | 5 |
| US-07.01 | EP-07 | Must | US-03.01, US-05.05, US-06.02, US-06.03, US-06.04 | 5 |
| US-07.02 | EP-07 | Should | US-07.01 | 4 |
| US-08.01 | EP-08 | Must | — | 8 |
| US-08.02 | EP-08 | Must | US-08.01 | 6 |

## Invariants ↔ recettes transversales

| Recette | Invariants ou règles dominants |
|---|---|
| REC-01 | INV-01 à INV-06, RG-COR-01 |
| REC-02 | INV-07 à INV-09, RG-SES-04 |
| REC-03 | INV-10, INV-17, RG-SES-02 |
| REC-04 | INV-10, INV-17, RG-PAR-01 |
| REC-05 | INV-12, INV-13, RG-SES-05 |
| REC-06 | INV-19, RG-AUD-01 |
| REC-07 | RG-SEC-01, RG-SEC-02 |
| REC-08 | RG-SES-04, RG-SES-06, RG-AUD-01 |
| REC-09 | INV-18, INV-20, RG-PIL-02 |
| REC-10 | RG-FOR-01, RG-FOR-02 |

## Références

- [Décisions](decisions-metier.md)
- [Backlog](backlog-mvp.md)
- [Recette](../how-to/recette-fonctionnelle.md)
