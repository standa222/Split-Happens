export type TUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bankAccount: {
    prefix: string;
    accountNumber: string;
    bankCode: string;
  } | null;
};
