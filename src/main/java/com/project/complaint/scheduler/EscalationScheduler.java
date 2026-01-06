package com.project.complaint.scheduler;

import com.project.complaint.service.EscalationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EscalationScheduler {

    private final EscalationService escalationService;

    /**
     * Run every hour to check for overdue complaints and escalate them
     * Cron: 0 0 * * * * = At the start of every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void checkOverdueComplaints() {
        log.info("Starting scheduled escalation check...");
        try {
            escalationService.checkAndEscalateOverdueComplaints();
            log.info("Scheduled escalation check completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled escalation check", e);
        }
    }

    /**
     * Alternative: Run every 30 minutes (for testing/more frequent checks)
     * Uncomment this and comment the above method if you want more frequent checks
     */
    // @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    // public void checkOverdueComplaintsFrequent() {
    // log.info("Starting frequent escalation check...");
    // try {
    // escalationService.checkAndEscalateOverdueComplaints();
    // log.info("Frequent escalation check completed successfully");
    // } catch (Exception e) {
    // log.error("Error during frequent escalation check", e);
    // }
    // }
}
