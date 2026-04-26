import React from 'react';
import { CodeDTO } from '../../types';

interface RequestFilterBarProps {
  filters: {
    filterStatus: string;
    setFilterStatus: (s: string) => void;
    filterTenant: string;
    setFilterTenant: (t: string) => void;
    keyword: string;
    setKeyword: (k: string) => void;
    dateRange: string;
    setDateRange: (d: string) => void;
    startDate: string;
    setStartDate: (s: string) => void;
    endDate: string;
    setEndDate: (e: string) => void;
  };
  tenants: any[];
  statusCodes: CodeDTO[];
}

const RequestFilterBar: React.FC<RequestFilterBarProps> = ({ filters, tenants, statusCodes }) => {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by ID, Title..." 
          value={filters.keyword} 
          onChange={e => filters.setKeyword(e.target.value)} 
        />
      </div>
      <div className="filter-group">
        <select className="modern-select" value={filters.dateRange} onChange={e => filters.setDateRange(e.target.value)}>
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="1W">1 Week</option>
          <option value="1M">1 Month</option>
          <option value="CUSTOM">Custom Range</option>
        </select>
      </div>
      <div className="filter-group date-range-group">
        <input 
          type="date" 
          className="modern-input date-input" 
          value={filters.startDate} 
          onChange={e => {
            filters.setStartDate(e.target.value);
            filters.setDateRange('CUSTOM');
          }} 
        />
        <span className="date-separator">~</span>
        <input 
          type="date" 
          className="modern-input date-input" 
          value={filters.endDate} 
          onChange={e => {
            filters.setEndDate(e.target.value);
            filters.setDateRange('CUSTOM');
          }} 
        />
      </div>
      <div className="filter-group">
        <select className="modern-select" value={filters.filterTenant} onChange={e => filters.setFilterTenant(e.target.value)}>
          <option value="ALL">All Tenants</option>
          {tenants.filter(t => t !== null).map(t => (
            <option key={t.id || t.tenantId} value={t.id || t.tenantId}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <select className="modern-select" value={filters.filterStatus} onChange={e => filters.setFilterStatus(e.target.value)}>
          <option value="ALL">All Status</option>
          {statusCodes.filter(c => c !== null).map(code => (
            <option key={code.codeId} value={code.codeId}>{code.codeName}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RequestFilterBar;
