---
title: "Jeu fictif de démonstration"
created: 2026-11-13
updated: 2026-11-13
status: accepted
type: reference
---

# Jeu fictif de démonstration

Jeu local explicitement fictif, destiné à la recette des fonctionnalités implémentées jusqu’à US-04.02. Les noms, codes et classifications sont des exemples, sans valeur de règle métier. Source : [scripts/dev-demo.sql](../../scripts/dev-demo.sql). La [procédure de réinitialisation](../how-to/run-local-app.md#réinitialiser-les-données-fictives) décrit son installation.

## Sommaire

- [Référentiels et catalogue](#référentiels-et-catalogue)
- [Correspondances attendues](#correspondances-attendues)
- [Sessions et accès](#sessions-et-accès)
- [Validation locale](#validation-locale)

## Référentiels et catalogue

- Trois domaines : Numérique et données, Prévention et sécurité, Management et coopération.
- Cinq sous-domaines, dont « Pratiques historiques » désactivé ; seize compétences, dont « LEG-01 » désactivée.
- Trois classifications d’exemple : Essentiel et Recommandé actives, Classification historique inactive.
- Quatre profils et dix-sept exigences classifiées. Aucun lien collaborateur–profil et aucune compétence acquise individuellement.
- Quinze formations : douze actives, deux archivées, un brouillon. Vingt-six associations de compétences, conservées sur les archives.

`F-DATA-00` (« Panorama de l’analyse de données ») couvre les douze compétences de données. Dix ateliers spécialisés couvrent chacun une de ces compétences. `F-PREV-01` couvre l’identification des risques professionnels. Les archives `F-MAN-ARCH` et `F-DATA-ARCH` illustrent les anciens liens ; la première conserve notamment une compétence inactive. `F-MAN-DRAFT` est en préparation, sans association de compétences.

## Correspondances attendues

| Code du profil | Formations pertinentes | Besoins non couverts |
|---|---:|---|
| ANALYSTE | 11, dont le panorama une seule fois malgré douze compétences communes | MAN-01 — Animer une réunion d’équipe |
| COORDINATEUR | 1 : Prévenir les risques professionnels | MAN-01 et LEG-01, couvertes seulement par une archive |
| OBSERVATEUR | 0 : profil sans exigences | Aucun |
| ANCIEN | 0 : profil désactivé avec une exigence historique | LEG-01 |

Le panorama expose deux classifications dans les compétences communes du profil Analyste, avec dix compétences sur la première page et deux sur la seconde. Les formations pertinentes de ce profil occupent également deux pages : dix puis une. Neuf ateliers actifs restent visibles sans session planifiée. Aucun score ou classement de pertinence n’est présent.

## Sessions et accès

Quatre sessions et quatre créneaux sont liés à des formations : trois sessions planifiées à sept, quatorze et trente jours de la date de réinitialisation ; une session terminée trente jours auparavant, liée à une formation désormais archivée. Les créneaux vont de 9 h à 12 h dans le fuseau de la base PostgreSQL.

Trois collaborateurs fictifs, dont un inactif conservé dans l’historique ; sept participations avec les états Inscrite, Présente, Absente et Désistée. Deux intervenants fictifs sont affectés aux sessions.

Les cinq comptes habituels sont recréés au redémarrage avec leurs rôles initiaux. L’administrateur et le gestionnaire voient quatre sessions ; l’intervenant A en voit trois, l’intervenant B une et le compte sans affectation aucune. Mot de passe fictif et identifiants : [guide de lancement](../how-to/run-local-app.md#se-connecter).

Le journal est vide après la remise à zéro. Il enregistre les changements sensibles réalisés ensuite ; le seed n’invente pas d’événements historiques. Le schéma et l’historique des migrations sont conservés. Les tests navigateur ajoutent leurs propres données et peuvent de nouveau enrichir ce jeu.

## Validation locale

Remise à zéro effectuée le 2026-11-13 sur `pole_formation_dev` via le rôle applicatif, dans une transaction PostgreSQL complète. L’application a été arrêtée avant la remise à zéro puis redémarrée.

Vérifications par les API réelles, sans créer de données de recette supplémentaires : totaux des profils et formations, douze formations actives, correspondances et besoins des quatre profils, deux paginations du profil Analyste, deux classifications communes, offre sans session planifiée, archive conservant une compétence inactive, journal vide, connexion des cinq comptes et périmètres de sessions. Ces contrôles techniques ne remplacent pas la recette humaine des deux stories.
