import React, { useEffect, useState } from 'react';
import { catalogApi, ServiceCatalog, CatalogCategory } from '../api/catalogApi';
import { fulfillmentApi } from '../../fulfillment/api/fulfillmentApi';
import FormBuilder from './FormBuilder';
 
interface Tenant {
  tenantId: string;
  name: string;
}

const CatalogManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ServiceCatalog[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'TEMPLATES' | 'CATEGORIES'>('TEMPLATES');
  
  const [isDeploying, setIsDeploying] = useState<number | null>(null);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  
  // Service Template State
  const [editingTemplate, setEditingTemplate] = useState<ServiceCatalog | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    icon: '⚙️',
    categoryId: 0,
    approvalRequired: true
  });

  // Category State
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📁'
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
      if (catData.length > 0) setServiceForm(prev => ({ ...prev, categoryId: catData[0].id }));
    } catch (error) {
      console.error('Failed to load catalog data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Template Handlers ---

  const handleCreateTemplate = () => {
    setServiceForm({
      name: '',
      description: '',
      icon: '⚙️',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      approvalRequired: true
    });
    setEditingTemplate(null);
    setIsCreating(true);
  };

  const handleEditTemplate = (tpl: ServiceCatalog) => {
    setServiceForm({
      name: tpl.name,
      description: tpl.description,
      icon: tpl.icon || '⚙️',
      categoryId: tpl.category.id,
      approvalRequired: tpl.approvalRequired
    });
    setEditingTemplate(tpl);
    setIsCreating(true);
  };

  const handleSaveService = async (schema: string) => {
    try {
      if (editingTemplate) {
        await catalogApi.updateTemplate(editingTemplate.id, { ...serviceForm, jsonSchema: schema });
        alert('Service template updated.');
      } else {
        await catalogApi.createTemplate({ ...serviceForm, jsonSchema: schema });
        alert('New service template registered.');
      }
      setIsCreating(false);
      loadData();
    } catch (error) {
      alert('Failed to save service.');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this global template?')) return;
    try {
      await catalogApi.deleteTemplate(id);
      loadData();
    } catch (error) {
      alert('Failed to delete template.');
    }
  };

  const handleDeploy = async (templateId: number) => {
    if (selectedTenants.length === 0) {
      alert('Please select at least one tenant.');
      return;
    }
    try {
      await catalogApi.deployToTenants(templateId, selectedTenants);
      alert(`Service deployed successfully to ${selectedTenants.length} tenants.`);
      setIsDeploying(null);
      setSelectedTenants([]);
    } catch (error) {
      alert('Deployment failed.');
    }
  };

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants(prev => 
      prev.includes(tenantId) 
        ? prev.filter(id => id !== tenantId) 
        : [...prev, tenantId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTenants.length === tenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(tenants.map(t => t.tenantId));
    }
  };

  // --- Category Handlers ---

  const handleCreateCategory = () => {
    setCategoryForm({ name: '', description: '', icon: '📁' });
    setEditingCategory(null);
    setIsCreatingCategory(true);
  }

  const handleEditCategory = (cat: CatalogCategory) => {
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '📁'
    });
    setEditingCategory(cat);
    setIsCreatingCategory(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await catalogApi.updateCategory(editingCategory.id, categoryForm);
      } else {
        await catalogApi.createCategory(categoryForm);
      }
      setIsCreatingCategory(false);
      loadData();
    } catch (error) {
      alert('Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category? This will fail if there are services attached.')) return;
    try {
      await catalogApi.deleteCategory(id);
      loadData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('Cannot delete category: It still contains active services.');
      } else {
        alert('Failed to delete category.');
      }
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
        {/* Template Modal */}
        {isCreating && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel">
              <div className="modal-header">
                <h2>{editingTemplate ? 'Modify Service Template' : 'Design New Service Template'}</h2>
                <div className="meta-inputs">
                  <div className="input-group">
                    <label>Service Name</label>
                    <input value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} placeholder="e.g. AWS S3 Bucket Request" />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select value={serviceForm.categoryId} onChange={e => setServiceForm({...serviceForm, categoryId: parseInt(e.target.value)})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <FormBuilder 
                onSave={handleSaveService} 
                onCancel={() => setIsCreating(false)} 
                initialSchema={editingTemplate?.jsonSchema}
              />
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCreatingCategory && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel small-modal">
               <div className="modal-header">
                 <h2>{editingCategory ? 'Edit Category' : 'Create Global Category'}</h2>
               </div>
               <div className="category-form">
                 <div className="input-group">
                    <label>Icon (Emoji)</label>
                    <input value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} maxLength={2} />
                 </div>
                 <div className="input-group">
                    <label>Category Name</label>
                    <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                 </div>
                 <div className="input-group">
                    <label>Description</label>
                    <textarea value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
                 </div>
               </div>
               <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setIsCreatingCategory(false)}>Cancel</button>
                  <button className="confirm-btn" onClick={handleSaveCategory} data-testid="save-category-btn">Save Category</button>
               </div>
            </div>
          </div>
        )}

        {activeView === 'TEMPLATES' ? (
          <div className="template-grid">
            <div className="add-card action-card" onClick={handleCreateTemplate} data-testid="add-template-card">
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
                  <div className="left-actions">
                    <button className="icon-action" title="Edit" onClick={() => handleEditTemplate(tpl)}>✏️</button>
                    <button className="icon-action delete" title="Delete" onClick={() => handleDeleteTemplate(tpl.id)}>🗑️</button>
                  </div>
                  <button className="deploy-btn" onClick={() => setIsDeploying(tpl.id)}>
                    Deploy to Tenant
                  </button>
                </div>

                {isDeploying === tpl.id && (
                  <div className="deploy-overlay">
                    <h4>Deploy to Multiple Tenants</h4>
                    <div className="tenant-selector-area">
                      <div className="selector-header">
                        <span>Select Target Tenants</span>
                        <button className="text-btn" onClick={toggleSelectAll}>
                          {selectedTenants.length === tenants.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="tenant-list-scroll">
                        {tenants.map(t => (
                          <label key={t.tenantId} className="tenant-checkbox-item">
                            <input 
                              type="checkbox" 
                              checked={selectedTenants.includes(t.tenantId)}
                              onChange={() => toggleTenant(t.tenantId)}
                            />
                            <span className="tenant-name">{t.name}</span>
                            <span className="tenant-id-tag">{t.tenantId}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="overlay-actions">
                      <button className="cancel-btn" onClick={() => { setIsDeploying(null); setSelectedTenants([]); }}>Cancel</button>
                      <button className="confirm-btn" onClick={() => handleDeploy(tpl.id)} disabled={selectedTenants.length === 0}>
                        Deploy to {selectedTenants.length} Tenants
                      </button>
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
                <button className="add-btn" onClick={handleCreateCategory} data-testid="create-category-btn">+ Create Category</button>
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
                      <button className="edit-btn" onClick={() => handleEditCategory(cat)}>Edit</button>
                      <button className="delete-btn-sm" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      <style>{`
        .catalog-management { color: #f1f5f9; animation: fadeIn 0.4s ease; min-height: 80vh; }
        
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
        .left-actions { display: flex; gap: 8px; }
        .icon-action { background: rgba(255,255,255,0.05); border: none; padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .icon-action:hover { background: rgba(255,255,255,0.1); }
        .icon-action.delete:hover { background: rgba(239, 68, 68, 0.2); }
        
        .deploy-btn { background: var(--primary); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }

        .deploy-overlay { 
          position: absolute; inset: 0; background: rgba(15, 23, 42, 0.98); 
          display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start;
          padding: 24px; z-index: 10;
        }
        .deploy-overlay h4 { margin: 0 0 16px 0; font-size: 16px; text-align: center; }
        .tenant-selector-area { flex: 1; display: flex; flex-direction: column; min-height: 0; margin-bottom: 20px; }
        .selector-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .selector-header span { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
        .text-btn { background: transparent; border: none; color: var(--primary); font-size: 11px; cursor: pointer; padding: 0; font-weight: 600; }
        .tenant-list-scroll { 
          background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
          overflow-y: auto; flex: 1; display: flex; flex-direction: column;
        }
        .tenant-checkbox-item { 
          display: flex; align-items: center; padding: 10px 12px; gap: 10px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.02);
          transition: background 0.2s;
        }
        .tenant-checkbox-item:hover { background: rgba(255,255,255,0.03); }
        .tenant-checkbox-item input { width: 16px; height: 16px; accent-color: var(--primary); }
        .tenant-name { font-size: 13px; color: #fff; flex: 1; }
        .tenant-id-tag { font-size: 10px; color: #475569; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 3px; }

        .overlay-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .overlay-actions button { flex: 1; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .overlay-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
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
        .add-btn { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .edit-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }
        .delete-btn-sm { background: transparent; border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; margin-left: 8px; }

        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); 
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 40px; backdrop-filter: blur(10px);
        }
        .modal-content { 
          width: 100%; max-width: 1100px; max-height: 92vh; 
          background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 32px; display: flex; flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .small-modal { max-width: 500px; }
        .modal-header { margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; }
        .modal-header h2 { margin: 0 0 20px 0; font-size: 20px; }
        .meta-inputs { display: flex; gap: 20px; }
        .meta-inputs .input-group { flex: 1; }

        .category-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
        .input-group input, .input-group select, .input-group textarea { background: #1e293b; border: 1px solid #334155; color: #fff; padding: 10px; border-radius: 6px; height: 100%; }
        .input-group textarea { min-height: 80px; resize: vertical; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .loading { padding: 80px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default CatalogManagement;
