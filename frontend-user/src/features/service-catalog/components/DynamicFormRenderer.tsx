import React from 'react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface DynamicFormRendererProps {
  schema: string;
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  disabled?: boolean;
}

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ schema, values, onChange, disabled }) => {
  let fields: FormField[] = [];
  try {
    fields = JSON.parse(schema);
  } catch (e) {
    console.error('Failed to parse form schema', e);
    return <div className="error">Invalid Form Configuration</div>;
  }

  return (
    <div className="dynamic-form">
      {fields.map(field => (
        <div key={field.id} className="form-group">
          <label>
            {field.label}
            {field.required && <span className="req">*</span>}
          </label>
          
          {field.type === 'select' ? (
            <select 
              value={values[field.id] || ''} 
              onChange={e => onChange(field.id, e.target.value)}
              required={field.required}
              disabled={disabled}
            >
              <option value="">Select an option...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input 
              type={field.type}
              value={values[field.id] || ''}
              onChange={e => onChange(field.id, e.target.value)}
              required={field.required}
              disabled={disabled}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          )}
        </div>
      ))}

      <style>{`
        .dynamic-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: #334155; }
        .form-group .req { color: #ef4444; margin-left: 2px; }
        
        input, select { 
          width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; 
          font-size: 15px; outline: none; transition: border 0.2s;
        }
        input:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
};

export default DynamicFormRenderer;
