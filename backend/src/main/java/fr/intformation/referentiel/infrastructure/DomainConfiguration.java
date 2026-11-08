package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;

@Configuration
class DomainConfiguration {
    @Bean ReferenceExplorerService referenceExplorerService(ReferenceExplorerCatalog catalog,AccessStore accounts){return new ReferenceExplorerService(catalog,accounts);}
    @Bean DomainService domainService(DomainStore store,AccessStore accounts){return new DomainService(store,accounts);}
    @Bean CompetencyService competencyService(CompetencyCatalog catalog,AccessStore accounts){return new CompetencyService(catalog,accounts);}
    @Bean SubdomainService subdomainService(SubdomainCatalog catalog,AccessStore accounts){return new SubdomainService(catalog,accounts);}
}
