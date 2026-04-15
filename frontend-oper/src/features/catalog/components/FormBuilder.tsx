import React, { useState } from 'react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface FormBuilderProps {
  onSave: (schema: string) => void;
  onCancel: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onSave, onCancel }) => {
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Field',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = () => {
    const schema = JSON.stringify(fields);
    onSave(schema);
  };

  return (
    <div className="form-builder glass-panel">
      <div className="builder-header">
        <h3>Dynamic Form Designer</h3>
        <button className="add-field-btn" onClick={addField}>+ Add Input Field</button>
      </div>

      <div className="builder-body">
        <div className="fields-panel">
          {fields.map((field, index) => (
            <div key={field.id} className="field-editor-card">
              <div className="field-row">
                <div className="input-group">
                  <label>Label</label>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={e => updateField(field.id, { label: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Type</label>
                  <select 
                    value={field.type} 
                    onChange={e => updateField(field.id, { type: e.target.value as any })}
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Numeric</option>
                    <option value="date">Date Picker</option>
                    <option value="select">Dropdown</option>
                  </select>
                </div>
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={e => updateField(field.id, { required: e.target.checked })}
                  />
                  <label>Required</label>
                </div>
                <button className="delete-btn" onClick={() => removeField(field.id)}>Remove</button>
              </div>
              
              {field.type === 'select' && (
                <div className="options-editor">
                  <label>Options (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AWS, Azure, GCP"
                    value={field.options?.join(',') || ''}
                    onChange={e => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <div className="empty-builder">
              <p>No custom fields defined. Click '+ Add Input Field' to start designing.</p>
            </div>
          )}
        </div>

        <aside className="preview-panel">
          <h4>Live Preview</h4>
          <div className="preview-canvas">
            {fields.map(f => (
              <div key={f.id} className="preview-field">
                <label>{f.label}{f.required && <span className="req">*</span>}</label>
                {f.type === 'select' ? (
                  <select disabled className="preview-input">
                    <option>Select an option...</option>
                    {f.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} disabled className="preview-input" placeholder={`Enter ${f.label.toLowerCase()}...`} />
                )}
              </div>
            ))}
            {fields.length === 0 && <span className="hint">Form preview will appear here</span>}
          </div>
        </aside>
      </div>

      <div className="builder-footer">
        <button className="cancel-btn" onClick={onCancel}>Cancel Designer</button>
        <button className="save-btn" onClick={handleSave}>Generate & Save Schema</button>
      </div>

      <style>{`
        .form-builder { display: flex; flex-direction: column; height: 100%; border-color: #3b82f6; }
        .builder-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .add-field-btn { background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }

        .builder-body { display: grid; grid-template-columns: 1fr 300px; gap: 32px; flex: 1; min-height: 400px; }
        
        .fields-panel { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; max-height: 500px; padding-right: 8px; }
        .field-editor-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; }
        
        .field-row { display: flex; align-items: flex-end; gap: 16px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .input-group label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; }
        .input-group input, .input-group select { background: #0f172a; border: 1px solid #334155; color: #fff; padding: 10px; border-radius: 6px; }

        .checkbox-group { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .delete-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }

        .options-editor { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
        .options-editor label { font-size: 11px; color: #64748b; }

        .preview-panel { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 24px; }
        .preview-panel h4 { margin-top: 0; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .preview-canvas { display: flex; flex-direction: column; gap: 16px; }
        .preview-field label { display: block; font-size: 13px; margin-bottom: 6px; color: #94a3b8; }
        .preview-field .req { color: #ef4444; margin-left: 2px; }
        .preview-input { width: 100%; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #64748b; font-size: 13px; }
        
        .builder-footer { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; pt: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        .cancel-btn { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .save-btn { background: #10b981; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; }

        .empty-builder { border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default FormBuilder;
