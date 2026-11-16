package fr.intformation.habilitations.infrastructure;

import fr.intformation.habilitations.application.*;
import fr.intformation.habilitations.domain.AccessPolicy;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.time.Clock;
import org.springframework.http.HttpMethod;
import fr.intformation.shared.infrastructure.UiNavigationConfiguration;

@Configuration
public class SecurityConfiguration {
    @Bean Clock clock() { return Clock.systemUTC(); }
    @Bean AccessService accessService(AccessStore store, Clock clock) { return new AccessService(store, new AccessPolicy(), clock); }
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService userDetailsService(DatabaseAccessStore store) {
        // Roles are read again by the application for every operation, including existing sessions.
        return username -> User.withUsername(username).password(store.password(username)).authorities("AUTHENTICATED").build();
    }
    @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/csrf", "/api/auth/login", "/", "/index.html", "/assets/**", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, UiNavigationConfiguration.PATHS).permitAll()
                .requestMatchers("/api/**").authenticated().anyRequest().denyAll())
            .requestCache(cache -> cache.disable())
            .formLogin(login -> login.loginProcessingUrl("/api/auth/login")
                .successHandler((req,res,auth) -> res.setStatus(204))
                .failureHandler((req,res,error) -> problem(res,401,"Identifiants invalides")))
            .logout(logout -> logout.logoutUrl("/api/auth/logout").logoutSuccessHandler((req,res,auth) -> res.setStatus(204)))
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((req,res,error) -> problem(res,401,"Authentification requise"))
                .accessDeniedHandler((req,res,error) -> problem(res,403,"Accès refusé")))
            .build();
    }
    static void problem(jakarta.servlet.http.HttpServletResponse response, int status, String title) throws java.io.IOException {
        response.setStatus(status); response.setContentType("application/problem+json"); response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"type\":\"about:blank\",\"status\":" + status + ",\"title\":\"" + title + "\"}");
    }
}
