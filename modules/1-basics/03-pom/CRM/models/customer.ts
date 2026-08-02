// Shared contract for customer data used by POMs, factories, and specs.
// Fields remain flat because they map directly to the current CRM form.
export interface CustomerInfo {
  company: string;
  vat?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  language?: string;
  currency?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
}
