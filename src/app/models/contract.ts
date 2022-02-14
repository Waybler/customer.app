import { ChargeZone, ContractUserReservedStation } from './chargeZone';

export enum IContractStatus {
  CONTRACT_OCCUPIED = 'contract-occupied',
  OK = 'ok',
  NOT_ACCEPTED_CONTRACT_TERMS = 'not-accepted-contract-terms',
  NOT_ACCEPTED_USER_TERMS = 'not-accepted-user-terms',
  TIME_RESTRICTED = 'time-restricted',
  OWNER_PAYMENT_METHOD_MISSING = 'owner-payment-method-missing',
  USER_PAYMENT_METHOD_MISSING = 'user-payment-method-missing',
  USER_PAYMENT_METHOD_ABOUT_TO_EXPIRE = 'user-payment-method-about-to-expire',
  USER_PAYMENT_METHOD_HAS_EXPIRED = 'user-payment-method-has-expired',
  USER_PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO = 'user-payment-method-expired-more-than-one-month-ago',
}

export enum ContractType {
  Charging = 'Charging',
  Heater = 'Heater'
}

export interface Contract {
  [key: string]: any;
}

export interface ContractUser {
  id: number;
  activationDate: Date;
  contract: Contract;
  externalReference: string;
  isActive: boolean;
  reservedStation: ContractUserReservedStation[];
  terms: any[];
  user: any;
  waitingTerms?: any[];
  zoneId: number;
}

export interface Fee {
  value: number;
  currency: string;
}

export interface SubscriptionFee extends Fee {
  actual: number;
  max: number;
}

export interface Terms {
  cancellation?: number;
  consumptionFee: Fee;
  consumptionFeeTotal?: Fee | null;
  maxParallelSessions?: number;
  subscriptionFee?: Fee;
  subscriptionFeeTotal?: Fee;

}

export interface FutureTerms extends Terms {
  accepted: boolean;
  acceptedAt: Date;
  autostart: boolean;
  contractUserId: number;
  contractUserTermsId: number;
  consumptionFeeTotal: Fee | null;
  validFrom: Date;
}

export interface NewTerms extends Terms {
  autostart: boolean;
  contractUserId: number;
  contractUserTermsId: number;
}

export interface NewTermsIfUserCanAcceptContractTerms extends NewTerms {
  cancellation: number;
   users: ContractUser;
  validFrom: Date;
}

export interface TermsAndConditions {
  termsId: number;
  html: string;
}