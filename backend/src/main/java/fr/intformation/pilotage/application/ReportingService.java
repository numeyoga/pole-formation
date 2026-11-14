package fr.intformation.pilotage.application;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
public final class ReportingService {
    private final ReportingStore store;private final AccessStore accounts;
    public ReportingService(ReportingStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.READ_REPORTING);}
    public ReportingStore.Overview overview(String user,ReportingStore.Query query){authorize(user);return store.overview(query);}
    public ReportingStore.Page sessions(String user,ReportingStore.Query query){authorize(user);return store.sessions(query);}
}
