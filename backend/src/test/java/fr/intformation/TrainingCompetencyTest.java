package fr.intformation;

import fr.intformation.referentiel.domain.TrainingCompetency;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;

class TrainingCompetencyTest {
    @Test void new_associations_require_an_active_competency_but_keep_its_historical_identity() {
        UUID id=UUID.fromString("52000000-0000-0000-0000-000000000003"),parent=UUID.fromString("51000000-0000-0000-0000-000000000003");
        var active=new TrainingCompetency(id,parent,"SEC","Sécurité",true,0);
        assertThatCode(active::requireActive).doesNotThrowAnyException();
        var inactive=new TrainingCompetency(id,parent,"SEC","Sécurité",false,1);
        assertThatThrownBy(inactive::requireActive).isInstanceOf(Conflict.class).hasMessageContaining("désactivée");
        var renamed=inactive.change(parent,"SEC-B","Sécurité historique",1L);
        assertThat(renamed.id()).isEqualTo(id);assertThat(renamed.subdomainId()).isEqualTo(parent);assertThat(renamed.active()).isFalse();
    }
}
