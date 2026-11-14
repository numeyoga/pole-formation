package fr.intformation.collaborateurs.infrastructure;
import fr.intformation.collaborateurs.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
@Configuration
public class CollaboratorConfiguration {
    @Bean CollaboratorService collaboratorService(CollaboratorStore store,AccessStore accounts){return new CollaboratorService(store,accounts);}
}
