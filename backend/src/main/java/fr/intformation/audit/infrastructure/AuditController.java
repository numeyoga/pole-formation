package fr.intformation.audit.infrastructure;

import fr.intformation.audit.application.*;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import fr.intformation.habilitations.application.AccessStore;
import java.security.Principal;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AuditController {
    private final AuditService service;
    public AuditController(AuditService service) {this.service=service;}
    public record EventResponse(String sequence,UUID id,Instant occurredAt,String actor,String action,String subjectType,
                                String subjectId,UUID sessionId,Map<String,Object> before,Map<String,Object> after) {}
    public record Page(List<EventResponse> items,String nextCursor) {}
    public record SlotChange(OffsetDateTime startsAt,OffsetDateTime endsAt,Boolean confirmConflicts,java.math.BigDecimal version) {}
    private Long version(java.math.BigDecimal value){try{return value==null?null:value.longValueExact();}catch(ArithmeticException error){throw new fr.intformation.sessions.domain.TrainingSession.InvalidField("version","Version entière invalide.");}}
    public record InstructorChange(List<UUID> instructorIds,Boolean confirmConflicts) {}
    public record Transition(String state,Boolean confirmConflicts) {}
    @GetMapping("/audit") Page read(Principal user,@RequestParam(required=false) String subjectType,@RequestParam(required=false) String subjectId,
        @RequestParam(required=false) UUID sessionId,@RequestParam(required=false) Long beforeSequence,@RequestParam(defaultValue="20") int limit) {
        var events=service.read(user.getName(),new AuditStore.Query(subjectType,subjectId,sessionId,beforeSequence,limit));
        var items=events.stream().limit(limit).map(e->new EventResponse(Long.toString(e.sequence()),e.id(),e.occurredAt(),e.actor(),e.action(),e.subjectType(),e.subjectId(),e.sessionId(),e.before(),e.after())).toList();
        return new Page(items,events.size()>limit?items.getLast().sequence():null);
    }
    @PutMapping("/sessions/{session}/creneaux/{slot}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void slot(Principal user,@PathVariable UUID session,@PathVariable UUID slot,@RequestBody SlotChange body) {
        service.slot(user.getName(),session,slot,body.startsAt()==null?null:body.startsAt().toInstant(),body.endsAt()==null?null:body.endsAt().toInstant(),Boolean.TRUE.equals(body.confirmConflicts()),version(body.version()));
    }
    @PutMapping("/sessions/{session}/intervenants") @ResponseStatus(HttpStatus.NO_CONTENT)
    void instructors(Principal user,@PathVariable UUID session,@RequestBody InstructorChange body) {
        service.instructors(user.getName(),session,body.instructorIds(),Boolean.TRUE.equals(body.confirmConflicts()));
    }
    @PutMapping("/sessions/{session}/participants/{participation}/etat") @ResponseStatus(HttpStatus.NO_CONTENT)
    void transition(Principal user,@PathVariable UUID session,@PathVariable UUID participation,@RequestBody Transition body) {
        service.transition(user.getName(),session,participation,body.state(),Boolean.TRUE.equals(body.confirmConflicts()));
    }
}
