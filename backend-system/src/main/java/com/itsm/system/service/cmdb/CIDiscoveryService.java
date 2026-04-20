package com.itsm.system.service.cmdb;

import com.itsm.system.domain.cmdb.ConfigurationItem;
import com.itsm.system.domain.cmdb.ConfigurationItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CIDiscoveryService {

    private final ConfigurationItemRepository configurationItemRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @org.springframework.transaction.annotation.Transactional
    public void runAnsibleDiscovery(String tenantId) {
        try {
            // 1. Execute Ansible Playbook via Docker
            ProcessBuilder pb = new ProcessBuilder(
                "docker", "exec", "ansible", "ansible-playbook", "playbooks/collect_ci_info.yml"
            );
            pb.inheritIO();
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("Ansible discovery failed with exit code: " + exitCode);
            }

            // 2. Read Results from shared volume (/ansible/inventory/ci_info.json)
            java.io.File resultFile = new java.io.File("/ansible/inventory/ci_info.json");
            if (!resultFile.exists()) {
                throw new RuntimeException("Discovery result file not found at /ansible/inventory/ci_info.json");
            }

            List<Map<String, Object>> discoveryData = objectMapper.readValue(
                resultFile, 
                new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {}
            );

            // 3. Update CMDB
            List<ConfigurationItem> existingCis = configurationItemRepository.findAllWithDetailsByTenantId(tenantId);
            
            for (Map<String, Object> data : discoveryData) {
                String hostname = (String) data.get("hostname");
                String ipAddress = (String) data.get("ip_address");
                
                java.util.Optional<ConfigurationItem> targetCi = existingCis.stream()
                    .filter(ci -> ci.getName().equalsIgnoreCase(hostname) || 
                                 (ci.getConfigJson() != null && ci.getConfigJson().contains(ipAddress)))
                    .findFirst();

                if (targetCi.isPresent()) {
                    ConfigurationItem ci = targetCi.get();
                    String jsonInfo = objectMapper.writeValueAsString(data);
                    
                    ci.updateInfo(
                        ci.getName(),
                        ci.getTypeCode(),
                        ci.getSerialNumber(),
                        ci.getLocation(),
                        ci.getDescription(),
                        jsonInfo
                    );
                    configurationItemRepository.save(ci);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error during Ansible discovery", e);
        }
    }

    public List<Map<String, Object>> discoverLive(String tenantId) {
        List<ConfigurationItem> cis = configurationItemRepository.findAllWithDetailsByTenantId(tenantId);
        List<Map<String, Object>> results = new ArrayList<>();

        // In a real implementation, we would query Prometheus here:
        // Query: sum by(instance, target) (http_client_requests_seconds_count)
        
        // Mock Discovery: Link any APPLICATION to a SERVER in the same tenant
        ConfigurationItem server = cis.stream()
                .filter(ci -> ci.getTypeCode().equals("SERVER"))
                .findFirst().orElse(null);
        
        cis.stream()
                .filter(ci -> ci.getTypeCode().equals("APPLICATION"))
                .forEach(app -> {
                    if (server != null) {
                        Map<String, Object> suggestion = new HashMap<>();
                        suggestion.put("sourceId", app.getCiId());
                        suggestion.put("targetId", server.getCiId());
                        suggestion.put("sourceName", app.getName());
                        suggestion.put("targetName", server.getName());
                        suggestion.put("type", "TRAFFIC");
                        suggestion.put("reason", "Live traffic detected via Prometheus (Mock)");
                        suggestion.put("confidence", 0.95);
                        results.add(suggestion);
                    }
                });

        return results;
    }
}
