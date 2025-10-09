export interface DriverResponse {
  id: string | null;
  districtId: string | null;
  firstName: string | null;
  lastName: string | null;
  documentNumber: string | null;
  phoneNumber: string | null;
  userId: string | null;
  driverLicense: string | null;
  licenseExpiryDate: string | null; // LocalDate → ISO string
  emailAddress: string | null;
  totalHoursWorked: number | null;
  lastRouteCompletedAt: string | null; // LocalDateTime → ISO string
  status: string | null;
  assignedVehicleId: string | null;
  createdAt: string | null; // LocalDateTime → ISO string
  updatedAt: string | null; // LocalDateTime → ISO string
}
