# DEF-006 — En-tête CSRF divergent dans un nouveau contrat

Date : 2026-11-08. Gravité : 🟡, erreur arrêtée à la compilation avant livraison. Statut : corrigé, non commité. Erreur introduite par l’agent pendant US-01.02.

## Faits et cause

Le contrat `api/subdomains.openapi.yaml` exigeait initialement `X-XSRF-TOKEN`, alors que l’adaptateur partagé `frontend/src/shared/http/session.ts` fournit `X-CSRF-TOKEN`, conformément au contrat d’authentification existant. Après génération, TypeScript a signalé TS2741 sur les trois appels mutants : l’en-tête requis par le nouveau contrat manquait.

La cause est l’introduction d’une convention d’en-tête sans vérifier le contrat existant. Le typage généré et TypeScript strict ont constitué la barrière attendue et ont bloqué le build. Le nouveau contrat a été aligné sur `X-CSRF-TOKEN`, puis le client a été régénéré ; le build et les tests de mapping réussissent. Aucun formulaire utilisant le contrat erroné n’a été livré.

## Variantes et prévention

Recherche `X-XSRF-TOKEN|X-CSRF-TOKEN` dans `api/`, le helper de session et la configuration de sécurité : les autres contrats utilisent `X-CSRF-TOKEN` ; aucune autre occurrence de l’en-tête erroné ne subsiste. Les types générés sont alignés après régénération.

Prévention : conserver génération et TypeScript strict avant chaque build ; reprendre le contrat et le helper CSRF existants pour tout nouvel adaptateur. Les tests HTTP vérifient aussi le refus des écritures sans jeton. Aucun test n’est ajouté pour reproduire un diagnostic déjà garanti par le compilateur.
