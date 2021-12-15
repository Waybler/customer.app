export enum CONTRACT_STATUS {
  CONTRACT_OCCUPIED = 'contract-occupied',
  OK = 'ok',
  NOT_ACCEPTED_CONTRACT_TERMS = 'not-accepted-contract-terms',
  NOT_ACCEPTED_USER_TERMS = 'not-accepted-user-terms',
  TIME_RESTRICTED = 'time-restricted',
  OWNER_PAYMENT_METHOD_MISSING = 'owner-payment-method-missing',
  USER_PAYMENT_METHOD_MISSING = 'user-payment-method-missing',
  USER_PAYMENT_METHOD_ABOUT_TO_EXPIRE = 'user-payment-method-about-to-expire',
  USER_PAYMENT_METHOD_EXPIRED_LAST_MONTH = 'user-payment-method-expired-last-month',
  USER_PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO = 'user-payment-method-expired-more-than-one-month-ago',
}

export enum ContractType {
  Charging = 'Charging',
  Heater = 'Heater'
}

export interface IFee {
  value: number;
  currency: string;
}

export interface ITerms {
  subscriptionFee: IFee;
  consumptionFee: IFee;
  cancellation: number;
}

export interface TermsAndConditions {
  termsId: number;
  html: string;
}