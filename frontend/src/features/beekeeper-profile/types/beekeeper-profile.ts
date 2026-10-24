export type BeekeeperProfile = {
  id: string;
  firstName: string;
  lastName: string;
  hid: string | null;
  phone: string | null;
  agriculturalHoldingNumber: number | null;
};

export type UpdateMyProfileRequest = {
  firstName: string;
  lastName: string;
  email: string;
  hid: string | null;
  phone: string | null;
  agriculturalHoldingNumber: number | null;
};

export type UpdateMyProfileResponse = BeekeeperProfile & {
  email: string;
};
