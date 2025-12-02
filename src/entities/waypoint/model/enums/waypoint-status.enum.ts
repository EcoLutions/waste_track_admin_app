export enum WaypointStatusEnum {
  PENDING = 'PENDING',
  VISITED = 'VISITED',
  SKIPPED = 'SKIPPED'
}

export function getWaypointStatusLabel(status: WaypointStatusEnum): string {
  const labels = {
    [WaypointStatusEnum.PENDING]: 'Pendiente',
    [WaypointStatusEnum.VISITED]: 'Visitado',
    [WaypointStatusEnum.SKIPPED]: 'Omitido'
  };
  return labels[status] || status;
}

export function getWaypointStatusClass(status: WaypointStatusEnum): string {
  const classes = {
    [WaypointStatusEnum.PENDING]: 'px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded',
    [WaypointStatusEnum.VISITED]: 'px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded',
    [WaypointStatusEnum.SKIPPED]: 'px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded'
  };
  return classes[status] || 'px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded';
}
