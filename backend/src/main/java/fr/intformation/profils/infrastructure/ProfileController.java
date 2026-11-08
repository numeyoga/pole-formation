package fr.intformation.profils.infrastructure;

import fr.intformation.profils.application.*;
import fr.intformation.profils.domain.JobProfile;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/referentiels/profils-emploi")
public class ProfileController {
    private final ProfileService service;
    public ProfileController(ProfileService service){this.service=service;}
    public record ProfileResponse(UUID id,String code,String label,String description,boolean active,long version){}
    public record ProfilePage(List<ProfileResponse> items,long total,int page,int size){}
    public record Change(String code,String label,String description,Long version){}
    public record Version(Long version){}
    private ProfileResponse dto(JobProfile domain){return new ProfileResponse(domain.id(),domain.code(),domain.label(),domain.description(),domain.active(),domain.version());}
    @GetMapping ProfilePage list(Principal user,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        var result=service.list(user.getName(),page,size);return new ProfilePage(result.items().stream().map(this::dto).toList(),result.total(),page,size);
    }
    @GetMapping("/{id}") ProfileResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    public record RequirementChange(UUID competencyId,UUID classificationId){}
    @GetMapping("/{id}/exigences") List<ProfileStore.Requirement> requirements(Principal user,@PathVariable UUID id){return service.requirements(user.getName(),id);}
    @PostMapping("/{id}/exigences") @ResponseStatus(HttpStatus.CREATED)
    ProfileStore.Requirement addRequirement(Principal user,@PathVariable UUID id,@RequestBody RequirementChange body){return service.addRequirement(user.getName(),id,body.competencyId(),body.classificationId());}
    @PostMapping ResponseEntity<ProfileResponse> create(Principal user,@RequestBody Change body){
        var result=service.create(user.getName(),body.code(),body.label(),body.description());return ResponseEntity.created(URI.create("/api/referentiels/profils-emploi/"+result.id())).body(dto(result));
    }
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.code(),body.label(),body.description(),body.version());}
    @PostMapping("/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,body.version());}
}
