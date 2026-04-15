import React, { useEffect, useState } from 'react';
import { catalogApi, ServiceCatalog, CatalogCategory } from '../api/catalogApi';
import { fulfillmentApi } from '../../fulfillment/api/fulfillmentApi';
import FormBuilder from './FormBuilder';

const CatalogManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ServiceCatalog[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'TEMPLATES' | 'CATEGORIES'>('TEMPLATES');
  
  const [isDeploying, setIsDeploying] = useState<number | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    icon: '⚙️',
    categoryId: 0,
    approvalRequired: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tplData, catData, tenantData] = await Promise.all([
        catalogApi.getTemplates(),
        catalogApi.getCategories(),
        fulfillmentApi.getTenants()
      ]);
      setTemplates(tplData);
      setCategories(catData);
      setTenants(tenantData);
      if (catData.length > 0) setNewService(prev => ({ ...prev, categoryId: catData[0].id }));
    } catch (error) {
      console.error('Failed to load catalog data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveService = async (schema: string) => {
    try {
      await catalogApi.createTemplate({ ...newService, jsonSchema: schema });
      alert('New service template registered in Global Library.');
      setIsCreating(false);
      loadData();
    } catch (error) {
      alert('Failed to save service.');
    }
  };

  const handleDeploy = async (templateId: number) => {
    if (!selectedTenant) return;
    try {
      await catalogApi.deployToTenant(templateId, selectedTenant);
      alert('Service deployed successfully to tenant cluster.');
      setIsDeploying(null);
    } catch (error) {
      alert('Deployment failed.');
    }
  };

  if (isLoading) return <div className="loading">Syncing Catalog Infrastructure...</div>;

  return (
    <div className="catalog-management">
      <div className="management-header">
        <div className="title-area">
          <h2>Catalog & Template Governance</h2>
          <p>Global service catalog management for multi-tenant deployment</p>
        </div>
        <div className="view-switcher">
          <button 
            className={`switch-btn ${activeView === 'TEMPLATES' ? 'active' : ''}`}
            onClick={() => setActiveView('TEMPLATES')}
          >
            Template Library
          </button>
          <button 
            className={`switch-btn ${activeView === 'CATEGORIES' ? 'active' : ''}`}
            onClick={() => setActiveView('CATEGORIES')}
          >
            Category Master
          </button>
        </div>
      </div>

      <main className="management-body">
        {isCreating && (
          <div className="create-service-overlay">
            <div className="modal-content glass-panel">
              <div className="modal-header">
                <h2>Design New Service Template</h2>
                <div className="meta-inputs">
                  <div className="input-group">
                    <label>Service Name</label>
                    <input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. AWS S3 Bucket Request" />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select value={newService.categoryId} onChange={e => setNewService({...newService, categoryId: parseInt(e.target.value)})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <FormBuilder 
                onSave={handleSaveService} 
                onCancel={() => setIsCreating(false)} 
              />
            </div>
          </div>
        )}

        {activeView === 'TEMPLATES' ? (
          <div className="template-grid">
            <div className="add-card action-card" onClick={() => setIsCreating(true)}>
              <div className="icon">+</div>
              <h3>Define New Service</h3>
              <p>Create a global template with dynamic form logic</p>
            </div>
            
            {templates.map(tpl => (
              <div key={tpl.id} className="template-card glass-panel">
                <div className="card-top">
                  <div className="icon-box">{tpl.icon || '🛠️'}</div>
                  <span className="category-tag">{tpl.category.name}</span>
                </div>
                <h3>{tpl.name}</h3>
                <p>{tpl.description}</p>
                <div className="card-footer">
                  <span className="schema-badge">Dynamic Schema Ready</span>
                  <button className="deploy-btn" onClick={() => setIsDeploying(tpl.id)}>
                    Deploy to Tenant
                  </button>
                </div>

                {isDeploying === tpl.id && (
                  <div className="deploy-overlay">
                    <h4>Select Target Tenant</h4>
                    <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="modern-select">
                      <option value="">Choose Tenant...</option>
                      {tenants.map(t => (
                        <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                      ))}
                    </select>
                    <div className="overlay-actions">
                      <button className="cancel-btn" onClick={() => setIsDeploying(null)}>Cancel</button>
                      <button className="confirm-btn" onClick={() => handleDeploy(tpl.id)}>Execute</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="category-section">
             <div className="section-header">
                <h3>Global Categories</h3>
                <button className="add-btn">+ Create Category</button>
             </div>
             <div className="category-list">
                {categories.map(cat => (
                  <div key={cat.id} className="category-item glass-panel">
                    <div className="cat-icon">{cat.icon || '📁'}</div>
                    <div className="cat-info">
                      <strong>{cat.name}</strong>
                      <span>{cat.description || 'No description'}</span>
                    </div>
                    <div className="cat-actions">
                      <button className="edit-btn">Edit</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      <style>{`
        .catalog-management { color: #f1f5f9; animation: fadeIn 0.4s ease; }
        
        .management-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
        }
        .title-area h2 { margin: 0; font-size: 24px; }
        .title-area p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }

        .view-switcher { display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; }
        .switch-btn { 
          border: none; background: transparent; color: #94a3b8; padding: 8px 16px; 
          border-radius: 7px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .switch-btn.active { background: rgba(255, 255, 255, 0.1); color: #fff; }

        .template-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 24px; 
        }

        .template-card { 
          display: flex; flex-direction: column; min-height: 220px;
          position: relative; overflow: hidden;
        }
        .action-card {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          background: rgba(255,255,255,0.01);
          border-radius: 16px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 32px; cursor: pointer; transition: all 0.2s;
        }
        .action-card:hover { background: rgba(255,255,255,0.03); border-color: var(--primary); }
        .action-card .icon { font-size: 32px; color: var(--primary); margin-bottom: 12px; }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .icon-box { font-size: 24px; }
        .category-tag { font-size: 10px; font-weight: 800; background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }

        .template-card h3 { margin: 0 0 8px 0; font-size: 18px; color: #fff; }
        .template-card p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; flex: 1; }

        .card-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .schema-badge { font-size: 11px; color: #10b981; font-weight: 600; }
        .deploy-btn { background: var(--primary); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }

        .deploy-overlay { 
          position: absolute; inset: 0; background: rgba(15, 23, 42, 0.95); 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px; text-align: center; z-index: 10;
        }
        .modern-select { width: 100%; margin: 12px 0; background: #1e293b; color: #fff; border: 1px solid #334155; padding: 8px; border-radius: 6px; }
        .overlay-actions { display: flex; gap: 8px; width: 100%; }
        .overlay-actions button { flex: 1; border: none; padding: 8px; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .cancel-btn { background: #334155; color: #fff; }
        .confirm-btn { background: #10b981; color: #fff; }

        .category-section { display: flex; flex-direction: column; gap: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; }
        .category-list { display: flex; flex-direction: column; gap: 12px; }
        .category-item { display: flex; align-items: center; gap: 20px; }
        .cat-icon { font-size: 24px; }
        .cat-info { flex: 1; display: flex; flex-direction: column; }
        .cat-info strong { font-size: 16px; color: #fff; }
        .cat-info span { font-size: 13px; color: #64748b; }
        .add-btn { background: #334155; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .edit-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .loading { padding: 80px; text-align: center; color: #64748b; }

        .create-service-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); 
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 40px; backdrop-filter: blur(10px);
        }
        .modal-content { 
          width: 100%; max-width: 1000px; max-height: 90vh; 
          background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 32px; display: flex; flex-direction: column; overflow: hidden;
        }
        .modal-header { margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; }
        .modal-header h2 { margin: 0 0 20px 0; font-size: 20px; }
        .meta-inputs { display: flex; gap: 20px; }
        .meta-inputs .input-group { flex: 1; }
      `}</style>
    </div>
  );
};

export default CatalogManagement;
