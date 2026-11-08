package fr.intformation.classifications.infrastructure;
import fr.intformation.classifications.application.*;
import fr.intformation.classifications.domain.Classification;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.security.Principal;
import java.util.*;
@RestController
@RequestMapping("/api/referentiels/classifications")
public class ClassificationController {
    private final ClassificationService service;
    public ClassificationController(ClassificationService service){this.service=service;}
    public record Response(UUID id,String code,String label,int sortOrder,boolean active,long version){}
    public record Page(List<Response> items,long total,int page,int size){}
    public record Change(String code,String label,java.math.BigDecimal sortOrder,Boolean active,java.math.BigDecimal version){}
    private Integer order(java.math.BigDecimal value){
        if(value==null)return null;
        try{return value.intValueExact();}catch(ArithmeticException error){throw new Classification.InvalidField("sortOrder","Ordre entier entre 0 et 2147483647 requis.");}
    }
    private Long version(java.math.BigDecimal value){
        if(value==null)return null;
        try{return value.longValueExact();}catch(ArithmeticException error){throw new Classification.InvalidField("version","Version entière requise.");}
    }
    private Response dto(Classification v){return new Response(v.id(),v.code(),v.label(),v.sortOrder(),v.active(),v.version());}
    @GetMapping Page list(Principal user,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="false") boolean activeOnly){var result=service.list(user.getName(),page,size,activeOnly);return new Page(result.items().stream().map(this::dto).toList(),result.total(),page,size);}
    @GetMapping("/{id}") Response get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping ResponseEntity<Response> create(Principal user,@RequestBody Change body){var result=service.create(user.getName(),body.code(),body.label(),order(body.sortOrder()));return ResponseEntity.created(URI.create("/api/referentiels/classifications/"+result.id())).body(dto(result));}
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){
        // Compatibility with the label-only contract of US-08.01.
        if(body.code()==null && body.sortOrder()==null && body.active()==null && body.version()==null)service.rename(user.getName(),id,body.label());
        else service.update(user.getName(),id,body.code(),body.label(),order(body.sortOrder()),body.active(),version(body.version()));
    }
}
