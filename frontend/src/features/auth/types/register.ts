export interface RegisterBeekeeperRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  hid: string | null;
  phone: string | null;
  agriculturalHoldingNumber: number | null;
}

export interface RegisterBeekeeperResponse {
  userId: string;
  beekeeperProfileId: string;
  email: string;
}
