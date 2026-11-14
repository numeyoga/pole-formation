package fr.intformation.participations.domain;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
public final class EnrollmentRules {
    public void admit(String sessionState,boolean active,Integer capacity,int occupied,boolean exists){
        if(!sessionState.equals("PLANIFIEE"))throw new Conflict("L’inscription nécessite une session planifiée.");
        if(!active)throw new Conflict("Le collaborateur est inactif.");
        if(exists)throw new Conflict("Une participation existe déjà. Réactivez-la en cas de désistement.");
        if(capacity!=null&&occupied>=capacity)throw new Conflict("La capacité de la session est atteinte.");
    }
}
