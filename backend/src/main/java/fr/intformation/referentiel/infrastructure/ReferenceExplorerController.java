package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
public class ReferenceExplorerController {
    private final ReferenceExplorerService service;
    public ReferenceExplorerController(ReferenceExplorerService service){this.service=service;}
    @GetMapping("/api/referentiels/exploration/competences")
    ReferenceExplorerCatalog.Page search(Principal user,@RequestParam(defaultValue="") String q,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        return service.search(user.getName(),q,page,size);
    }
}
