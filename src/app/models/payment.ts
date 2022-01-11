import { CONTRACT_STATUS, IFee } from './contract';
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
  outstanding: IFee;
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

export type PaymentMethodType = 'CreditCardPaymentMethod' | 'GiroPaymentMethod' | 'InvoicePaymentMethod';

export enum CreditCardType {
  Unknown = 'Unknown',
  Visa = 'Visa',
  Mastercard = 'Mastercard',
  Invoice = 'Invoice'
}

export enum InvoicePaymentMethodState {
  Unknown = 'Unknown',
  Waiting = 'Waiting',
  Approved = 'Approved',
  Denied = 'Denied'
}

export enum GiroPaymentMethodType {
  Unknown = 'Unknown',
  BankAccount = 'BankAccount',
  PlusGiro = 'PlusGiro',
  BankGiro = 'BankGiro'
}

export interface PaymentMethod {
  paymentMethodId: number;
  index: number;
  type: PaymentMethodType;
  status: PAYMENT_METHOD_STATUS;
}

export interface PaymentMethodCreditCard extends PaymentMethod {
  expirationDate: string;
  maskedNumber: string;
  cardType: CreditCardType;
}

export interface PaymentMethodInvoice extends PaymentMethod {
  state: InvoicePaymentMethodState;
}

export interface PaymentMethodGiro extends PaymentMethod {
  accountNumber: string;
  giroType: GiroPaymentMethodType;
}

export enum PAYMENT_METHOD_STATUS {
  OK = 'ok',
  PAYMENT_METHOD_ABOUT_TO_EXPIRE = 'payment-method-about-to-expire',
  PAYMENT_METHOD_EXPIRED_LAST_MONTH = 'payment-method-expired-last-month',
  PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO = 'payment-method-expired-more-than-one-month-ago',
  PAYMENT_METHOD_IS_MISSING = 'payment-method-is-missing',
}

export interface PaymentMethodsAPIResponse {
  paymentMethods: PaymentMethod[];
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