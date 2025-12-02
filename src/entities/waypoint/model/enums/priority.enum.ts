export enum PriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export function getPriorityLabel(priority: PriorityEnum): string {
  const labels = {
    [PriorityEnum.LOW]: 'Baja',
    [PriorityEnum.MEDIUM]: 'Media',
    [PriorityEnum.HIGH]: 'Alta',
    [PriorityEnum.CRITICAL]: 'Crítica'
  };
  return labels[priority] || priority;
}

export function getPriorityClass(priority: PriorityEnum): string {
  const classes = {
    [PriorityEnum.LOW]: 'text-gray-500',
    [PriorityEnum.MEDIUM]: 'text-blue-600',
    [PriorityEnum.HIGH]: 'text-orange-600',
    [PriorityEnum.CRITICAL]: 'text-red-600 font-semibold'
  };
  return classes[priority] || 'text-gray-500';
}
