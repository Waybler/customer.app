import { Fee } from './contract';
import { API_RESULT } from './api';

export interface InvoiceAmount {
  currency: string;
  total: number;
  value: number;
  vat: number;
}

export interface Invoice {
  amount: InvoiceAmount;
  createdAt: string;
  dueAt: string;
  invoiceId: number;
  label: string;
  outstanding: Fee;
  paid: boolean;
}

export interface UninvoicedGroup {
  type: SalesType;
  amount: InvoiceAmount;
}

export interface UninvoicedAPIResponse {
  groups: UninvoicedGroup[];
  result: API_RESULT;
  total: InvoiceAmount;

}

export interface BillingInvoicesAPIResponse {
  invoices: Invoice[];
  result: API_RESULT;
}

export type PaymentMethod = 'CreditCardPaymentMethod' | 'GiroPaymentMethod' | 'InvoicePaymentMethod';

export interface Payment {
  expirationDate: string;
  maskedNumber: string;
  cardType: string;
  paymentMethodId: number;
  index: number;
  type: PaymentMethod;
}

export interface PaymentMethodsAPIResponse {
  paymentMethods: Payment[];
  result: API_RESULT;
}

export enum SalesType {
  UserSubscription = 'UserSubscription',
  UserSubscriptionRepayment = 'UserSubscriptionRepayment',
  Consumption = 'Consumption',
  ConsumptionRepayment = 'ConsumptionRepayment',
  Maintenance = 'Maintenance',
  MaintenanceRepayment = 'MaintenanceRepayment',
  StationFee = 'StationFee',
  StationFeeRepayment = 'StationFeeRepayment',
}