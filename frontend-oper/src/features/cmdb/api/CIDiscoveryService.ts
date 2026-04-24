import apiClient from '../../../api/client';

export interface DiscoverySuggestion {
  sourceId: number;
  targetId: number;
  sourceName: string;
  targetName: string;
  type: 'TRAFFIC' | 'METADATA' | 'HOST';
  reason: string;
  confidence: number;
}

export const CIDiscoveryService = {
  /**
   * Fetches real-time traffic dependencies from Prometheus
   * and maps them to existing CIs.
   */
  getLiveDependencies: async (tenantId: string): Promise<DiscoverySuggestion[]> => {
    try {
      // In a real implementation, this calls a backend endpoint that queries Prometheus
      const response = await apiClient.get<DiscoverySuggestion[]>(`/cis/discovery/live?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch live dependencies from Prometheus. Using metadata fallback.');
      return [];
    }
  },

  /**
   * Scans CI metadata (IP, Hostname) to suggest potential links.
   */
  getMetadataSuggestions: (cis: any[]): DiscoverySuggestion[] => {
    const suggestions: DiscoverySuggestion[] = [];
    
    // Simple heuristic: Link APPLICATION to SERVER if 'host' or 'server' mapping exists in JSON
    cis.forEach(source => {
      let config: any = {};
      try { config = JSON.parse(source.configJson || '{}'); } catch(e) {}

      const possibleHost = config.host || config.ip || config.server;
      if (possibleHost) {
        const target = cis.find(c => 
          c.ciId !== source.ciId && 
          (c.name.includes(possibleHost) || c.serialNumber === possibleHost || (c.configJson && c.configJson.includes(possibleHost)))
        );

        if (target) {
          suggestions.push({
            sourceId: source.ciId,
            targetId: target.ciId,
            sourceName: source.name,
            targetName: target.name,
            type: 'METADATA',
            reason: `Metadata match found: '${possibleHost}'`,
            confidence: 0.8
          });
        }
      }
    });

    return suggestions;
  }
};
