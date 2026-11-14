package fr.intformation.pilotage.infrastructure;
import fr.intformation.pilotage.application.*;
import fr.intformation.habilitations.application.AccessStore;
import org.springframework.context.annotation.*;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.security.Principal;
import java.util.UUID;
@RestController
@RequestMapping("/api/pilotage")
public class ReportingController {
    private final ReportingService service;
    public ReportingController(ReportingService service){this.service=service;}
    @GetMapping ReportingStore.Overview overview(Principal user,@RequestParam(required=false) OffsetDateTime from,@RequestParam(required=false) OffsetDateTime until,@RequestParam(required=false) UUID formationId,@RequestParam(required=false) String state){return service.overview(user.getName(),new ReportingStore.Query(from==null?null:from.toInstant(),until==null?null:until.toInstant(),formationId,state,0,20));}
    @GetMapping("/sessions") ReportingStore.Page sessions(Principal user,@RequestParam(required=false) OffsetDateTime from,@RequestParam(required=false) OffsetDateTime until,@RequestParam(required=false) UUID formationId,@RequestParam(required=false) String state,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.sessions(user.getName(),new ReportingStore.Query(from==null?null:from.toInstant(),until==null?null:until.toInstant(),formationId,state,page,size));}
    @Configuration static class Wiring {@Bean ReportingService reportingService(ReportingStore store,AccessStore accounts){return new ReportingService(store,accounts);}}
}
