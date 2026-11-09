package fr.intformation.formations.infrastructure;
import fr.intformation.formations.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
import java.time.Clock;
@Configuration
class FormationConfiguration {
    @Bean FormationService formationService(FormationStore store,AccessStore accounts,Clock clock){return new FormationService(store,accounts,clock);}
}
