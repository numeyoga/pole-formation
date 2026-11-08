package fr.intformation.habilitations.infrastructure;

import fr.intformation.habilitations.application.AccessService;
import fr.intformation.habilitations.domain.AccessPolicy.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(fr.intformation.referentiel.domain.TrainingDomain.InvalidField.class)
    ProblemDetail domainField(fr.intformation.referentiel.domain.TrainingDomain.InvalidField error){
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,error.getMessage());
        problem.setProperty("fieldErrors",java.util.Map.of(error.field(),error.getMessage()));return problem;
    }
    @ExceptionHandler(fr.intformation.referentiel.domain.TrainingDomain.DuplicateCode.class)
    ProblemDetail duplicate(fr.intformation.referentiel.domain.TrainingDomain.DuplicateCode error){
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,error.getMessage());
        problem.setProperty("fieldErrors",java.util.Map.of("code",error.getMessage()));return problem;
    }
    @ExceptionHandler(fr.intformation.referentiel.domain.TrainingDomain.StaleVersion.class)
    ProblemDetail stale(fr.intformation.referentiel.domain.TrainingDomain.StaleVersion error){return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,error.getMessage());}
    @ExceptionHandler(fr.intformation.audit.domain.ChangeRules.PlanningConflict.class)
    ProblemDetail planning(fr.intformation.audit.domain.ChangeRules.PlanningConflict error) {
        var problem=ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,error.getMessage());
        problem.setProperty("confirmationRequired",true);problem.setProperty("conflictingSessionIds",error.sessions());return problem;
    }
    @ExceptionHandler(Forbidden.class) ProblemDetail forbidden() { return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,"Accès refusé."); }
    @ExceptionHandler(AccessService.NotFound.class) ProblemDetail missing() { return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,"Ressource introuvable."); }
    @ExceptionHandler(Conflict.class) ProblemDetail conflict(Conflict error) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,error.getMessage()); }
    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    ProblemDetail invalid() { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,"Requête invalide."); }
}
