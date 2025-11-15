export interface UpdateDistrictRequest {
  districtId: string | null;
  name: string | null;
  code: string | null;
  depotLatitud: string | null;
  depotLongitude: string | null;
  disposalLatitude: string | null;
  disposalLongitude: string | null;
  operationStartTime: string | null;
  operationEndTime: string | null;
  maxRouteDuration: string | null;
}
