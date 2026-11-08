---
title: "ADR 0012 — Administration des compétences"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0012 — Administration des compétences

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-01.03 étend le raccordement par libellé de US-01.02. REF-03 valide les mêmes conventions d’identité que pour les sous-domaines. Les profils, classifications d’exigence et formations ne sont pas encore administrables ; aucune association métier fictive ne doit être présentée comme livrée.

## Décision

Le module `referentiel` porte le domaine `TrainingCompetency`, le service applicatif, le port de catalogue et son adaptateur PostgreSQL. La migration V5 conserve les identités, parents et libellés de V4 et ajoute code, activation et version. Les codes techniques hérités `MIG-…` sont stables et modifiables. L’index unique sur `lower(code)` réserve les codes globalement, même après désactivation.

La création verrouille le sous-domaine, comme sa désactivation, et exige son activation. Le statut du domaine ancêtre ne désactive pas ses descendants par cascade : l’éligibilité dépend du sous-domaine immédiat, comme dans ADR 0011. La modification conserve le parent ; modification et désactivation exigent la version lue et refusent une version périmée par 409.

L’ancien POST imbriqué par libellé reste compatible et passe par le même catalogue ; son code est généré. Le GET historique expose aussi le code, le statut et la version. Les listes conservent les compétences inactives et les parents inactifs. L’interface Lit utilise un adaptateur OpenAPI, un filtre parent, des erreurs de champ et des dialogues HTML natifs.

Le port `CompetencyAvailability` protège la frontière des futurs cas d’utilisation d’association. Son adaptateur exige une transaction appelante et verrouille la compétence avant de vérifier son activation. Le futur écrivain conserve ce verrou jusqu’à l’insertion du lien dans la même transaction ; la désactivation attend le même verrou. Ce port ne crée ni profil, ni formation, ni lien métier à lui seul.

## Conséquences

Aucune suppression, réactivation ou modification de parent n’est exposée. Une compétence inactive reste consultable et ses champs éditables. Aucun rattachement historique n’est modifié par sa désactivation.

Le garde d’association est vérifié sur PostgreSQL réel. Les parcours d’association réels et leur conservation seront vérifiés dans US-02.03 et US-03.02, avec leurs entités et autorisations. Cette limite reste explicite dans le [rapport US-01.03](../reference/quality/us-01-03-validation.md).

Références : [REF-03](../functional-baseline-v1.0/reference/decisions-metier.md), [contrat OpenAPI](../../api/competencies.openapi.yaml), [ADR 0011](ADR-0011-subdomain-reference.md).
