package fr.intformation.participations.infrastructure;
import fr.intformation.participations.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.time.Clock;
import java.net.URI;
import java.security.Principal;
import java.util.UUID;
@RestController
public class EnrollmentController {
    private final EnrollmentService service;
    public EnrollmentController(EnrollmentService service){this.service=service;}
    public record Enroll(UUID collaboratorId,Boolean confirmConflicts) {}
    public record Created(UUID id) {}
    @PostMapping("/api/sessions/{session}/participants") ResponseEntity<Created> enroll(Principal user,@PathVariable UUID session,@RequestBody Enroll body){UUID id=service.enroll(user.getName(),session,body.collaboratorId(),Boolean.TRUE.equals(body.confirmConflicts()));return ResponseEntity.created(URI.create("/api/sessions/"+session+"/participants/"+id)).body(new Created(id));}
    @Configuration static class Wiring {@Bean EnrollmentService enrollmentService(AccessStore accounts,EnrollmentStore store,Clock clock){return new EnrollmentService(accounts,store,clock);}}
}
