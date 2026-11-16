package fr.intformation.shared.infrastructure;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Only known UI pages fall back to the frontend; API and arbitrary files never do. */
@Configuration
public class UiNavigationConfiguration implements WebMvcConfigurer {
    public static final String[] PATHS = {
        "/sessions", "/collaborateurs", "/intervenants", "/pilotage", "/catalogue", "/profils",
        "/referentiel/domaines", "/referentiel/sous-domaines", "/referentiel/competences", "/referentiel/explorateur",
        "/parametres/classifications", "/acces", "/journal",
        "/catalogue/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}",
        "/catalogue/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/{section:presentation|competences|sessions}",
        "/profils/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}",
        "/profils/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/{section:presentation|exigences|formations}",
        "/collaborateurs/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}",
        "/collaborateurs/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/{section:informations|participations}"
    };

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String path : PATHS) registry.addViewController(path).setViewName("forward:/index.html");
    }
}
