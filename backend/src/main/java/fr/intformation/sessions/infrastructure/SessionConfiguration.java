package fr.intformation.sessions.infrastructure;

import fr.intformation.sessions.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;

@Configuration
public class SessionConfiguration {
    @Bean SessionService sessionService(SessionStore store,AccessStore accounts){return new SessionService(store,accounts);}
}
