export interface UpdateDriverRequest {
  driverId: string | null;
  districtId: string | null;
  firstName: string | null;
  lastName: string | null;
  documentNumber: string | null;
  phoneNumber: string | null;
  userId: string | null;
  driverLicense: string | null;
  licenseExpiryDate: string | null; // LocalDate → ISO string
  emailAddress: string | null;
}
