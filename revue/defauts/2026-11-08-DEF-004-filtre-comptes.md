# DEF-004 — Option Comptes absente du filtre du journal

Date : 2026-11-08. Gravité : 🟠, filtre local inutilisable pour ce type d’objet. Statut : corrigé, non commité. Erreur de balisage introduite par l’agent pendant US-08.02.

## Reproduction et cause

Le parcours Playwright de reprise réseau et pagination restait bloqué sur la sélection de `COMPTE`. L’inspection du DOM a confirmé l’absence de cette option : une balise d’ouverture avait été écrite comme une fermeture. Le navigateur affichait « Comptes » comme texte, sans option sélectionnable. TypeScript et le build Vite n’ont pas détecté cette erreur HTML.

## Correction et prévention

La balise est corrigée et chaque option est écrite sur sa propre ligne pour faciliter la relecture. Recherche des variantes dans le composant : les options Participations, Créneaux, Affectations et Sessions sont correctement balisées. Le scénario navigateur existant sélectionne Comptes et vérifie ensuite la pagination ; il constitue le test de non-régression. Les autres types ne sont pas supposés valides du seul fait de la compilation.
