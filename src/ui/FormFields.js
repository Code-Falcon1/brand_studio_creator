import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

function fieldId(sectionId, key) {
  return `${sectionId}-${key}`;
}

export function Field({ sectionId, field, value, onChange }) {
  const { t } = useI18n();
  const id = fieldId(sectionId, field.key);
  const common = {
    id,
    name: field.key,
    value: value ?? '',
    onChange: (e) => onChange(field.key, e.target.value),
  };

  let label = field.label;
  if (field.labelKey) {
    const translated = t(field.labelKey);
    if (translated && translated !== field.labelKey) label = translated;
  }

  let placeholder = field.placeholder || '';
  if (field.placeholderKey) {
    const translated = t(field.placeholderKey);
    if (translated && translated !== field.placeholderKey) placeholder = translated;
  }

  if (field.type === 'select') {
    return (
      <label className="Field" htmlFor={id}>
        <div className="Field-label">{label}</div>
        <select {...common}>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value} disabled={Boolean(opt.disabled)}>
              {opt.labelKey ? (t(opt.labelKey) === opt.labelKey ? opt.label : t(opt.labelKey)) : opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="Field" htmlFor={id}>
        <div className="Field-label">{label}</div>
        <textarea
          id={id}
          name={field.key}
          rows={field.rows || 3}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </label>
    );
  }

  if (field.type === 'number') {
    return (
      <label className="Field" htmlFor={id}>
        <div className="Field-label">{label}</div>
        <input
          id={id}
          name={field.key}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </label>
    );
  }

  if (field.type === 'toggle') {
    return (
      <label className="Field Field--toggle" htmlFor={id}>
        <input
          id={id}
          name={field.key}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.key, e.target.checked)}
        />
        <span>{label}</span>
      </label>
    );
  }

  if (field.type === 'password') {
    return (
      <label className="Field" htmlFor={id}>
        <div className="Field-label">{label}</div>
        <input
          id={id}
          name={field.key}
          type="password"
          autoComplete="off"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </label>
    );
  }

  if (field.type === 'brand_select') return null;
  if (field.type === 'reference_upload') return null;

  return (
    <label className="Field" htmlFor={id}>
      <div className="Field-label">{label}</div>
      <input
        id={id}
        name={field.key}
        type="text"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    </label>
  );
}

export function AccordionCard({ title, open, onToggle, children, className }) {
  return (
    <details className={`Card Card--accordion ${className || ''}`} open={open} onToggle={onToggle}>
      <summary className="Card-title Card-title--summary">{title}</summary>
      <div className="Card-body">{children}</div>
    </details>
  );
}

function defaultOpenSections(sections, mobile) {
  const open = {};
  for (const section of sections) open[section.id] = !mobile;
  if (mobile) {
    open.output = true;
    open.network = true;
    open.creative = false;
    open.overlay = false;
    open.constraints = false;
    open.storage = false;
  }
  return open;
}

export function SettingsForm({ schema, settings, onChange, mobile }) {
  const { t } = useI18n();
  const sections = schema.filter((s) => s.id !== 'brand' && s.id !== 'input');
  const [openSections, setOpenSections] = useState(() => defaultOpenSections(sections, mobile));

  useEffect(() => {
    setOpenSections(defaultOpenSections(sections, mobile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  return (
    <div className="Settings">
      {sections.map((section) => (
        <AccordionCard
          key={section.id}
          title={
            section.titleKey ? (t(section.titleKey) === section.titleKey ? section.title : t(section.titleKey)) : section.title
          }
          open={Boolean(openSections[section.id])}
          onToggle={(e) => {
            const nextOpen = e.target?.open;
            setOpenSections((prev) => ({ ...prev, [section.id]: Boolean(nextOpen) }));
          }}
        >
          <div className="Grid">
            {section.fields
              .filter((field) => {
                if (!field.visibleIf) return true;
                const { key, equals } = field.visibleIf;
                return settings[key] === equals;
              })
              .map((field) => (
                <Field
                  key={field.key}
                  sectionId={section.id}
                  field={field}
                  value={settings[field.key]}
                  onChange={onChange}
                />
              ))}
          </div>
        </AccordionCard>
      ))}
    </div>
  );
}
