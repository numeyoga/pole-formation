import type { Role } from '../../features/access/presentation/models';
export const roles: Record<Role,string> = {INTERVENANT:'Intervenant',GESTIONNAIRE:'Gestionnaire',ADMINISTRATEUR_FONCTIONNEL:'Administrateur fonctionnel'};
export const states: Record<string,string> = {INSCRITE:'Inscrite',PRESENTE:'Présente',ABSENTE:'Absente',DESISTEE:'Désistée',BROUILLON:'Brouillon',PLANIFIEE:'Planifiée',TERMINEE:'Terminée',ANNULEE:'Annulée'};
export const subdomainMessages={title:'Sous-domaines de compétences',refresh:'Actualiser les sous-domaines',status:'État des sous-domaines',loading:'Chargement des sous-domaines…',empty:'Aucun sous-domaine.',table:'Tableau des sous-domaines',caption:'Sous-domaines et domaines parents, y compris les parents désactivés',pagination:'Pagination des sous-domaines',previous:'Sous-domaines précédents',next:'Sous-domaines suivants'};
export const competencyMessages={title:'Compétences du référentiel',refresh:'Actualiser les compétences',status:'État des compétences',loading:'Chargement des compétences…',empty:'Aucune compétence.',table:'Tableau des compétences',caption:'Compétences et sous-domaines parents, y compris les parents désactivés',pagination:'Pagination des compétences',previous:'Compétences précédentes',next:'Compétences suivantes',create:"Créer une compétence",edit:"Modifier une compétence",disable:"Désactiver une compétence",filter:"Filtrer par sous-domaine parent",allParents:"Tous les sous-domaines",parent:"Sous-domaine parent",chooseParent:"Choisir un sous-domaine actif",labelColumn:"Libellé de la compétence",statusColumn:"Statut de la compétence",parentStatusColumn:"Statut du sous-domaine parent",actions:"Actions",saved:"Compétence enregistrée.",disabled:"Compétence désactivée. Les liens existants sont conservés.",reload:"Recharger la fiche",reloadCompetency:"Recharger la compétence",save:"Enregistrer la compétence",confirmDisable:"Confirmer la désactivation de la compétence",formStatus:"État du formulaire de compétence",disableStatus:"État de la désactivation de la compétence",saving:"Enregistrement en cours…",disabling:"Désactivation en cours…",parentHelp:"Le sous-domaine parent sera fixé à la création.",codeHelp:"64 caractères maximum. Le code est unique parmi toutes les compétences et reste réservé après désactivation.",disableHelp:"La compétence et ses liens historiques restent consultables. Les nouvelles associations seront interdites.",fixedParent:"Fixé à la création.",code:"Code",label:"Libellé",modify:"Modifier",deactivate:"Désactiver",};
export const messages = {
  title:'Pôle formation', login:'Se connecter', logout:'Se déconnecter', username:'Identifiant', password:'Mot de passe',
  loading:'Chargement…', sessions:'Sessions accessibles', empty:'Aucune session accessible pour ce compte.',
  participants:'Participants', noParticipants:'Aucun participant pour cette session.', retry:'Réessayer',
  forbidden:'Vous ne disposez pas des droits nécessaires.', expired:'Votre session a expiré. Connectez-vous à nouveau.',
  network:'Le service est indisponible. Réessayez.', invalidLogin:'Identifiant ou mot de passe incorrect.',
  saved:'Modification enregistrée.', accounts:'Habilitations', confirm:'Confirmer le changement de rôle', cancel:'Annuler',
};

export const explorerMessages={
  title:'Explorer le référentiel',refresh:'Actualiser le référentiel',description:'Parcourir les trois niveaux ou rechercher une compétence. Les éléments désactivés restent visibles.',
  query:'Code ou libellé de compétence',search:'Rechercher les compétences',browse:'Parcourir la hiérarchie',
  help:'Recherche par sous-chaîne sans casse. Le chemin et le statut de chaque niveau sont conservés.',
  status:'État de l’exploration',loading:'Chargement du référentiel…',resultCount:'compétence(s) trouvée(s).',domainCount:'domaine(s).',
  domain:'Domaine',subdomain:'Sous-domaine',competency:'Compétence',hierarchy:'Hiérarchie du référentiel',
  noSubdomains:'Aucun sous-domaine dans ce domaine.',noCompetencies:'Aucune compétence dans ce sous-domaine.',empty:'Aucun domaine dans le référentiel.',
  noResults:'Aucune compétence ne correspond à cette recherche.',results:'Résultats de la recherche',path:'Chemin',retryBranch:'Réessayer le chargement de',
  pagination:'Pagination de',domainPagination:'Pagination des domaines de l’exploration',resultPagination:'Pagination des résultats de recherche',previous:'Page précédente',next:'Page suivante',page:'Page',
};

export const profileMessages={
  "saved": "Profil enregistré.",
  "disabled": "Profil désactivé. Les exigences existantes sont conservées.",
  "title": "Profils d’emploi",
  "create": "Créer un profil",
  "refresh": "Actualiser les profils",
  "status": "État des profils",
  "loading": "Chargement des profils…",
  "empty": "Aucun profil. Créez le premier profil pour structurer le référentiel.",
  "table": "Tableau des profils",
  "caption": "Profils actifs et désactivés",
  "code": "Code",
  "label": "Libellé",
  "state": "Statut",
  "actions": "Actions et historique",
  "modify": "Modifier",
  "deactivate": "Désactiver",
  "requirements": "Exigences de",
  "requirementsLoading": "Chargement des exigences…",
  "requirementsRetry": "Réessayer les exigences",
  "requirementsEmpty": "Aucune exigence.",
  "pagination": "Pagination des profils",
  "previous": "Profils précédents",
  "next": "Profils suivants",
  "edit": "Modifier un profil",
  "formStatus": "État du formulaire de profil",
  "saving": "Enregistrement en cours…",
  "reload": "Recharger la fiche",
  "codeHelp": "64 caractères maximum. Code unique sans casse, réservé après désactivation.",
  "description": "Description",
  "cancel": "Annuler",
  "save": "Enregistrer le profil",
  "disable": "Désactiver un profil",
  "disableHelp": "Les exigences existantes restent consultables. Aucune nouvelle exigence ne pourra être ajoutée.",
  "disableStatus": "État de la désactivation",
  "disabling": "Désactivation en cours…",
  "confirmDisable": "Confirmer la désactivation"
};

export const classificationMessages={
 title:'Classifications',create:'Créer une classification',refresh:'Actualiser les classifications',status:'État des classifications',loading:'Chargement des classifications…',empty:'Aucune classification.',table:'Tableau des classifications',caption:'Classifications des exigences',code:'Code',label:'Libellé',order:'Ordre',state:'État',actions:'Actions',modify:'Modifier',edit:'Modifier une classification',pagination:'Pagination des classifications',previous:'Classifications précédentes',next:'Classifications suivantes',formStatus:'État du formulaire de classification',saving:'Enregistrement…',saved:'Classification enregistrée.',reload:'Recharger la fiche',codeHelp:'Code unique sans distinction de casse, conservé après désactivation.',cancel:'Annuler',save:'Enregistrer la classification',active:'Active',activationHelp:'Une classification désactivée reste visible sur les exigences existantes et ne peut plus être choisie pour une nouvelle exigence.'
};
