# Checklist propre au projet

| # | Point de contrôle | Comment vérifier | Origine | Automatisé ? |
|---|---|---|---|---|
| 1 | Construire avec les fonctionnalités Dev Containers et tester sous l’utilisateur distant ; vérifier SQL et le montage de données de la version PostgreSQL | Rebuild puis `bash .devcontainer/check-environment.sh` et commande SQL du guide ; rejouer pour chaque moteur annoncé | DEF-001 | Script partiel ; orchestration et SQL manuels |
| 2 | Les libellés des champs sont explicites et le succès d’une ancienne action ne valide pas la suivante | Parcours Playwright de deux confirmations successives ; état final et focus vérifiés | DEF-002 | Oui, sur le changement de rôle |
| 3 | Les champs optionnels OpenAPI sont réellement facultatifs pour les DTO HTTP | Corps JSON omettant le champ ; valeur explicite et défaut observés par HTTP | DEF-003 | Oui, pour `confirmConflicts` |
| 4 | Les filtres proposent des options réellement sélectionnables | Sélection native puis résultat observé dans Playwright ; ne pas se fier au seul build | DEF-004 | Oui, pour Comptes et Participations |
| 5 | Chaque contrat utilise l’en-tête CSRF du helper de session existant | Générer les clients puis TypeScript strict avant le build | DEF-006 | Oui, typage des paramètres d’en-tête |
| 6 | Un contrôle de mutation ne valide jamais silencieusement un périmètre vide | `--list`, tests CLI des périmètres et refus d’une liste vide | DEF-007 | Oui, `scripts/tests/test_mutation_selection.py` |
| 7 | Aucun état ni méthode Lit ne redéfinit involontairement l’API DOM native | TypeScript strict et revue des noms (dont children) avant le build | DEF-005, DEF-008 | Oui, compilation stricte |
| 8 | Les items flex contenant un contrôle de largeur fixe peuvent se réduire en affichage étroit | Contraintes de taille minimale et contrôle scrollWidth à 375 pixels | DEF-009 | Oui, Playwright |

- Vérifier que chaque nouveau Web Component est enregistré dans le bundle livré, avec un import à effet de bord distinct des imports de types et un parcours navigateur de navigation (DEF-010).
- Pour tester un refus métier, satisfaire les autres préconditions et différencier les motifs partageant le même statut HTTP ; vérifier par mutation les gardes critiques (DEF-011).
- Arrêter le serveur avant de remplacer son JAR ; après redémarrage, vérifier accueil, assets, connexion et API métier sur le port de recette utilisé par l’utilisateur (DEF-012).
- Vérifier qu’un entier OpenAPI refuse réellement les fractions et les dépassements par HTTP ; un DTO Integer/Long et une colonne entière ne suffisent pas si la désérialisation effectue une coercition préalable (DEF-013).
- Attendre l’effet observable des interactions asynchrones (y compris le défilement natif au clavier) avec une assertion réessayée ; ne pas lire immédiatement la propriété et ne pas ajouter de pause fixe (DEF-014).

- Conserver `verbatimModuleSyntax` et distinguer imports de types et imports d’enregistrement ; vérifier chaque ouverture de composant dans le bundle de production (DEF-015, récurrence DEF-010).

- Construire les requêtes JSON structurellement, sans substitution dépendante de l’ordre des champs ; fournir une version courante et vérifier le motif exact des refus métier (DEF-016).

- Avant de focaliser un contrôle après un traitement asynchrone, rétablir sa disponibilité puis attendre le rendu ; vérifier aussi le focus quand le bouton de rechargement disparaît (DEF-017).

- Un aria-label contextualisant une action doit conserver l’intégralité du texte visible ; construire les deux à partir de la même ressource et vérifier axe avec le dialogue ouvert (DEF-018).

- Chaque pagination doit être adjacente aux éléments visibles qu’elle pilote, dans une section nommée avec total et page courante ; tester aussi une collection vide à côté d’une autre collection paginée (DEF-019).

- Vérifier le rendu au survol des boutons actifs et désactivés, y compris les variantes principales (DEF-020).

- Avec `useDefineForClassFields`, déclarer les propriétés réactives Lit avec `declare` et les initialiser dans le constructeur ; vérifier le contexte et les mises à jour dans un parcours navigateur après build (DEF-021).

- Si une ligne comporte plusieurs volets, sélectionner le volet par son nom visible et conserver les scénarios historiques des fonctionnalités voisines (DEF-022).
- Pour les données enrichies, cibler les participants par identité plutôt que position ; utiliser des préconditions temporelles explicites dans les tests de présence (DEF-023).

- Retrouver les données créées par un test via recherche ou pagination publique ; ne pas supposer leur présence en première page d’un catalogue partagé enrichi par les scénarios précédents (DEF-024).

- Sur une liste sans recherche, parcourir la pagination publique pour retrouver les fixtures ; refaire cette navigation après une sauvegarde réinitialisant la page (DEF-025).

- Pour un test de planning visant l’audit ou la concurrence, traiter les conflits préexistants de la session entière et vérifier le motif d’un refus ; tester l’avertissement séparément (DEF-026).

- Après une mutation, contrôler les sources restaurées avant toute reconstruction ; un script de mutation temporaire doit nettoyer aussi sur SIGTERM/SIGINT et ne jamais compter une interruption comme mutation détectée (DEF-027).
