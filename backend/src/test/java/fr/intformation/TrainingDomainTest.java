package fr.intformation;

import fr.intformation.referentiel.domain.TrainingDomain;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;

class TrainingDomainTest {
    @Test void fields_are_trimmed_bounded_and_not_blank(){
        var domain=new TrainingDomain(UUID.randomUUID()," CODE "," Libellé ",true,0);
        assertThat(domain.code()).isEqualTo("CODE");assertThat(domain.label()).isEqualTo("Libellé");
        assertThatThrownBy(()->new TrainingDomain(UUID.randomUUID()," ","Libellé",true,0)).isInstanceOf(TrainingDomain.InvalidField.class);
        assertThatThrownBy(()->new TrainingDomain(UUID.randomUUID(),"X".repeat(65),"Libellé",true,0)).isInstanceOf(TrainingDomain.InvalidField.class);
        assertThatThrownBy(()->new TrainingDomain(UUID.randomUUID(),"CODE","X".repeat(201),true,0)).isInstanceOf(TrainingDomain.InvalidField.class);
    }
    @Test void inactive_parent_and_stale_versions_are_rejected(){
        var domain=new TrainingDomain(UUID.randomUUID(),"CODE","Libellé",false,2);
        assertThatThrownBy(domain::requireActive).isInstanceOf(fr.intformation.habilitations.domain.AccessPolicy.Conflict.class);
        assertThatThrownBy(()->domain.change("AUTRE","Après",1L)).isInstanceOf(TrainingDomain.StaleVersion.class);
        assertThat(domain.change("AUTRE","Après",2L).id()).isEqualTo(domain.id());
    }
}
