import React, { useEffect, useState } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequestPriority, CodeDTO, CreateRequestDTO } from '../types';
import { useToast } from '../../../hooks/useToast';
import { ArrowLeft, Save, X, Paperclip, Building, List, Info, Type, FileText } from 'lucide-react';
import './../requests.css';

interface RequestCreateProps {
  onBack: () => void;
  onSuccess: () => void;
}

const RequestCreate: React.FC<RequestCreateProps> = ({ onBack, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ServiceRequestPriority>('NORMAL');
  const [tenantId, setTenantId] = useState('');
  const [catalogId, setCatalogId] = useState<number | undefined>(undefined);
  const [isCustomCatalog, setIsCustomCatalog] = useState(false);
  const [customCatalogName, setCustomCatalogName] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Options
  const [tenants, setTenants] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<CodeDTO[]>([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [tData, pData, cData] = await Promise.all([
        requestApi.getTenants().catch(() => []),
        requestApi.getCodesByGroup('SR_PRIORITY').catch(() => []),
        requestApi.getCatalogTemplates().catch(() => [])
      ]);
      setTenants(tData);
      setPriorityOptions(pData);
      setCatalogs(cData);
      
      // Auto-select first tenant and catalog if available
      if (tData.length > 0) {
        setTenantId(tData[0].tenantId || tData[0].id);
      }
      if (cData.length > 0) {
        setCatalogId(cData[0].id);
      }
    } catch (err) {
      console.error('Failed to load options', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.warning('Title is required');
      return;
    }
    if (!description.trim()) {
      toast.warning('Description is required');
      return;
    }
    if (!tenantId) {
      toast.warning('Target tenant is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: CreateRequestDTO = {
        title,
        description,
        priority,
        targetTenantId: tenantId,
        catalogId: isCustomCatalog ? undefined : catalogId,
        customCatalogName: isCustomCatalog ? customCatalogName : undefined
      };
      
      await requestApi.createRequest(dto, files);
      toast.success('Service request registered successfully');
      onSuccess();
      onBack();
    } catch (error) {
      console.error('Failed to create request', error);
      toast.error('Failed to register request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-detail-view editing-mode" data-testid="request-create-view">
      <header className="detail-header">
        <div className="header-top">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={18} /> Cancel Registration
          </button>
          
          <div className="header-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              <Save size={16} /> Register Now
            </button>
          </div>
        </div>

        <div className="header-main">
          <div className="id-tag"><Type size={14} /> NEW</div>
          <input 
            type="text" 
            className="title-edit-input" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done? Enter a clear title..."
            autoFocus
          />
          <div className="status-badge draft">NEW REQUEST</div>
        </div>
      </header>

      <div className="detail-layout-optimized">
        {/* Row 1: Classification - Integrated into the top grid or separate */}
        <section className="detail-section full-width">
          <div className="section-header">
            <Info size={18} />
            <span className="section-title">Request Classification</span>
          </div>
          <div className="attributes-table">
            <div className="attr-group">
              <div className="attr-row">
                <span className="attr-label"><Building size={14} /> Target Customer</span>
                <select className="attr-select" value={tenantId} onChange={e => setTenantId(e.target.value)}>
                  {tenants.map(t => <option key={t.id || t.tenantId} value={t.id || t.tenantId}>{t.name}</option>)}
                </select>
              </div>
              <div className="attr-row">
                <span className="attr-label"><List size={14} /> Service Catalog</span>
                <div className="attr-input-group">
                  {isCustomCatalog ? (
                    <input 
                      type="text" 
                      className="attr-input-text" 
                      value={customCatalogName}
                      onChange={e => setCustomCatalogName(e.target.value)}
                      placeholder="Enter service category..."
                    />
                  ) : (
                    <select className="attr-select" value={catalogId} onChange={e => setCatalogId(Number(e.target.value))}>
                      {catalogs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      {catalogs.length === 0 && <option value={1}>General Technical Support</option>}
                    </select>
                  )}
                  <button 
                    className={`btn-toggle-input ${isCustomCatalog ? 'active' : ''}`}
                    onClick={() => setIsCustomCatalog(!isCustomCatalog)}
                    title={isCustomCatalog ? "Select from list" : "Enter manually"}
                  >
                    {isCustomCatalog ? <List size={14} /> : <FileText size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="attr-group">
              <div className="attr-row">
                <span className="attr-label">Priority Level</span>
                <select className="attr-select" value={priority} onChange={e => setPriority(e.target.value as ServiceRequestPriority)}>
                  {priorityOptions.map(opt => <option key={opt.codeId} value={opt.codeId}>{opt.codeName}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Row 2: Detailed Requirements & Attachments - 50:50 Split */}
        <div className="split-layout-row">
          <section className="detail-section">
            <div className="section-header">
              <FileText size={18} />
              <span className="section-title">Detailed Requirements</span>
            </div>
            <textarea 
              className="description-edit-area compact" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the request in detail..."
              rows={6}
            />
          </section>

          <section className="detail-section">
            <div className="section-header">
              <Paperclip size={18} />
              <span className="section-title">Attachments</span>
            </div>
            <div className="file-upload-area">
              <input type="file" multiple onChange={handleFileChange} id="request-files" className="hidden-file-input" />
              <label htmlFor="request-files" className="file-upload-label compact">
                <Paperclip size={20} />
                <span>Click to attach files</span>
              </label>
              <div className="selected-files">
                {files.map((f, i) => (
                  <div key={i} className="att-item"><span className="att-name">{f.name}</span></div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RequestCreate;
