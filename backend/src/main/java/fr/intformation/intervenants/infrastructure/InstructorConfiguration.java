package fr.intformation.intervenants.infrastructure;

import fr.intformation.intervenants.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;

@Configuration
public class InstructorConfiguration {
    @Bean InstructorService instructorService(InstructorStore store,AccessStore accounts){return new InstructorService(store,accounts);}
}
