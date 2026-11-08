package fr.intformation.audit.infrastructure;

import fr.intformation.audit.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
import java.time.Clock;

@Configuration
class AuditConfiguration {
    @Bean AuditService auditService(AccessStore accounts,AuditStore audit,SensitiveStore changes,Clock clock) {
        return new AuditService(accounts,audit,changes,clock);
    }
}
