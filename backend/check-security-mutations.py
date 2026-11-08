"""Run inside the devcontainer; restore each source even when a mutant survives."""
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import argparse

root = Path(__file__).resolve().parent
policy = root / "src/main/java/fr/intformation/habilitations/domain/AccessPolicy.java"
security = root / "src/main/java/fr/intformation/habilitations/infrastructure/SecurityConfiguration.java"
audit_service = root / "src/main/java/fr/intformation/audit/application/AuditService.java"
audit_changes = root / "src/main/java/fr/intformation/audit/infrastructure/PostgresSensitiveStore.java"
change_rules = root / "src/main/java/fr/intformation/audit/domain/ChangeRules.java"
training_domain = root / "src/main/java/fr/intformation/referentiel/domain/TrainingDomain.java"
subdomain_service = root / "src/main/java/fr/intformation/referentiel/application/SubdomainService.java"
subdomain_catalog = root / "src/main/java/fr/intformation/referentiel/infrastructure/PostgresSubdomainCatalog.java"
training_subdomain = root / "src/main/java/fr/intformation/referentiel/domain/TrainingSubdomain.java"
mutants = [
    (policy, "if (actor.role() == Role.INTERVENANT &&", "if (false &&", "AccessHttpTest#guessing_another_session_or_participation_cannot_bypass_assignment", "fr.intformation.AccessHttpTest"),
    (policy, "case GESTIONNAIRE -> permission !=", "case GESTIONNAIRE -> true || permission !=", "AccessPolicyTest#fixed_roles_match_the_validated_permissions", "fr.intformation.AccessPolicyTest"),
    (security, ".requestCache(cache -> cache.disable())", ".csrf(csrf -> csrf.disable()).requestCache(cache -> cache.disable())", "AccessHttpTest#anonymous_access_and_missing_csrf_are_rejected", "fr.intformation.AccessHttpTest"),
    (audit_service, "policy.require(accounts.actor(user),READ_AUDIT);", "// audit permission removed", "AccessHttpTest#audit_is_readable_by_management_and_denied_to_instructors", "fr.intformation.AccessHttpTest"),
    (audit_changes, "@Transactional\n    public void changeSlot", "public void changeSlot", "AccessHttpTest#failed_audit_rolls_back_a_slot_change_and_leaves_no_event", "fr.intformation.AccessHttpTest"),
    (change_rules, "if(capacity!=null && occupied>=capacity)", "if(false && capacity!=null && occupied>=capacity)", "ChangeRulesTest#reactivation_requires_capacity_active_collaborator_and_the_correct_origin", "fr.intformation.ChangeRulesTest"),
    (change_rules, "if(others.stream().anyMatch(proposed::overlaps))", "if(false && others.stream().anyMatch(proposed::overlaps))", "ChangeRulesTest#adjacent_slots_are_valid_but_overlap_and_reversed_intervals_are_not", "fr.intformation.ChangeRulesTest"),
    (training_domain, "if(!active)", "if(false && !active)", "AccessHttpTest#deactivated_domain_keeps_its_children_and_rejects_new_attachments", "fr.intformation.AccessHttpTest"),
    (training_domain, "if(expected!=null && expected!=version)", "if(false && expected!=null && expected!=version)", "AccessHttpTest#domain_edit_keeps_identity_and_rejects_stale_versions", "fr.intformation.AccessHttpTest"),
    (training_domain, "if(value.length()>max)", "if(false && value.length()>max)", "TrainingDomainTest#fields_are_trimmed_bounded_and_not_blank", "fr.intformation.TrainingDomainTest"),
    (subdomain_service, "policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);", "/* subdomain permission removed */", "AccessHttpTest#subdomain_catalog_enforces_permissions_and_query_limits", "fr.intformation.AccessHttpTest"),
    (subdomain_catalog, 'String filter=domainId==null?"":" WHERE s.domain_id=:parent";', 'String filter=domainId==null?"":" WHERE s.domain_id<>:parent";', "AccessHttpTest#manager_can_list_subdomains_with_their_parent", "fr.intformation.AccessHttpTest"),
    (subdomain_catalog, '.param("offset",(long)page*size)', '.param("offset",0L)', "AccessHttpTest#manager_can_list_subdomains_with_their_parent", "fr.intformation.AccessHttpTest"),
    (training_subdomain, "if(expected!=version)", "if(false && expected!=version)", "AccessHttpTest#manager_can_create_edit_and_deactivate_a_subdomain_without_losing_competencies", "fr.intformation.AccessHttpTest"),
    (training_subdomain, "if(parent!=null && !domainId.equals(parent))", "if(false && parent!=null && !domainId.equals(parent))", "AccessHttpTest#manager_can_create_edit_and_deactivate_a_subdomain_without_losing_competencies", "fr.intformation.AccessHttpTest"),
    (training_subdomain, "if(!active)", "if(false && !active)", "AccessHttpTest#manager_can_create_edit_and_deactivate_a_subdomain_without_losing_competencies", "fr.intformation.AccessHttpTest"),
]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--subdomains", action="store_true", help="Run only mutations affecting subdomain behavior")
if parser.parse_args().subdomains:
    mutants = [item for item in mutants if item[0] in (subdomain_service, subdomain_catalog, training_subdomain)]
for source, before, after, test, suite in mutants:
    original = source.read_text()
    assert original.count(before) == 1, f"Mutation anchor changed: {source}"
    report = root / f"target/surefire-reports/TEST-{suite}.xml"
    report.unlink(missing_ok=True)
    try:
        source.write_text(original.replace(before, after))
        with tempfile.TemporaryFile() as log:
            result = subprocess.run(["./mvnw", "-q", f"-Dtest={test}", "test"], cwd=root, stdout=log, stderr=log)
            detected = report.exists() and int(ET.parse(report).getroot().attrib["failures"]) > 0
            if result.returncode == 0 or not detected:
                log.seek(0)
                print(log.read().decode()[-5000:])
                raise SystemExit(f"Mutation not detected by an assertion: {test}")
        print(f"Detected: {test}", flush=True)
    finally:
        source.write_text(original)
