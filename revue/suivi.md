# Suivi des constats

| ID | Gravité | Titre | Origine | Où | Statut | Commit / raison | Mis à jour |
|---|---|---|---|---|---|---|---|
| DEF-001 | 🟠 | Premier démarrage du devcontainer impossible sous Podman rootless | [fiche](defauts/2026-11-08-DEF-001-devcontainer.md) | `.devcontainer/` | corrigé | `27679e0` | 2026-11-08 |
| DEF-002 | 🟠 | Libellés et confirmation asynchrone des rôles | [fiche](defauts/2026-11-08-DEF-002-feedback-habilitations.md) | `frontend/src/features/access/components/access-app.ts` | corrigé | Inclus dans le commit `feat: implement access control (US-08.01, DEF-002)` ; quatre parcours Playwright réussis | 2026-11-08 |
| DEF-003 | 🟠 | Confirmation optionnelle refusée à la désérialisation | [fiche](defauts/2026-11-08-DEF-003-confirmation-optionnelle.md) | `backend/src/main/java/fr/intformation/audit/infrastructure/AuditController.java` | corrigé | Inclus dans le commit US-08.02 ; tests HTTP réussis | 2026-11-08 |
| DEF-004 | 🟠 | Option Comptes absente du filtre du journal | [fiche](defauts/2026-11-08-DEF-004-filtre-comptes.md) | `frontend/src/features/audit/components/audit-log.ts` | corrigé | Inclus dans le commit US-08.02 ; parcours de sélection et pagination réussi | 2026-11-08 |
| DEF-005 | 🟡 | Collision d’un état Lit avec HTMLElement.children | [fiche](defauts/2026-11-08-DEF-005-etat-dom-natif.md) | `frontend/src/features/domains/components/domains-panel.ts` | régressé | Inclus dans le commit US-01.01 ; renommage en childViews et TypeScript strict réussi | 2026-11-08 |
| DEF-006 | 🟡 | En-tête CSRF divergent dans un nouveau contrat | [fiche](defauts/2026-11-08-DEF-006-contrat-csrf.md) | `api/subdomains.openapi.yaml` | corrigé | Inclus dans le commit US-01.02 ; génération, TypeScript strict et build réussis | 2026-11-08 |
| DEF-007 | 🟠 | Sélection vide des mutations de compétences | [fiche](defauts/2026-11-08-DEF-007-selection-mutations.md) | `backend/check-security-mutations.py` | corrigé | Sélecteur conditionnel, refus du vide et quatre tests CLI réussis | 2026-11-08 |
| DEF-008 | 🟡 | Méthode Lit en collision avec HTMLElement.children | [fiche](defauts/2026-11-08-DEF-008-methode-dom-native.md) | `frontend/src/features/explorer/components/reference-explorer.ts` | corrigé | Renommage renderChildren et TypeScript strict réussi ; récurrence de DEF-005 | 2026-11-08 |
| DEF-009 | 🟠 | Débordement du formulaire de recherche à 375 pixels | [fiche](defauts/2026-11-08-DEF-009-largeur-formulaire-flex.md) | `frontend/src/features/explorer/components/reference-explorer.ts` | corrigé | Contrainte min-inline-size et max-inline-size du label ; test de largeur conservé | 2026-11-08 |
| DEF-010 | 🟠 | Composant absent après suppression d’un import de type | [fiche](defauts/2026-11-08-DEF-010-import-composant.md) | `frontend/src/features/access/components/access-app.ts` | régressé | Import à effet de bord explicite et test de navigation | 2026-11-08 |
| DEF-011 | 🟠 | Doublon masquant le garde d’activation dans un test | [fiche](defauts/2026-11-08-DEF-011-test-garde-activation.md) | `backend/src/test/java/fr/intformation/AccessHttpTest.java` | régressé | Nouvelle compétence, vérification du motif et mutation détectée | 2026-11-08 |
| DEF-012 | 🟠 | Serveur local conservé après reconstruction du JAR | [fiche](defauts/2026-11-08-DEF-012-jar-remplace-en-execution.md) | `mise.toml`, processus local 8080 | corrigé | Redémarrage ; accueil/assets 200, connexion 204, API profils 200 | 2026-11-08 |
| DEF-013 | 🟠 | Ordre JSON décimal accepté comme entier | [fiche](defauts/2026-11-08-DEF-013-entiers-json.md) | `classifications/infrastructure/ClassificationController.java` | corrigé | Conversion exacte ; 48 scénarios HTTP réussis après correction | 2026-11-08 |
| DEF-014 | 🟠 | Assertion avant la fin du défilement clavier | [fiche](defauts/2026-11-08-DEF-014-attente-defilement.md) | `frontend/tests/classifications.spec.ts:36` | corrigé | `expect.poll` ; cinq parcours de classifications réussis sur le JAR final | 2026-11-08 |

| DEF-015 | 🟠 | Éditeur non enregistré après suppression de son import | [fiche](defauts/2026-11-09-DEF-015-import-editeur.md) | `profiles-panel.ts`, `tsconfig.json` | corrigé localement | Import explicite, verbatimModuleSyntax et parcours Chromium ; récurrence DEF-010 | 2026-11-09 |

| DEF-016 | 🟠 | Version périmée masquant le contrôle d’inactivité | [fiche](defauts/2026-11-09-DEF-016-test-inactivite-version.md) | `AccessHttpTest.java` | corrigé localement | JSON structurel, motif explicite, mutation détectée ; récurrence DEF-011 | 2026-11-09 |

| DEF-017 | 🟠 | Focus demandé avant réactivation du formulaire | [fiche](defauts/2026-11-09-DEF-017-focus-formulaire-desactive.md) | `formations-panel.ts` | corrigé localement | Réactivation, rendu puis focus ; assertions navigateur sur édition et confirmation | 2026-11-09 |

| DEF-018 | 🟠 | Texte visible absent du nom accessible du bouton de compétences | [fiche](defauts/2026-11-10-DEF-018-nom-accessible-competences-formation.md) | `formations-panel.ts` | corrigé localement | Même ressource pour texte visible et nom accessible contextualisé ; audit axe conservé | 2026-11-10 |
