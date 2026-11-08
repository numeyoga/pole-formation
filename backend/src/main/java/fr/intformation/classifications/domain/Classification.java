package fr.intformation.classifications.domain;

import java.util.UUID;

public record Classification(UUID id, String code, String label, int sortOrder, boolean active, long version) {
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de classification est déjà utilisé, y compris après désactivation.");}
    }
    public static final class StaleVersion extends RuntimeException {
        public StaleVersion(){super("Cette classification a été modifiée. Rechargez sa fiche avant de recommencer.");}
    }
    public Classification {
        code=required(code,"code",64);label=required(label,"label",200);
        if(sortOrder<0)throw new InvalidField("sortOrder","Ordre entier positif ou nul requis.");
    }
    private static String required(String value,String field,int max){
        if(value==null || value.isBlank())throw new InvalidField(field,"Valeur requise.");
        value=value.strip();if(value.length()>max)throw new InvalidField(field,max+" caractères maximum.");return value;
    }
    public Classification change(String code,String label,Integer order,Boolean active,Long expected){
        if(expected==null || expected<0)throw new InvalidField("version","Version requise.");
        if(expected!=version)throw new StaleVersion();
        return new Classification(id,code,label,order(order),activation(active),version);
    }
    public static int order(Integer order){if(order==null)throw new InvalidField("sortOrder","Ordre requis.");return order;}
    public static boolean activation(Boolean active){if(active==null)throw new InvalidField("active","Activation requise.");return active;}
}
