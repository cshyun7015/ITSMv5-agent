import { useState, useEffect, useMemo, useCallback } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, CodeDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export const useRequestList = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [statusCodes, setStatusCodes] = useState<CodeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Pagination States
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const loadInitialData = useCallback(async () => {
    try {
      const [tData, cData] = await Promise.all([
        requestApi.getTenants().catch(() => []),
        requestApi.getCodesByGroup('SR_STATUS').catch(() => [])
      ]);
      setTenants(Array.isArray(tData) ? tData : []);
      setStatusCodes(Array.isArray(cData) ? cData : []);
    } catch (error) {
      console.error('Initial metadata loading error', error);
      toast.error('Failed to load metadata');
    }
  }, [toast]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      let params: any = {
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        tenantId: filterTenant === 'ALL' ? undefined : filterTenant,
        keyword: keyword,
        page: currentPage,
        size: pageSize
      };

      if (dateRange !== 'ALL') {
        const toLocalISO = (date: Date) => {
          const pad = (num: number) => String(num).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        let start: Date | null = null;
        let end: Date = new Date();

        if (dateRange === 'TODAY') {
          start = new Date();
          start.setHours(0, 0, 0, 0);
        } else if (dateRange === '1W') {
          start = new Date();
          start.setDate(start.getDate() - 7);
        } else if (dateRange === '1M') {
          start = new Date();
          start.setMonth(start.getMonth() - 1);
        } else if (dateRange === 'CUSTOM' && startDate && endDate) {
          const [sY, sM, sD] = startDate.split('-').map(Number);
          const [eY, eM, eD] = endDate.split('-').map(Number);
          start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
          end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
        }

        if (start) {
          params.startDate = toLocalISO(start);
          params.endDate = toLocalISO(end);
        }
      }

      const response = await requestApi.getAllRequests(params);
      setRequests(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Failed to load requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterTenant, keyword, currentPage, pageSize, dateRange, startDate, endDate, toast]);

  const handleQuickAssign = async (id: number) => {
    try {
      await requestApi.assignToMe(id);
      toast.success('Assigned to you');
      fetchRequests();
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterStatus, filterTenant, keyword, dateRange, startDate, endDate, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests();
    }, 400);
    return () => clearTimeout(handler);
  }, [fetchRequests]);

  const summaryCounts = useMemo(() => {
    const filtered = (requests || []).filter(r => r !== null && typeof r === 'object');
    return {
      draft: filtered.filter(r => r?.status === 'DRAFT').length,
      pending: filtered.filter(r => r?.status === 'PENDING_APPROVAL').length,
      open: filtered.filter(r => r?.status === 'OPEN').length,
      inProgress: filtered.filter(r => r?.status === 'IN_PROGRESS').length,
      resolved: filtered.filter(r => r?.status === 'RESOLVED').length,
      closed: filtered.filter(r => r?.status === 'CLOSED').length,
      rejected: filtered.filter(r => r?.status === 'REJECTED').length,
    };
  }, [requests]);

  return {
    requests,
    tenants,
    statusCodes,
    isLoading,
    summaryCounts,
    filters: {
      filterStatus,
      setFilterStatus,
      filterTenant,
      setFilterTenant,
      keyword,
      setKeyword,
      dateRange,
      setDateRange,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
    },
    pagination: {
      currentPage,
      setCurrentPage,
      pageSize,
      setPageSize,
      totalElements,
      totalPages,
    },
    actions: {
      fetchRequests,
      handleQuickAssign,
    }
  };
};
