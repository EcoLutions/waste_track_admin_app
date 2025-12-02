export enum RouteStatusEnum {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export function getStatusLabel(status: RouteStatusEnum): string {
  const labels = {
    [RouteStatusEnum.PLANNED]: 'Borrador',
    [RouteStatusEnum.ACTIVE]: 'Asignada',
    [RouteStatusEnum.IN_PROGRESS]: 'En Progreso',
    [RouteStatusEnum.COMPLETED]: 'Completada',
    [RouteStatusEnum.CANCELLED]: 'Cancelada'
  };
  return labels[status] || status;
}

export function getStatusClass(status: RouteStatusEnum): string {
  const classes = {
    [RouteStatusEnum.PLANNED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700',
    [RouteStatusEnum.ACTIVE]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700',
    [RouteStatusEnum.IN_PROGRESS]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700',
    [RouteStatusEnum.COMPLETED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700',
    [RouteStatusEnum.CANCELLED]: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700'
  };
  return classes[status] || 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700';
}
