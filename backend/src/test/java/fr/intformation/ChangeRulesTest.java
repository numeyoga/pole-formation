package fr.intformation;

import fr.intformation.audit.domain.ChangeRules;
import fr.intformation.audit.domain.ChangeRules.Interval;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

class ChangeRulesTest {
    final ChangeRules rules=new ChangeRules();
    final Instant start=Instant.parse("2026-11-08T09:00:00Z");
    @Test void adjacent_slots_are_valid_but_overlap_and_reversed_intervals_are_not() {
        var slot=new Interval(start,start.plusSeconds(3600));
        assertThatCode(()->rules.noOverlap(slot,List.of(new Interval(start.plusSeconds(3600),start.plusSeconds(7200))))).doesNotThrowAnyException();
        assertThatThrownBy(()->rules.noOverlap(slot,List.of(new Interval(start.plusSeconds(3599),start.plusSeconds(7200))))).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->new Interval(start,start)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void reactivation_requires_capacity_active_collaborator_and_the_correct_origin() {
        assertThatCode(()->rules.transition("DESISTEE","INSCRITE",true,null,100)).doesNotThrowAnyException();
        assertThatCode(()->rules.transition("INSCRITE","DESISTEE",false,1,1)).doesNotThrowAnyException();
        assertThatThrownBy(()->rules.transition("DESISTEE","INSCRITE",true,1,1)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.transition("DESISTEE","INSCRITE",false,null,0)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.transition("PRESENTE","DESISTEE",true,null,0)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.planned("TERMINEE")).isInstanceOf(Conflict.class);
    }
    @Test void cross_session_conflicts_can_be_confirmed_but_are_never_silent() {
        var conflicts=List.of(UUID.randomUUID());
        assertThatThrownBy(()->rules.confirm(conflicts,false)).isInstanceOf(ChangeRules.PlanningConflict.class);
        assertThatCode(()->rules.confirm(conflicts,true)).doesNotThrowAnyException();
    }
}
