package fr.intformation.habilitations.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Explicit local-account bootstrap for standalone installations; never resets an existing account. */
@Configuration
@Profile("standalone & !dev")
public class StandaloneAdministrator {
    @Bean ApplicationRunner bootstrapAdministrator(JdbcClient db, PasswordEncoder encoder,
            @Value("${deployment.admin.username:admin}") String username,
            @Value("${deployment.admin.password:}") String password) {
        if (username.isBlank() || username.length() > 100) {
            throw new IllegalArgumentException("deployment.admin.username doit contenir de 1 à 100 caractères.");
        }
        if (password.isBlank() || password.length() < 20 || password.length() > 72) {
            throw new IllegalArgumentException("deployment.admin.password doit contenir de 20 à 72 caractères ASCII.");
        }
        if (!password.chars().allMatch(c -> c >= 33 && c <= 126)) {
            throw new IllegalArgumentException("deployment.admin.password doit contenir de 20 à 72 caractères ASCII.");
        }
        return args -> db.sql("INSERT INTO app_account(username,password_hash,role) VALUES (:username,:password,'ADMINISTRATEUR_FONCTIONNEL') ON CONFLICT DO NOTHING")
            .param("username", username).param("password", encoder.encode(password)).update();
    }
}
