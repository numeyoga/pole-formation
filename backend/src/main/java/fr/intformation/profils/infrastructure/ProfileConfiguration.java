package fr.intformation.profils.infrastructure;
import fr.intformation.profils.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
@Configuration
class ProfileConfiguration {
    @Bean ProfileService profileService(ProfileStore store,AccessStore accounts){return new ProfileService(store,accounts);}
}
