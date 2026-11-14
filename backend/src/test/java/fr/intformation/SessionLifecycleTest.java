package fr.intformation;
import fr.intformation.sessions.domain.TrainingSession;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
class SessionLifecycleTest {
    @Test void completion_opens_exactly_at_the_end_of_the_last_slot(){
        Instant end=Instant.parse("2001-02-01T10:00:00Z");
        var session=new TrainingSession(UUID.randomUUID(),UUID.randomUUID(),"Exemple","PLANIFIEE",null,"",2,List.of(new TrainingSession.Slot(UUID.randomUUID(),end.minusSeconds(3600),end)),List.of());
        assertThatThrownBy(()->session.requireTransition(2L,"TERMINEE",end.minusNanos(1),false)).isInstanceOf(Conflict.class);
        assertThatCode(()->session.requireTransition(2L,"TERMINEE",end,false)).doesNotThrowAnyException();
        assertThatThrownBy(()->session.requireTransition(2L,"TERMINEE",end,true)).isInstanceOf(Conflict.class);
    }
}
