package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;

@Configuration
class DomainConfiguration {
    @Bean DomainService domainService(DomainStore store,AccessStore accounts){return new DomainService(store,accounts);}
}
