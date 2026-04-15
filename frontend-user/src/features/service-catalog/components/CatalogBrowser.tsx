import React, { useEffect, useState } from 'react';
import { catalogApi, CatalogItem } from '../api/catalogApi';

interface CatalogBrowserProps {
  onSelectItem: (item: CatalogItem) => void;
}

const CatalogBrowser: React.FC<CatalogBrowserProps> = ({ onSelectItem }) => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const data = await catalogApi.getMyCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Failed to load catalog', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(catalog.map(item => item.categoryName)))];

  const filteredItems = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return <div className="loading">Initializing Service Catalog...</div>;

  return (
    <div className="catalog-browser">
      <div className="catalog-header">
        <div className="title-section">
          <h2>Service Catalog</h2>
          <p>Browse and request available IT services</p>
        </div>
        <div className="catalog-tools">
          <input 
            type="text" 
            placeholder="Search services..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="catalog-card glass-panel" onClick={() => onSelectItem(item)}>
            <div className="card-header">
              <div className="item-icon">{item.icon || '📦'}</div>
              <span className="cat-badge">{item.categoryName}</span>
            </div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="card-footer">
              <span className="req-time">⚡ Instant Request</span>
              <button className="request-btn">Request Now</button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="no-results">No services found matching your search criteria.</div>
        )}
      </div>

      <style>{`
        .catalog-browser { color: #f1f5f9; animation: slideUp 0.4s ease; }
        
        .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .title-section h2 { margin: 0; font-size: 24px; }
        .title-section p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }

        .search-input { 
          background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); 
          color: #fff; padding: 10px 20px; border-radius: 20px; width: 280px; outline: none;
        }

        .category-tabs { display: flex; gap: 12px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 4px; }
        .tab-btn { 
          background: transparent; border: none; color: #94a3b8; font-weight: 600; 
          padding: 8px 16px; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: all 0.2s;
        }
        .tab-btn.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        
        .catalog-card { 
          cursor: pointer; transition: all 0.2s; min-height: 200px;
          display: flex; flex-direction: column;
        }
        .catalog-card:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.3); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .item-icon { font-size: 28px; }
        .cat-badge { font-size: 10px; font-weight: 800; background: rgba(148, 163, 184, 0.1); color: #94a3b8; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }

        .catalog-card h3 { margin: 0 0 8px 0; font-size: 18px; color: #fff; }
        .catalog-card p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; flex: 1; }

        .card-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .req-time { font-size: 11px; color: #64748b; font-weight: 600; }
        .request-btn { background: #334155; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .loading, .no-results { padding: 80px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default CatalogBrowser;
