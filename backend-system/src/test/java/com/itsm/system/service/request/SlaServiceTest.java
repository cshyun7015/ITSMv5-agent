package com.itsm.system.service.request;

import com.itsm.system.domain.request.ServiceRequestPriority;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import java.time.temporal.ChronoUnit;

class SlaServiceTest {

    private final SlaService slaService = new SlaService();

    @Test
    @DisplayName("긴급(EMERGENCY) 우선순위의 SLA는 현재 시간으로부터 4시간 뒤여야 함")
    void calculateEmergencyDeadline() {
        LocalDateTime expected = LocalDateTime.now().plusHours(4);
        LocalDateTime actual = slaService.calculateDeadline(ServiceRequestPriority.EMERGENCY);
        
        assertThat(actual).isCloseTo(expected, within(1, ChronoUnit.SECONDS));
    }

    @Test
    @DisplayName("보통(NORMAL) 우선순위의 SLA는 현재 시간으로부터 24시간 뒤여야 함")
    void calculateNormalDeadline() {
        LocalDateTime expected = LocalDateTime.now().plusDays(1);
        LocalDateTime actual = slaService.calculateDeadline(ServiceRequestPriority.NORMAL);
        
        assertThat(actual).isCloseTo(expected, within(1, ChronoUnit.SECONDS));
    }

    @Test
    @DisplayName("낮음(LOW) 우선순위의 SLA는 현재 시간으로부터 72시간 뒤여야 함")
    void calculateLowDeadline() {
        LocalDateTime expected = LocalDateTime.now().plusDays(3);
        LocalDateTime actual = slaService.calculateDeadline(ServiceRequestPriority.LOW);
        
        assertThat(actual).isCloseTo(expected, within(1, ChronoUnit.SECONDS));
    }
}
