"""Run inside the devcontainer; restore each source even when a mutant survives."""
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parent
policy = root / "src/main/java/fr/intformation/habilitations/domain/AccessPolicy.java"
security = root / "src/main/java/fr/intformation/habilitations/infrastructure/SecurityConfiguration.java"
audit_service = root / "src/main/java/fr/intformation/audit/application/AuditService.java"
audit_changes = root / "src/main/java/fr/intformation/audit/infrastructure/PostgresSensitiveStore.java"
change_rules = root / "src/main/java/fr/intformation/audit/domain/ChangeRules.java"
mutants = [
    (policy, "if (actor.role() == Role.INTERVENANT &&", "if (false &&", "AccessHttpTest#guessing_another_session_or_participation_cannot_bypass_assignment", "fr.intformation.AccessHttpTest"),
    (policy, "case GESTIONNAIRE -> permission !=", "case GESTIONNAIRE -> true || permission !=", "AccessPolicyTest#fixed_roles_match_the_validated_permissions", "fr.intformation.AccessPolicyTest"),
    (security, ".requestCache(cache -> cache.disable())", ".csrf(csrf -> csrf.disable()).requestCache(cache -> cache.disable())", "AccessHttpTest#anonymous_access_and_missing_csrf_are_rejected", "fr.intformation.AccessHttpTest"),
    (audit_service, "policy.require(accounts.actor(user),READ_AUDIT);", "// audit permission removed", "AccessHttpTest#audit_is_readable_by_management_and_denied_to_instructors", "fr.intformation.AccessHttpTest"),
    (audit_changes, "@Transactional\n    public void changeSlot", "public void changeSlot", "AccessHttpTest#failed_audit_rolls_back_a_slot_change_and_leaves_no_event", "fr.intformation.AccessHttpTest"),
    (change_rules, "if(capacity!=null && occupied>=capacity)", "if(false && capacity!=null && occupied>=capacity)", "ChangeRulesTest#reactivation_requires_capacity_active_collaborator_and_the_correct_origin", "fr.intformation.ChangeRulesTest"),
    (change_rules, "if(others.stream().anyMatch(proposed::overlaps))", "if(false && others.stream().anyMatch(proposed::overlaps))", "ChangeRulesTest#adjacent_slots_are_valid_but_overlap_and_reversed_intervals_are_not", "fr.intformation.ChangeRulesTest"),
]
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
