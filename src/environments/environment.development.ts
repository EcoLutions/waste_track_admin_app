export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1/',
  googleMaps: {
    apiKey: 'AIzaSyCNC6IN3TDO0SyxOuna_bWteD00CqEhpps',
    version: 'weekly',
    libraries: ['places', 'marker'] as const,
    mapIds: {
      depot: '43b263c8b53f536b75a7140b',
      disposal: '43b263c8b53f536b75a7140b'
    }
  },
  enableDebugTools: true,
  logLevel: 'debug'
};
