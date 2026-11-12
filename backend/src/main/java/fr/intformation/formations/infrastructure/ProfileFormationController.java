package fr.intformation.formations.infrastructure;

import fr.intformation.formations.application.FormationService;
import fr.intformation.formations.application.FormationStore;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/referentiels/profils-emploi/{id}")
public class ProfileFormationController {
    private final FormationService service;
    public ProfileFormationController(FormationService service){this.service=service;}
    @GetMapping("/formations")
    FormationStore.Matches list(Principal user,@PathVariable UUID id,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        return service.forProfile(user.getName(),id,page,size);
    }
    @GetMapping("/formations/{formationId}/correspondance")
    FormationStore.ExplanationPage common(Principal user,@PathVariable UUID id,@PathVariable UUID formationId,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        return service.commonRequirements(user.getName(),id,formationId,page,size);
    }
    @GetMapping("/besoins-non-couverts")
    FormationStore.ExplanationPage uncovered(Principal user,@PathVariable UUID id,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        return service.uncoveredRequirements(user.getName(),id,page,size);
    }
}
