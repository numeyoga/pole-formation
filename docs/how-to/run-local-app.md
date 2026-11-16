---
title: "Comment lancer et vérifier l’application locale"
created: 2026-11-08
updated: 2026-11-16
status: accepted
type: how-to
---

# Comment lancer et vérifier l’application locale

## Sommaire

- [Préparer](#préparer)
- [Construire et lancer](#construire-et-lancer)
- [Se connecter](#se-connecter)
- [Réinitialiser les données fictives](#réinitialiser-les-données-fictives)
- [Exécuter les validations](#exécuter-les-validations)

## Préparer

Préparer le [développement local avec Mise et services Podman](local-development.md). Les outils tournent sur l’hôte ; PostgreSQL et Chromium restent dans leurs conteneurs partagés. Le socket Podman doit être actif pour Testcontainers.

## Construire et lancer

Depuis la racine du dépôt, utiliser Mise pour les outils locaux :

```bash
mise run setup
mise run db:up
mise run build
mise run dev
```

Ouvrir le port transféré **8080**. L’interface et l’API sont servies par Spring Boot sous la même origine. Arrêter l’application avec Ctrl+C.

Pour travailler sur le frontend avec rechargement automatique, lancer `mise exec -- npm --prefix frontend run dev` dans un autre terminal. Le port 5173 utilise un proxy `/api` vers le backend sur 8080.

## Se connecter

Le profil `dev` fournit des **comptes et données fictifs de démonstration**, sans données de collaborateurs réels. Le mot de passe d’exemple commun est `Dev-only-2026!`.

| Identifiant | Rôle initial | Périmètre |
|---|---|---|
| `admin` | Administrateur fonctionnel | Toutes les sessions et changement des rôles |
| `gestionnaire` | Gestionnaire | Toutes les sessions, gestion courante |
| `intervenant` | Intervenant | Accueil, session clôturée et session à venir |
| `intervenant-b` | Intervenant | Prévention |
| `sans-affectation` | Intervenant | Aucune session |

Le profil par défaut ne charge ni ces comptes ni les données fictives. Les modifications de rôle sont persistées : redémarrer l’application ne réinitialise pas les habilitations. Restaurer les rôles via `admin` après un essai. Le provisionnement de production reste à définir.

Les pages sont accessibles dans la navigation latérale. Sur petit écran, ouvrir **Navigation**. Les liens peuvent être copiés et les boutons Précédent/Suivant du navigateur sont utilisables. Voir la [référence des écrans](../reference/frontend/navigation.md).

Avec `gestionnaire` ou `admin`, utiliser **Référentiel → Domaines** pour rejoindre le référentiel. Créer un domaine, modifier son code/libellé ou confirmer sa désactivation. Les domaines désactivés restent dans le tableau et leur code ne peut pas être réutilisé. Ouvrir les détails « Sous-domaines de… » pour consulter l’historique existant. Les codes techniques `MIG-…` des anciennes lignes peuvent être remplacés par des codes métier uniques.

Utiliser **Référentiel → Sous-domaines**, puis sélectionner un domaine dans le filtre pour consulter sa liste. Cliquer sur **Créer un sous-domaine**, choisir un parent actif, saisir code et libellé, puis enregistrer. En modification, changer code/libellé ; le domaine parent reste fixé à la création. Pour désactiver, confirmer le dialogue puis ouvrir « Compétences de… » : les compétences déjà rattachées restent consultables. Le code d’un sous-domaine désactivé ne peut pas être réutilisé, même dans un autre domaine.

Utiliser **Référentiel → Compétences**, filtrer par sous-domaine, puis **Créer une compétence** sous un parent actif. Saisir code et libellé. La modification conserve le parent ; la désactivation conserve la fiche et son historique, avec un code toujours réservé. Les anciens codes `MIG-…` sont modifiables.

Utiliser **Référentiel → Explorer le référentiel**, puis développer un domaine et un sous-domaine pour afficher les compétences. Pour une recherche, saisir un code ou un libellé de compétence puis **Rechercher les compétences** : chaque résultat présente le chemin complet et le statut de chacun des trois niveaux. **Parcourir la hiérarchie** quitte la recherche. Les éléments désactivés restent consultables ; la pagination existe aux différents niveaux.

Si un autre gestionnaire a modifié une fiche, utiliser **Recharger la fiche** dans le dialogue avant de refaire la modification. La navigation **Sessions** et **Journal** reste disponible selon les droits du compte.

Avec `admin` ou `gestionnaire`, consulter **Journal des changements sensibles**, puis filtrer par type ou session. Avec `admin`, ouvrir « Exemple — Session clôturée » et changer effectivement la présence de Camille Exemple : le journal affiche la correction avec auteur, date UTC et états avant/après. Un enregistrement du même état n’ajoute pas de changement fictif.

Pour retrouver les deux événements d’une participation, choisir le type « Participations » et renseigner son identifiant dans le filtre d’objet. Enregistrer les désistements et réinscriptions depuis la session dans **Sessions accessibles**, et modifier les créneaux ou intervenants depuis **Gérer les sessions** dans le catalogue de formations. Les mêmes opérations restent accessibles par les endpoints du [contrat d’audit](../../api/audit.openapi.yaml). Les événements antérieurs restent conservés après redémarrage.

Depuis **Catalogue**, utiliser **Gérer les sessions** sur la formation voulue. Pour une formation active, renseigner l’intitulé du brouillon, éventuellement une capacité entière positive et les modalités, puis créer. Ouvrir l’onglet **Créneaux**, puis ajouter au moins un créneau avec début, fin et décalage UTC explicite (`Z`, `+01:00`, etc.). Les créneaux enregistrés s’affichent en UTC. Revenir dans **Vue d’ensemble**, puis utiliser **Planifier la session** ; aucun intervenant ni capacité n’est obligatoire. En cas de version périmée, utiliser **Recharger la fiche** avant de refaire l’opération. Pour changer un créneau en Brouillon ou Planifiée, utiliser **Modifier ce créneau**, corriger les dates et le décalage puis enregistrer. Un ajout est également possible après planification. En cas de conflit entre sessions, vérifier les dates proposées puis choisir **Confirmer malgré les conflits** ou **Abandonner ce changement**. Les conflits existants sont recalculés à chaque changement. Un chevauchement interne reste bloquant. Les ajouts et modifications des sessions planifiées apparaissent dans le journal, au type Créneau. Les sessions terminées ou annulées sont en lecture seule.

Utiliser **Intervenants**, puis **Créer un intervenant** pour renseigner prénom, nom et coordonnées professionnelles facultatives. Aucun compte n’est nécessaire. Rechercher un nom et filtrer les actifs avec le formulaire. **Modifier** conserve les affectations ; **Désactiver** demande confirmation puis bloque les nouvelles affectations. Ouvrir **Sessions affectées** pour consulter l’historique, y compris après désactivation. Les sessions affichent aussi leurs intervenants affectés et leur statut. Une ancienne fiche sans prénom/nom structurés garde son libellé ; renseigner ces deux champs lors de sa première modification complète.

Depuis la fiche de gestion d’une session Brouillon ou Planifiée, ouvrir l’onglet **Intervenants**, puis **Gérer la coanimation**. Rechercher les intervenants actifs, cocher les personnes voulues, puis **Enregistrer les affectations**. Pour remplacer un coanimateur, décocher sa case ou utiliser **Retirer** et sélectionner son remplaçant. En cas d’avertissement, confirmer les affectations malgré les conflits ou abandonner. Les affectations déjà désactivées restent dans la sélection tant qu’elles ne sont pas retirées.

Utiliser **Collaborateurs**, puis **Créer un collaborateur**, pour renseigner identifiant professionnel, prénom et nom. Rechercher par identifiant ou nom pour retrouver la fiche, la modifier, la désactiver ou ouvrir **Participations**. Aucun profil d’emploi n’est à renseigner.

Dans **Sessions accessibles**, ouvrir une session planifiée, puis **Gérer les inscriptions**. Rechercher un collaborateur actif, le choisir et utiliser **Inscrire un collaborateur**. Confirmer les conflits éventuels seulement après les avoir examinés. Utiliser **Enregistrer le désistement de…** pour libérer sa place ; **Réinscrire…** réactive la même participation si une place est disponible. Après le dernier créneau, utiliser **Présente** ou **Absente** pour saisir la présence globale. Les corrections après clôture nécessitent le compte `admin` dans le jeu fictif.

Depuis **Gérer les sessions → Vue d’ensemble**, utiliser **Clôturer la session** après le dernier créneau et après avoir traité toutes les participations Inscrites. Pour une annulation, choisir **Annuler la session**, puis **Confirmer l’annulation** ; les créneaux, intervenants et états de participation restent consultables.

Utiliser **Pilotage** pour consulter les compteurs et l’activité. Ouvrir **Filtrer l’activité**, rechercher une formation si nécessaire, la sélectionner, renseigner les bornes UTC et l’état, puis **Appliquer les filtres du pilotage**. Ouvrir une session dans l’activité détaillée pour voir créneaux, intervenants et effectifs. Pour comprendre les bornes et les annulations séparées, consulter le [rapport des stories de pilotage](../reference/quality/validation-stories-2026-11-14.md).

## Réinitialiser les données fictives

Pour retrouver un jeu cohérent de recette après les essais et tests navigateur :

1. Arrêter l’application locale avec Ctrl+C.
2. Exécuter `mise run db:up`, puis `mise run db:reset-demo`.
3. Relancer `mise run dev` et se reconnecter avec un compte fictif ci-dessus.

La commande **efface toutes les données applicatives de `pole_formation_dev`**, y compris comptes, rôles modifiés et journal, puis installe le [jeu de démonstration](../reference/demo-data.md). Les cinq comptes sont recréés au redémarrage. Le script conserve le schéma et l’historique Flyway ; il refuse une autre base ou un autre rôle SQL. Il n’agit pas sur les bases Testcontainers ni sur les autres applications du service partagé.

Les scénarios de US-04.01 et US-04.02 se parcourent depuis « Profils d’emploi », puis le nom du profil et la rubrique « Formations correspondantes ». Choisir « Analyste de données » pour tester les deux paginations, « Coordinateur d’équipe » pour les besoins non couverts et les références historiques, et « Profil sans exigences » pour l’état vide.

## Exécuter les validations

Arrêter l’application avant les compilations backend pour ne pas remplacer son JAR pendant son exécution. Depuis la racine du dépôt :

```bash
mise run test:frontend
mise run test:backend
mise exec -- bash -c 'cd backend && python3 check-security-mutations.py'
mise run test:backend
```

Après ces contrôles, lancer `mise run dev` dans un terminal, puis exécuter `mise run test:e2e` dans un autre terminal avec l’application disponible sur 8080.

Le contrôle de mutations restaure les sources même en cas d’échec. Il modifie temporairement les sources : ne pas lancer une autre compilation backend en parallèle. Le dernier `./mvnw test` recompile les sources restaurées.

Les tests serveur créent leurs propres PostgreSQL temporaires et ne réutilisent pas la base de développement. Les tests navigateur utilisent les comptes fictifs de la base dev et restaurent le rôle qu’ils changent ; ils enregistrent une présence sur la session d’exemple. Les scénarios des domaines et sous-domaines créent des données de recette conservées dans la base locale, faute de suppression physique dans le MVP.

Après une interruption brutale des tests, vérifier les conteneurs temporaires restants avec Podman sur l’hôte. Ne pas supprimer le volume de développement pour nettoyer les tests. Voir le [rapport de validation](../reference/quality/us-08-01-validation.md).
