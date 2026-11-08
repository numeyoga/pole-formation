# Checklist propre au projet

| # | Point de contrôle | Comment vérifier | Origine | Automatisé ? |
|---|---|---|---|---|
| 1 | Construire avec les fonctionnalités Dev Containers et tester sous l’utilisateur distant ; vérifier SQL et le montage de données de la version PostgreSQL | Rebuild puis `bash .devcontainer/check-environment.sh` et commande SQL du guide ; rejouer pour chaque moteur annoncé | DEF-001 | Script partiel ; orchestration et SQL manuels |
| 2 | Les libellés des champs sont explicites et le succès d’une ancienne action ne valide pas la suivante | Parcours Playwright de deux confirmations successives ; état final et focus vérifiés | DEF-002 | Oui, sur le changement de rôle |
| 3 | Les champs optionnels OpenAPI sont réellement facultatifs pour les DTO HTTP | Corps JSON omettant le champ ; valeur explicite et défaut observés par HTTP | DEF-003 | Oui, pour `confirmConflicts` |
| 4 | Les filtres proposent des options réellement sélectionnables | Sélection native puis résultat observé dans Playwright ; ne pas se fier au seul build | DEF-004 | Oui, pour Comptes et Participations |
