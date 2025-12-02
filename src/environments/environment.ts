export const environment = {
  production: true,
  apiUrl: 'https://waste-track-platform-production.up.railway.app/api/v1/',
  websocketUrl: 'wss://waste-track-platform-production.up.railway.app/ws',
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
