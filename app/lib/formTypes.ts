export interface FieldOption {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
}

export interface FormFieldData {
  id?: string;
  label: string;
  type: "text" | "number" | "textarea";
  placeholder?: string;
  required: boolean;
  order: number;
  options: FieldOption;
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  published: boolean;
  fields: FormFieldData[];
}

export function parseOptions(optionsJson: string): FieldOption {
  try {
    return JSON.parse(optionsJson);
  } catch {
    return {};
  }
}

export function stringifyOptions(options: FieldOption): string {
  return JSON.stringify(options);
}

export function getFieldOptionKeys(type: "text" | "number" | "textarea"): (keyof FieldOption)[] {
  switch (type) {
    case "text":
    case "textarea":
      return ["minLength", "maxLength"];
    case "number":
      return ["min", "max", "step"];
    default:
      return [];
  }
}

export function validateForm(data: FormData): string[] {
  const errors: string[] = [];
  
  if (!data.title.trim()) {
    errors.push("Form title is required");
  }
  
  if (data.fields.length === 0) {
    errors.push("Form must have at least one field");
  }
  
  data.fields.forEach((field, index) => {
    if (!field.label.trim()) {
      errors.push(`Field ${index + 1}: Label is required`);
    }
  });
  
  return errors;
}
