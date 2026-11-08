---
title: "ADR 0011 — Sous-domaines et conservation des rattachements"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: decision
---

# ADR 0011 — Sous-domaines et conservation des rattachements

## Sommaire

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

## Contexte

US-01.02 complète le raccordement minimal livré avec les domaines. REF-02 valide l’unicité globale sans casse du code, sa réservation après désactivation, les limites de champs et le domaine parent fixé à la création. Le schéma V3 ne portait que l’identité, le parent et le libellé d’un sous-domaine.

## Décision

La migration V4 conserve ces trois valeurs et ajoute code, activation et version. Les codes techniques `MIG-…` attribués aux lignes héritées restent stables au redémarrage et sont modifiables. L’index unique PostgreSQL sur `lower(code)` concerne tous les sous-domaines, actifs ou désactivés, indépendamment du domaine parent.

Le module `referentiel` porte les règles et les cas d’utilisation. La création verrouille le même domaine parent que sa désactivation, puis vérifie son activation. La modification et la désactivation verrouillent le sous-domaine et exigent la version lue. Une version périmée produit 409. Le parent est contrôlé dans le domaine et déclaré non modifiable dans le mapping JPA ; un autre `domainId` envoyé au PUT est refusé explicitement.

Les anciens GET/POST imbriqués sous `/domaines/{id}/sous-domaines` restent compatibles et passent désormais par le même service. Le POST historique par seul libellé reçoit un code technique `MIG-…`. L’ancien chemin d’écriture JDBC dans `PostgresDomainStore` est retiré.

Une table minimale de compétences et un raccordement par libellé démontrent la conservation de leur identité et de leur parent après désactivation du sous-domaine. La création d’un rattachement verrouille le sous-domaine, comme sa désactivation, et vérifie qu’il est actif. Aucun effacement ni désactivation en cascade n’est appliqué. Ce raccordement ne livre pas l’administration complète des compétences de US-01.03.

L’interface utilise un adaptateur OpenAPI, une liste filtrable incluant les parents désactivés, des dialogues natifs et l’éligibilité des parents fournie par le serveur pour la création. Le parent apparaît en lecture seule lors de la modification. Les compétences historiques restent consultables.

## Conséquences

La désactivation d’un domaine ne désactive pas automatiquement ses sous-domaines ; elle bloque seulement la création de nouveaux sous-domaines sous ce parent. La désactivation d’un sous-domaine bloque les nouvelles compétences sans modifier les liens existants. Les sous-domaines désactivés gardent leur fiche et leurs champs éditables sous contrôle de version.

Les codes et autres modalités de l’administration des compétences restent à arbitrer lors de US-01.03. Ni suppression physique ni réactivation de sous-domaine n’est exposée dans cette tranche. Les droits `WRITE_REFERENTIAL` sont revérifiés au serveur pour chaque opération.

Références : [REF-02](../functional-baseline-v1.0/reference/decisions-metier.md), [contrat](../../api/subdomains.openapi.yaml), [rapport](../reference/quality/us-01-02-validation.md).
