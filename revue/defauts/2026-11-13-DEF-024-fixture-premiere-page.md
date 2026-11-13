# DEF-024 — Formation de test supposée présente sur la première page

Observé le 2026-11-13 lors de la répétition complète de Playwright, après plusieurs passages ayant enrichi le catalogue fictif. Défaut introduit par l’agent dans la préparation des nouveaux tests de sessions.

## Cause

La fixture créait une formation de code `000-SES-…`, actualisait la première page puis cherchait son bouton de gestion. Les formations `000-FOR-…` créées par les parcours précédents se trient avant elle. Lorsque ces données dépassent la taille de page, la formation existe mais le bouton attendu n’est pas dans la page affichée. Le délai de 30 secondes ne pouvait pas résoudre cette absence déterministe.

## Correction et variantes

La fixture recherche explicitement le code créé via le formulaire du catalogue avant d’ouvrir ses sessions. Elle ne suppose plus de rang dans une page et continue sur la base enrichie, sans effacement ni augmentation de délai. Les deux tests partagent cette fixture et sont donc tous deux corrigés. La recherche des autres ouvertures de formation dans les nouveaux fichiers ne révèle pas d’autre chemin concerné ; les tests historiques du catalogue ont passé dans cette exécution.

## Barrière et prévention

Le premier passage ciblé avait trop peu de données concurrentes pour révéler le défaut. La répétition sur les données conservées l’a détecté. Une fixture de navigateur doit retrouver ses données par recherche ou pagination publique, jamais par une hypothèse sur la première page d’une collection enrichie par d’autres scénarios.
