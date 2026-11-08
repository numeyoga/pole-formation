package fr.intformation.classifications.infrastructure;
import fr.intformation.classifications.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
@Configuration
class ClassificationConfiguration {
    @Bean ClassificationService classificationService(ClassificationStore store,AccessStore accounts){return new ClassificationService(store,accounts);}
}
