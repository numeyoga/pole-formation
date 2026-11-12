# DEF-020 — Survol des boutons désactivés

Signalé le 2026-11-10 pendant la recette. Défaut visuel corrigé localement.

## Cause

Les sélecteurs `button:hover` s’appliquaient aussi aux boutons désactivés. Dans Chromium, le bouton « Se connecter » désactivé changeait de fond et se soulignait au passage du pointeur. La règle `:disabled` définissait l’opacité et le curseur. Les contrôles de clic et de clavier ne couvraient pas le rendu au survol.

## Correction

La condition `:where(:enabled)` réserve le survol aux boutons actifs et conserve la priorité des règles CSS. La recherche des variantes a identifié 11 règles dans 10 composants. Le contrôle Chromium avant et après correction confirme que le fond et le soulignement du bouton désactivé restent stables et que le bouton actif réagit au survol avec son texte blanc.

La checklist couvre désormais le survol dans les deux états. Build et 26 tests Vitest réussis.
