import React, { useEffect, useState } from 'react';
import { catalogApi, CatalogItem } from '../api/catalogApi';
import { Search, Package, Box, ChevronRight, LayoutGrid } from 'lucide-react';

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
          <p>Browse and request available IT services for your workspace</p>
        </div>
        <div className="catalog-tools">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'ALL' ? <LayoutGrid size={16} /> : null}
            {cat}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="catalog-card premium-card" onClick={() => onSelectItem(item)}>
            <div className="card-header">
              <div className="item-icon-wrapper">
                <Box size={24} className="item-icon-lucide" />
              </div>
              <span className="cat-badge">{item.categoryName}</span>
            </div>
            <div className="card-body">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <div className="card-footer">
              <div className="info-badge">
                <Package size={12} />
                <span>Standard</span>
              </div>
              <button className="request-btn">
                Request Now
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon"><Search size={48} /></div>
            <p>No services found matching your search criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .catalog-browser { color: var(--color-text-main); animation: slideUp 0.4s ease; }
        
        .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .title-section h2 { margin: 0; font-size: 28px; font-weight: 700; color: var(--color-text-main); }
        .title-section p { margin: 6px 0 0 0; color: var(--color-text-dim); font-size: 15px; }

        .search-wrapper { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 16px; color: var(--color-text-dim); }
        .search-input { 
          background: var(--color-surface); border: 1px solid var(--color-border); 
          color: var(--color-text-main); padding: 12px 16px 12px 44px; border-radius: 20px; 
          width: 320px; outline: none; transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .search-input:focus { 
          border-color: var(--color-primary); 
          box-shadow: 0 0 0 4px var(--color-primary-soft);
          width: 360px;
        }

        .category-tabs { display: flex; gap: 8px; margin-bottom: 40px; overflow-x: auto; padding-bottom: 8px; }
        .tab-btn { 
          display: flex; align-items: center; gap: 8px;
          background: var(--color-surface); border: 1px solid var(--color-border); 
          color: var(--color-text-sub); font-weight: 600; 
          padding: 8px 18px; border-radius: 100px; cursor: pointer; white-space: nowrap; transition: var(--transition);
          font-size: 14px; box-shadow: var(--shadow-sm);
        }
        .tab-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .tab-btn.active { background: var(--color-primary); color: #ffffff; border-color: var(--color-primary); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; }
        
        .catalog-card { 
          background: var(--color-surface); border: 1px solid var(--color-border);
          border-radius: var(--radius-lg); padding: 24px;
          cursor: pointer; transition: var(--transition); min-height: 240px;
          display: flex; flex-direction: column;
          box-shadow: var(--shadow-sm);
        }
        .catalog-card:hover { 
          transform: translateY(-6px); 
          border-color: var(--color-primary); 
          box-shadow: var(--shadow-premium); 
        }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .item-icon-wrapper { 
          padding: 12px; background: var(--color-primary-soft); color: var(--color-primary); 
          border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
        }
        .cat-badge { 
          font-size: 10px; font-weight: 800; background: var(--color-surface-soft); 
          color: var(--color-text-dim); padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
        }

        .card-body { flex: 1; }
        .catalog-card h3 { margin: 0 0 10px 0; font-size: 19px; color: var(--color-text-main); font-weight: 700; }
        .catalog-card p { margin: 0; font-size: 14px; color: var(--color-text-sub); line-height: 1.6; }

        .card-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .info-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-dim); font-weight: 600; }
        
        .request-btn { 
          display: flex; align-items: center; gap: 8px;
          background: var(--color-text-main); color: #fff; border: none; 
          padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; 
          cursor: pointer; transition: var(--transition);
        }
        .catalog-card:hover .request-btn { background: var(--color-primary); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .loading { padding: 120px; text-align: center; color: var(--color-text-dim); font-weight: 600; font-size: 18px; }
        
        .no-results { 
          grid-column: 1 / -1; padding: 100px; text-align: center; 
          background: var(--color-surface-soft); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);
          color: var(--color-text-dim); 
        }
        .no-results-icon { margin-bottom: 20px; opacity: 0.5; }
        .no-results p { font-size: 18px; font-weight: 500; }
      `}</style>
    </div>
  );
};

export default CatalogBrowser;
