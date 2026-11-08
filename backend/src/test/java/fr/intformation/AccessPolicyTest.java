package fr.intformation;

import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.habilitations.domain.AccessPolicy.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

class AccessPolicyTest {
    final AccessPolicy policy=new AccessPolicy();
    final Actor instructor=new Actor("intervenant",Role.INTERVENANT,UUID.randomUUID());
    final Actor admin=new Actor("admin",Role.ADMINISTRATEUR_FONCTIONNEL,null);
    @Test void fixed_roles_match_the_validated_permissions() {
        assertThat(Arrays.stream(Permission.values()).filter(p->policy.permits(instructor,p))).containsExactlyInAnyOrder(Permission.READ_SESSIONS,Permission.READ_PARTICIPANTS,Permission.WRITE_PRESENCE);
        var manager=new Actor("gestionnaire",Role.GESTIONNAIRE,null);
        assertThat(Arrays.stream(Permission.values()).filter(p->policy.permits(manager,p))).containsExactlyInAnyOrder(Permission.READ_SESSIONS,Permission.READ_PARTICIPANTS,Permission.WRITE_PRESENCE,Permission.WRITE_REFERENTIAL,Permission.READ_REPORTING);
        assertThat(Arrays.stream(Permission.values()).allMatch(p->policy.permits(admin,p))).isTrue();
    }
    @Test void administrator_cannot_bypass_last_slot_or_cancellation() {
        Instant now=Instant.parse("2026-11-08T12:00:00Z");
        assertThatThrownBy(()->policy.requirePresence(admin,new Session(UUID.randomUUID(),"À venir","PLANIFIEE",now.plusSeconds(1)),false,now)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->policy.requirePresence(admin,new Session(UUID.randomUUID(),"Annulée","ANNULEE",now.minusSeconds(1)),false,now)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->policy.requirePresence(admin,new Session(UUID.randomUUID(),"Sans créneau","BROUILLON",null),false,now)).isInstanceOf(Conflict.class);
    }
    @Test void last_slot_end_is_inclusive_and_a_missing_instructor_link_is_not_an_assignment() {
        Instant now=Instant.parse("2026-11-08T12:00:00Z");
        assertThatCode(()->policy.requirePresence(instructor,new Session(UUID.randomUUID(),"Session","PLANIFIEE",now),true,now)).doesNotThrowAnyException();
        var unlinked=new Actor("sans-lien",Role.INTERVENANT,null);
        assertThatThrownBy(()->policy.requireSession(unlinked,Permission.READ_PARTICIPANTS,true)).isInstanceOf(Forbidden.class);
    }
}
