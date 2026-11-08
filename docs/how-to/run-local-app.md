---
title: "Comment lancer et vérifier la première fonctionnalité"
created: 2026-11-08
updated: 2026-11-08
status: accepted
type: how-to
---

# Comment lancer et vérifier la première fonctionnalité

## Sommaire

- [Préparer](#préparer)
- [Construire et lancer](#construire-et-lancer)
- [Se connecter](#se-connecter)
- [Exécuter les validations](#exécuter-les-validations)

## Préparer

Ouvrir le dépôt dans le [devcontainer](dev-container.md). Avec Podman rootless, utiliser la configuration `podman/devcontainer.json` et reconstruire le conteneur après une modification de ses montages. Le socket Podman doit être actif sur l’hôte ; il est nécessaire aux tests Testcontainers.

## Construire et lancer

Toutes les commandes suivantes s’exécutent dans le devcontainer, depuis la racine du dépôt :

```bash
npm --prefix frontend ci
npm --prefix frontend run generate:api
npm --prefix frontend run build
cd backend
./mvnw package
java -jar target/pole-formation-0.1.0-SNAPSHOT.jar --spring.profiles.active=dev
```

Ouvrir le port transféré **8080**. L’interface et l’API sont servies par Spring Boot sous la même origine. Arrêter l’application avec Ctrl+C.

Pour travailler sur le frontend avec rechargement automatique, lancer `npm --prefix frontend run dev` dans un autre terminal. Le port 5173 utilise un proxy `/api` vers le backend sur 8080.

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

Avec `gestionnaire` ou `admin`, utiliser le bouton **Domaines** pour rejoindre le référentiel. Créer un domaine, modifier son code/libellé ou confirmer sa désactivation. Les domaines désactivés restent dans le tableau et leur code ne peut pas être réutilisé. Ouvrir les détails « Sous-domaines de… » pour consulter l’historique existant. Les codes techniques `MIG-…` des anciennes lignes peuvent être remplacés par des codes métier uniques.

Utiliser **Sous-domaines**, puis sélectionner un domaine dans le filtre pour consulter sa liste. Cliquer sur **Créer un sous-domaine**, choisir un parent actif, saisir code et libellé, puis enregistrer. En modification, changer code/libellé ; le domaine parent reste fixé à la création. Pour désactiver, confirmer le dialogue puis ouvrir « Compétences de… » : les compétences déjà rattachées restent consultables. Le code d’un sous-domaine désactivé ne peut pas être réutilisé, même dans un autre domaine.

Si un autre gestionnaire a modifié une fiche, utiliser **Recharger la fiche** dans le dialogue avant de refaire la modification. La navigation **Sessions** et **Journal** reste disponible selon les droits du compte.

Avec `admin` ou `gestionnaire`, consulter **Journal des changements sensibles**, puis filtrer par type ou session. Avec `admin`, ouvrir « Exemple — Session clôturée » et changer effectivement la présence de Camille Exemple : le journal affiche la correction avec auteur, date UTC et états avant/après. Un enregistrement du même état n’ajoute pas de changement fictif.

Pour retrouver les deux événements d’une participation, choisir le type « Participations » et renseigner son identifiant dans le filtre d’objet. Les désistements/réactivations et modifications de planning sont actuellement accessibles par les endpoints du [contrat d’audit](../../api/audit.openapi.yaml) ; leurs formulaires complets seront ajoutés dans les stories correspondantes. Les événements antérieurs restent conservés après redémarrage.

## Exécuter les validations

Depuis la racine du dépôt, avec l’application lancée sur 8080 pour Playwright :

```bash
npm --prefix frontend run typecheck
npm --prefix frontend test
npm --prefix frontend run test:e2e
cd backend
./mvnw test
python3 check-security-mutations.py
./mvnw test
```

Le contrôle de mutations restaure les sources même en cas d’échec. Il modifie temporairement les sources : ne pas lancer une autre compilation backend en parallèle. Le dernier `./mvnw test` recompile les sources restaurées.

Les tests serveur créent leurs propres PostgreSQL temporaires et ne réutilisent pas la base de développement. Les tests navigateur utilisent les comptes fictifs de la base dev et restaurent le rôle qu’ils changent ; ils enregistrent une présence sur la session d’exemple. Les scénarios des domaines et sous-domaines créent des données de recette conservées dans la base locale, faute de suppression physique dans le MVP.

Après une interruption brutale des tests, vérifier les conteneurs temporaires restants avec Podman sur l’hôte. Ne pas supprimer le volume de développement pour nettoyer les tests. Voir le [rapport de validation](../reference/quality/us-08-01-validation.md).
