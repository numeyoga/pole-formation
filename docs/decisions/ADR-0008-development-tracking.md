---
title: "ADR 0008 — Suivi du développement dérivé des preuves"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0008 — Suivi du développement dérivé des preuves

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Alternatives](#alternatives)
- [Conséquences](#conséquences)

## Contexte

Le représentant du projet a demandé le 2026-11-08 un registre central d’avancement maintenu automatiquement. Le backlog, les commits et rapports existaient, mais ne donnaient pas une vue unique des stories terminées ou restant à recetter.

## Décision

Une vue Markdown locale est générée depuis le backlog, l’historique Git et un manifeste de preuves versionné. Les hooks Git valident les métadonnées préparées et les références de stories, puis régénèrent la vue après commit, checkout et fusion. Leur activation est automatique à la création du devcontainer.

La vue est ignorée par Git afin d’éviter un fichier obsolète dès que son propre commit change le HEAD. Les commits et les preuves demeurent les sources pérennes. Le script et ses tests utilisent Python standard, exécuté dans le devcontainer.

Les statuts distinguent fondation partielle, implémentation à recetter, code à revalider et clôture. Une preuve technique est périmée lorsque le contenu du code diffère du commit validé ; aucun succès de test ni accord humain n’est inventé.

## Alternatives

Un tableau manuel dupliquerait le backlog et dériverait de l’historique. Un hook qui créerait lui-même un commit supplémentaire introduirait des boucles et compliquerait les commits par story. Un service distant imposerait une dépendance externe inutile pour ce dépôt local.

## Conséquences

La consultation est automatique ; les résultats techniques et acceptations humaines nécessitent toujours des preuves explicites. Les commits applicatifs doivent mentionner une story du backlog. Les hooks locaux doivent être installés et non contournés ; ils ne constituent pas une protection CI distante.

Voir la [référence](../reference/development-tracking.md) et le [guide](../how-to/track-development.md).
