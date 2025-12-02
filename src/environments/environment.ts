export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api/v1/',
  websocketUrl: 'ws://localhost:8080/ws',
  googleMaps: {
    apiKey: 'AIzaSyCNC6IN3TDO0SyxOuna_bWteD00CqEhpps',
    version: 'weekly',
    libraries: ['places', 'marker'] as const,
    mapIds: {
      depot: '43b263c8b53f536b75a7140b',
      disposal: '43b263c8b53f536b75a7140b'
    }
  },
  enableDebugTools: false,
  logLevel: 'error'
};
