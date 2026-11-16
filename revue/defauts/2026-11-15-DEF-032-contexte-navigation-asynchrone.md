# DEF-032 — Dialogue et focus conservés hors de leur page

Observé le 2026-11-15 pendant l’intégration de la refonte, avant commit.

## Faits et causes

La revue du sous-agent a signalé deux cas. Deux tests ajoutés dans `frontend/tests/navigation.spec.ts` les ont reproduits sur le JAR : retour navigateur depuis la confirmation d’un rôle laissant le dialogue racine ouvert ; requête de participations interrompue après navigation focalisant son erreur globale sur le catalogue.

Le dialogue de rôle appartient au shell, hors des pages masquées. La gestion d’erreur racine ne vérifiait pas si la navigation avait changé pendant l’attente réseau.

## Correction et variantes

Chaque navigation annule explicitement le dialogue de confirmation de rôle. Un compteur de navigation capturé au début d’une opération interdit de focaliser son erreur après un changement de contexte. Le message reste annoncé et les refus serveur restent actifs.

Les dialogues des panneaux métier sont dans leurs pages masquées : un test couvre retour depuis un dialogue collaborateur, interaction dans le catalogue et retour suivant. Les erreurs de ces panneaux ne peuvent focaliser un contrôle masqué. Le dialogue de rôle était le seul dialogue racine hors de ces pages.

## Barrière et prévention

Les tests de changement de page doivent inclure un dialogue ouvert et une requête en vol, pas uniquement des pages au repos. Les deux tests de régression sont conservés ; aucune temporisation arbitraire, l’interruption réseau est déclenchée après observation du focus de destination.
