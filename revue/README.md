# Revues et défauts — Pôle formation

## Conventions

Les identifiants `DEF-NNN` sont uniques et jamais réutilisés. Gravité : 🔴 perte de données, faille ou exigence obligatoire compromise ; 🟠 défaut circonscrit ; 🟡 amélioration. Statuts : ouvert, en cours, corrigé, écarté, régressé. Une fiche close reste figée ; une régression reçoit une nouvelle fiche.

Le [suivi](suivi.md) contient les statuts courants et la [checklist](checklist-projet.md) les contrôles issus des défauts.

## Index des défauts

| ID | Date | Titre | Barrière manquante | Statut |
|---|---|---|---|---|
| [DEF-001](defauts/2026-11-08-DEF-001-devcontainer.md) | 2026-11-08 | Premier démarrage du devcontainer impossible sous Podman rootless | Construction et smoke test sous utilisateur distant | corrigé (`27679e0`) |
| [DEF-002](defauts/2026-11-08-DEF-002-feedback-habilitations.md) | 2026-11-08 | Libellés et confirmation asynchrone des rôles | Parcours navigateur avec opérations successives | corrigé, inclus dans le commit US-08.01 |
| [DEF-003](defauts/2026-11-08-DEF-003-confirmation-optionnelle.md) | 2026-11-08 | Confirmation optionnelle refusée à la désérialisation | Tests HTTP avec champs optionnels absents | corrigé, inclus dans le commit US-08.02 |
| [DEF-004](defauts/2026-11-08-DEF-004-filtre-comptes.md) | 2026-11-08 | Option Comptes absente du filtre du journal | Parcours navigateur avec sélection effective | corrigé, inclus dans le commit US-08.02 |
| [DEF-005](defauts/2026-11-08-DEF-005-etat-dom-natif.md) | 2026-11-08 | Collision d’un état Lit avec HTMLElement.children | TypeScript strict a bloqué le build | corrigé, inclus dans le commit US-01.01 |
| [DEF-006](defauts/2026-11-08-DEF-006-contrat-csrf.md) | 2026-11-08 | En-tête CSRF divergent dans un nouveau contrat | Types générés et TypeScript strict ont bloqué le build | corrigé, inclus dans le commit US-01.02 |
| [DEF-007](defauts/2026-11-08-DEF-007-selection-mutations.md) | 2026-11-08 | Sélection vide des mutations de compétences | Absence de contrat CLI du sélecteur et de refus des sélections vides | corrigé, US-01.03 |
| [DEF-008](defauts/2026-11-08-DEF-008-methode-dom-native.md) | 2026-11-08 | Méthode Lit en collision avec HTMLElement.children | Récurrence de DEF-005 arrêtée par TypeScript strict | corrigé, US-01.04 |
| [DEF-009](defauts/2026-11-08-DEF-009-largeur-formulaire-flex.md) | 2026-11-08 | Label flex empêchant la réduction du champ de recherche | Contrôle navigateur de la largeur du document | corrigé, US-01.04 |
| [DEF-010](defauts/2026-11-08-DEF-010-import-composant.md) | 2026-11-08 | Composant absent après suppression d’un import de type | Parcours navigateur après build | corrigé, US-02.01 |
| [DEF-011](defauts/2026-11-08-DEF-011-test-garde-activation.md) | 2026-11-08 | Doublon masquant le garde d’activation dans un test | Mutation ciblée du garde d’activation | corrigé, US-02.01 |
| [DEF-012](defauts/2026-11-08-DEF-012-jar-remplace-en-execution.md) | 2026-11-08 | Serveur local conservé après reconstruction du JAR | Vérification du port utilisé pour la recette après build | corrigé, US-02.01 |
| [DEF-013](defauts/2026-11-08-DEF-013-entiers-json.md) | 2026-11-08 | Ordre JSON décimal accepté comme entier | Test HTTP de fraction et conversion numérique exacte | corrigé localement, US-02.02 |
| [DEF-014](defauts/2026-11-08-DEF-014-attente-defilement.md) | 2026-11-08 | Assertion avant la fin du défilement clavier | Assertion réessayée sur l’effet observable | corrigé localement, US-02.02 |

| [DEF-015](defauts/2026-11-09-DEF-015-import-editeur.md) | 2026-11-09 | Éditeur non enregistré après suppression de son import | Imports explicites et verbatimModuleSyntax | corrigé localement, US-02.03 |

| [DEF-016](defauts/2026-11-09-DEF-016-test-inactivite-version.md) | 2026-11-09 | Version périmée masquant le contrôle d’inactivité | Préconditions explicites et assertion du motif | corrigé localement, US-02.03 |

| [DEF-017](defauts/2026-11-09-DEF-017-focus-formulaire-desactive.md) | 2026-11-09 | Focus demandé avant réactivation du formulaire | Assertions de focus après rechargement | corrigé localement, US-03.01 |

| [DEF-018](defauts/2026-11-10-DEF-018-nom-accessible-competences-formation.md) | 2026-11-10 | Texte visible absent du nom accessible du bouton de compétences | Axe label-content-name-mismatch | corrigé localement, US-03.02 |
