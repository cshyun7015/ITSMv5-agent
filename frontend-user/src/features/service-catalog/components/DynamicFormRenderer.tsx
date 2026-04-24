import React from 'react';
import apiClient from '../../../api/client';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'code-select' | 'file';
  required: boolean;
  options?: string[];
  codeGroupId?: string;
  // Conditional Logic
  dependsOnId?: string;
  dependsOnValue?: string;
}

interface DynamicFormRendererProps {
  schema: string;
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
}

const CodeSelect: React.FC<{ 
  codeGroupId: string, 
  value: any, 
  onChange: (val: any) => void, 
  required?: boolean, 
  disabled?: boolean 
}> = ({ codeGroupId, value, onChange, required, disabled }) => {
  const [options, setOptions] = React.useState<{codeId: string, codeName: string}[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get(`/codes/group/${codeGroupId}`)
      .then(res => setOptions(res.data))
      .catch(err => console.error(`Failed to fetch codes for ${codeGroupId}`, err))
      .finally(() => setLoading(false));
  }, [codeGroupId]);

  return (
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      required={required}
      disabled={disabled || loading}
      className="dynamic-select"
    >
      <option value="">{loading ? 'Loading options...' : 'Select an option...'}</option>
      {options.map(opt => (
        <option key={opt.codeId} value={opt.codeId}>{opt.codeName}</option>
      ))}
    </select>
  );
};

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ schema, values = {}, onChange, disabled }) => {
  let fields: FormField[] = [];
  try {
    fields = JSON.parse(schema);
  } catch (e) {
    console.error('Failed to parse form schema', e);
    return <div className="error-message"><FileText size={18} /> Invalid Form Configuration</div>;
  }

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(id, file);
    }
  };

  const isFieldVisible = (field: FormField) => {
    if (!field.dependsOnId) return true;
    
    const dependencyValue = values[field.dependsOnId];
    if (dependencyValue === undefined || dependencyValue === null || dependencyValue === '') {
      return false;
    }
    
    // Strict comparison after safe string conversion
    return String(dependencyValue).toLowerCase() === String(field.dependsOnValue).toLowerCase();
  };

  const visibleFields = fields.filter(isFieldVisible);

  return (
    <div className="dynamic-form">
      {visibleFields.map(field => (
        <div key={field.id} className="form-group">
          <label>
            {field.label}
            {field.required && <span className="req">*</span>}
          </label>
          
          {field.type === 'select' ? (
            field.codeGroupId ? (
              <CodeSelect 
                codeGroupId={field.codeGroupId}
                value={values[field.id] || ''}
                onChange={val => onChange(field.id, val)}
                required={field.required}
                disabled={disabled}
              />
            ) : (
              <select 
                value={values[field.id] || ''} 
                onChange={e => onChange(field.id, e.target.value)}
                required={field.required}
                disabled={disabled}
                className="dynamic-select"
              >
                <option value="">Select an option...</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )
          ) : field.type === 'file' ? (
            <div className={`file-upload-wrapper ${values[field.id] ? 'has-file' : ''}`}>
               <input 
                type="file"
                id={`file-${field.id}`}
                onChange={e => handleFileChange(field.id, e)}
                required={field.required && !values[field.id]}
                disabled={disabled}
                className="file-hidden-input"
              />
              <label htmlFor={`file-${field.id}`} className="file-custom-label">
                {values[field.id] ? (
                  <>
                    <CheckCircle2 size={20} className="success-icon" />
                    <span className="file-name">{(values[field.id] as File).name}</span>
                    <span className="change-hint">Click to change</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Choose a file or drag and drop</span>
                    <span className="file-hint">PDF, PNG, JPG up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          ) : (
            <input 
              type={field.type}
              value={values[field.id] || ''}
              onChange={e => onChange(field.id, e.target.value)}
              required={field.required}
              disabled={disabled}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="dynamic-input"
            />
          )}
        </div>
      ))}

      <style>{`
        .dynamic-form { display: flex; flex-direction: column; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .form-group label { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .form-group .req { color: #ef4444; margin-left: 4px; }
        
        .dynamic-input, .dynamic-select { 
          width: 100%; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 10px; 
          font-size: 15px; outline: none; transition: var(--transition);
          background: var(--color-surface); color: var(--color-text-main);
          box-shadow: var(--shadow-sm);
        }
        .dynamic-input:focus, .dynamic-select:focus { 
          border-color: var(--color-primary); 
          box-shadow: 0 0 0 4px var(--color-primary-soft);
        }

        .file-upload-wrapper {
          position: relative;
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          background: var(--color-surface-soft);
          transition: var(--transition);
        }
        .file-upload-wrapper:hover { border-color: var(--color-primary); background: var(--color-primary-soft); }
        .file-upload-wrapper.has-file { border-color: var(--status-active); border-style: solid; background: rgba(16, 185, 129, 0.05); }

        .file-hidden-input {
          position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;
        }

        .file-custom-label {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 32px 20px; color: var(--color-text-dim); gap: 8px; cursor: pointer;
          text-align: center;
        }
        .file-upload-wrapper:hover .file-custom-label { color: var(--color-primary); }
        .file-hint { font-size: 12px; opacity: 0.7; }
        
        .success-icon { color: var(--status-active); }
        .file-name { color: var(--color-text-main); font-weight: 600; font-size: 14px; }
        .change-hint { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; opacity: 0.6; }

        .error-message { 
          padding: 16px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px; color: #ef4444; display: flex; align-items: center; gap: 10px; font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DynamicFormRenderer;
