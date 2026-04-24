package com.itsm.system.service.request;

import com.itsm.system.domain.request.ServiceRequestPriority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SlaService {

    public LocalDateTime calculateDeadline(ServiceRequestPriority priority) {
        if (priority == null) return null;
        return LocalDateTime.now().plus(priority.getSlaDuration());
    }
}
