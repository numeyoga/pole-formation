package fr.intformation.habilitations.infrastructure;

import fr.intformation.habilitations.application.*;
import fr.intformation.habilitations.domain.AccessPolicy.*;
import org.springframework.http.*;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
public class AccessController {
    private final AccessService service;
    public AccessController(AccessService service) { this.service=service; }
    public record Csrf(String token, String headerName) {}
    public record Identity(String username, Role role, List<String> permissions) {}
    public record Label(String label) {}
    public record Presence(String state) {}
    public record RoleChange(Role role) {}
    public record SessionResponse(UUID id,String title,String state,Instant lastSlotEnd) {}
    public record ParticipantResponse(UUID id,String firstName,String lastName,String professionalId,String state) {}
    public record AccountResponse(String username,Role role) {}
    @GetMapping("/auth/csrf") Csrf csrf(CsrfToken token) { return new Csrf(token.getToken(),token.getHeaderName()); }
    @GetMapping("/auth/me") Identity me(Principal user) { return new Identity(user.getName(), service.actor(user.getName()).role(), service.permissions(user.getName())); }
    @GetMapping("/sessions") List<SessionResponse> sessions(Principal user) {
        return service.sessions(user.getName()).stream().map(s->new SessionResponse(s.id(),s.title(),s.state(),s.lastSlotEnd())).toList();
    }
    @GetMapping("/sessions/{id}/participants") List<ParticipantResponse> participants(Principal user, @PathVariable UUID id) {
        return service.participants(user.getName(), id).stream().map(p->new ParticipantResponse(p.id(),p.firstName(),p.lastName(),p.professionalId(),p.state())).toList();
    }
    @PutMapping("/sessions/{id}/participants/{participationId}/presence") @ResponseStatus(HttpStatus.NO_CONTENT)
    void presence(Principal user, @PathVariable UUID id, @PathVariable UUID participationId, @RequestBody Presence body) { service.presence(user.getName(),id,participationId,body.state()); }
    @GetMapping("/habilitations/comptes") List<AccountResponse> accounts(Principal user) {
        return service.accounts(user.getName()).stream().map(a->new AccountResponse(a.username(),a.role())).toList();
    }
    @PutMapping("/habilitations/comptes/{username}/role") @ResponseStatus(HttpStatus.NO_CONTENT)
    void role(Principal user,@PathVariable String username,@RequestBody RoleChange body) { service.changeRole(user.getName(),username,body.role()); }
}
