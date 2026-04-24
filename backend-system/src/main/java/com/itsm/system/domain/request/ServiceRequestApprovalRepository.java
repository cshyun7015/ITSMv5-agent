package com.itsm.system.domain.request;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestApprovalRepository extends JpaRepository<ServiceRequestApproval, Long> {
    
    List<ServiceRequestApproval> findByServiceRequest_RequestIdOrderByStepOrderAsc(Long requestId);
    
    @Query("SELECT sa FROM ServiceRequestApproval sa WHERE sa.approver.memberId = :memberId AND sa.status = 'PENDING' AND sa.isDeleted = false")
    List<ServiceRequestApproval> findPendingByApprover(@Param("memberId") Long memberId);
}
