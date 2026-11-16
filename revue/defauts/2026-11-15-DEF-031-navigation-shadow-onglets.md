# DEF-031 — Navigation et focus dans les nouveaux écrans

Observé le 2026-11-15 pendant la refonte, avant commit.

## Faits et causes

Le lien d’évitement initial visait un identifiant situé dans le Shadow DOM. Axe signalait une cible absente et un contenu hors landmark. Le contrôle a été remplacé par un bouton nommé dans une navigation dédiée, qui focalise le titre principal.

Le scénario clavier de la fiche session échouait ensuite : Flèche droite depuis « Vue d’ensemble » ne focalisait pas « Créneaux ». La détection de la seule propriété `focusGroup` avait désactivé le gestionnaire clavier sans garantir le comportement tablist effectif dans Chromium utilisé. Les onglets utilisent maintenant un gestionnaire explicite Flèches/Home/End, sélection par Entrée/Espace, rôles et associations ARIA. Il s’agit d’un repli délibéré après vérification navigateur.

## Variantes et barrière

Recherche des occurrences `focusgroup` et des liens d’évitement : le nouvel ensemble d’onglets session et le shell étaient les seuls concernés. Les autres navigations sont des liens vers des pages, sans rôle tablist. Les tests navigateur clavier et axe ont détecté les défauts que typecheck et build ne pouvaient pas révéler.

## Prévention

Conserver le scénario clavier des onglets dans `frontend/tests/sessions.spec.ts` et axe sur la connexion et les pages dans `access.spec.ts` et `navigation.spec.ts`. Vérifier le comportement réel d’une API expérimentale, pas seulement la présence d’une propriété. Une cible d’évitement doit être atteignable à travers les frontières de composants.
