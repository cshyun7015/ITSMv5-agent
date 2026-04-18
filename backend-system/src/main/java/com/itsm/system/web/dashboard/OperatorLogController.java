package com.itsm.system.web.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/operator/logs")
@RequiredArgsConstructor
public class OperatorLogController {

    private final RestTemplate restTemplate;
    // Loki internally accessible in docker as 'loki'
    private static final String LOKI_URL = "http://loki:3100/loki/api/v1/query_range";

    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<String>> getRecentLogs(
            @RequestParam(defaultValue = "{container_name!=\"\"}") String query,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            String url = UriComponentsBuilder.fromHttpUrl(LOKI_URL)
                    .queryParam("query", query)
                    .queryParam("limit", limit)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<String> logs = parseLokiResponse(response);
            
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Failed to fetch logs from Loki", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseLokiResponse(Map<String, Object> response) {
        List<String> resultLogs = new ArrayList<>();
        if (response == null || !"success".equals(response.get("status"))) {
            return resultLogs;
        }

        try {
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            List<Map<String, Object>> result = (List<Map<String, Object>>) data.get("result");

            for (Map<String, Object> streamObj : result) {
                List<List<String>> values = (List<List<String>>) streamObj.get("values");
                Map<String, String> streamInfo = (Map<String, String>) streamObj.get("stream");
                String container = streamInfo.getOrDefault("container_name", "unknown");

                for (List<String> entry : values) {
                    // entry[0] is nanosecond timestamp, entry[1] is log message
                    String logLine = String.format("[%s] %s", container, entry.get(1));
                    resultLogs.add(logLine);
                }
            }
        } catch (Exception e) {
            log.warn("Parsing Loki response failed", e);
        }

        // Return sorted by timestamp if needed, but query_range usually handles it
        return resultLogs;
    }
}
