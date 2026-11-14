package fr.intformation;
import fr.intformation.participations.domain.EnrollmentRules;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class EnrollmentRulesTest {
    @Test void admission_requires_an_active_collaborator_and_a_free_place_without_a_duplicate(){
        var rules=new EnrollmentRules();
        assertThatCode(()->rules.admit("PLANIFIEE",true,2,1,false)).doesNotThrowAnyException();
        assertThatCode(()->rules.admit("PLANIFIEE",true,null,100,false)).doesNotThrowAnyException();
        assertThatThrownBy(()->rules.admit("PLANIFIEE",true,2,2,false)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.admit("PLANIFIEE",false,null,0,false)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.admit("PLANIFIEE",true,null,0,true)).isInstanceOf(Conflict.class);
        assertThatThrownBy(()->rules.admit("BROUILLON",true,null,0,false)).isInstanceOf(Conflict.class);
    }
}
