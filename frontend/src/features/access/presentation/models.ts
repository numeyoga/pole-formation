export type Role = 'INTERVENANT' | 'GESTIONNAIRE' | 'ADMINISTRATEUR_FONCTIONNEL';
export interface Identity { username: string; role: Role; permissions: string[] }
export interface SessionView { id: string; title: string; state: string }
export interface ParticipantView { id: string; name: string; professionalId: string; state: string }
export interface AccountView { username: string; role: Role }
