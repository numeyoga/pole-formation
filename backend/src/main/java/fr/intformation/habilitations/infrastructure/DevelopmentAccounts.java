package fr.intformation.habilitations.infrastructure;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

@Configuration
@Profile("dev")
public class DevelopmentAccounts {
    @Bean ApplicationRunner seedDevelopmentAccounts(JdbcClient db, PasswordEncoder encoder) {
        return args -> {
            String password = encoder.encode("Dev-only-2026!");
            seed(db,"admin","ADMINISTRATEUR_FONCTIONNEL",null,password);
            seed(db,"gestionnaire","GESTIONNAIRE",null,password);
            seed(db,"intervenant","INTERVENANT",UUID.fromString("10000000-0000-0000-0000-000000000001"),password);
            seed(db,"intervenant-b","INTERVENANT",UUID.fromString("10000000-0000-0000-0000-000000000002"),password);
            seed(db,"sans-affectation","INTERVENANT",null,password);
        };
    }
    private void seed(JdbcClient db,String username,String role,UUID instructor,String password) {
        db.sql("INSERT INTO app_account(username,password_hash,role,instructor_id) VALUES (:username,:password,:role,:instructor) ON CONFLICT DO NOTHING")
            .param("username",username).param("password",password).param("role",role).param("instructor",instructor).update();
    }
}
