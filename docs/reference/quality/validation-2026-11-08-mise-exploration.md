---
title: "Régressions et révisions validées — Mise et exploration"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: reference
---

# Régressions et révisions validées — Mise et exploration

## Sommaire

- [Révision et environnement](#révision-et-environnement)
- [Preuves techniques](#preuves-techniques)
- [Acceptation et limites](#acceptation-et-limites)

## Révision et environnement

La révision `44d06d0b10b65c6b6f754c71ec129801835f0ebf` consolide US-01.03, US-01.04 et la transition Mise/Podman introduite par `fa508e4`. Les sources testées correspondent à cette révision ; le commit suivant ne change que les preuves et métadonnées.

Les validations ont été exécutées avec Java et Node sur l’hôte via Mise. PostgreSQL utilise les conteneurs Podman (base de développement partagée et bases Testcontainers isolées) ; Chromium s’exécute dans `dev-playwright`. Aucun navigateur ni serveur PostgreSQL natif n’est nécessaire. Les anciens volumes restent conservés et le workspace de développement arrêté.

## Preuves techniques

| Contrôle | Résultat |
|---|---|
| Maven `clean verify` | 53 tests, aucun échec, erreur ou test ignoré |
| Génération OpenAPI, TypeScript strict, build Vite | Réussis |
| Vitest | 6 tests réussis, dont le mapping d’exploration |
| Playwright distant | 22 parcours réussis, sans retry, dont 4 pour l’exploration |
| Axe et largeur du document | Aucune violation dans les états contrôlés, absence de débordement aux viewports vérifiés |
| Mutations d’exploration | 4 contrôles serveur et une mutation de mapping détectés, sources restaurées |
| Python | 12 tests réussis, dont la sélection des périmètres de mutations |
| Métadonnées, liens locaux, diff | Vérifiés avant versionnement |

Les suites rejouent les régressions des habilitations, du journal, des domaines, des sous-domaines et des compétences. Leurs `validated_commit` peuvent donc référencer cette révision sans modifier les acceptations métier antérieures. Le socle historique du devcontainer conserve sa propre preuve ; les fichiers de `.devcontainer/` n’ont pas changé.

Les détails des scénarios et des défauts corrigés figurent dans les rapports [US-01.03](us-01-03-validation.md), [US-01.04](us-01-04-validation.md) et [environnement local](local-environment-validation.md).

## Acceptation et limites

US-01.03 est acceptée explicitement par le représentant du projet : voir l’[accord enregistré](acceptance-2026-11-08.md#validation-de-us-0103). US-01.04 a ensuite reçu son propre [accord utilisateur](acceptance-2026-11-08.md#validation-de-us-0104) sur la même révision, après présentation du bilan. Cet accord clôture la story sans réutiliser l’acceptation de US-01.03.

Les contrôles manuels de lecteur d’écran et de zoom à 200 % ne sont pas affirmés. La validation automatisée n’est pas une certification WCAG. Les futures associations réelles profil/formation sont vérifiées dans leurs stories respectives.
