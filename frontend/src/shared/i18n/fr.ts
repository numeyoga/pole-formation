import type { Role } from '../../features/access/presentation/models';
export const roles: Record<Role,string> = {INTERVENANT:'Intervenant',GESTIONNAIRE:'Gestionnaire',ADMINISTRATEUR_FONCTIONNEL:'Administrateur fonctionnel'};
export const states: Record<string,string> = {INSCRITE:'Inscrite',PRESENTE:'Présente',ABSENTE:'Absente',DESISTEE:'Désistée',BROUILLON:'Brouillon',PLANIFIEE:'Planifiée',TERMINEE:'Terminée',ANNULEE:'Annulée'};
export const subdomainMessages={title:'Sous-domaines de compétences',refresh:'Actualiser les sous-domaines',status:'État des sous-domaines',loading:'Chargement des sous-domaines…',empty:'Aucun sous-domaine.',table:'Tableau des sous-domaines',caption:'Sous-domaines et domaines parents, y compris les parents désactivés',pagination:'Pagination des sous-domaines',previous:'Sous-domaines précédents',next:'Sous-domaines suivants'};
export const messages = {
  title:'Pôle formation', login:'Se connecter', logout:'Se déconnecter', username:'Identifiant', password:'Mot de passe',
  loading:'Chargement…', sessions:'Sessions accessibles', empty:'Aucune session accessible pour ce compte.',
  participants:'Participants', noParticipants:'Aucun participant pour cette session.', retry:'Réessayer',
  forbidden:'Vous ne disposez pas des droits nécessaires.', expired:'Votre session a expiré. Connectez-vous à nouveau.',
  network:'Le service est indisponible. Réessayez.', invalidLogin:'Identifiant ou mot de passe incorrect.',
  saved:'Modification enregistrée.', accounts:'Habilitations', confirm:'Confirmer le changement de rôle', cancel:'Annuler',
};
