import { DiscountValue } from "~/defs/discount";

export function checkFormString(label: string, value?: string | null) {
  if (!value) {
    shopify.toast.show(`${label} is required`, {
      duration: 5000,
      isError: true,
    });
    return false;
  }
  return true;
}

export function checkFormNumber(
  label: string,
  value?: number | null,
  min?: number,
  max?: number,
) {
  if ((value || 0) < (min || 1)) {
    shopify.toast.show(`${label}`, {
      duration: 5000,
      isError: true,
    });
    return false;
  }
  if (max && (value ?? 0) > max) {
    shopify.toast.show(`${label}`, {
      duration: 5000,
      isError: true,
    });
    return false;
  }

  return true;
}

export function checkFormArray<T extends any>(
  label: string,
  value?: Array<T> | null,
  min?: number,
  max?: number,
) {
  if ((value?.length || 0) < (min || 1)) {
    shopify.toast.show(`${label}`, {
      duration: 5000,
      isError: true,
    });
    return false;
  }

  if (max && (value?.length ?? 0) > max) {
    shopify.toast.show(`${label}`, {
      duration: 5000,
      isError: true,
    });
    return false;
  }
  return true;
}

export function checkDiscountValue(label: string, dval: DiscountValue) {
  if (dval.type === "fix") {
    return checkFormNumber(label, dval.value);
  }
  return checkFormNumber(label, dval.value);
}
