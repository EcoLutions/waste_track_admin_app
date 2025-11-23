export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api/v1/',
  googleMaps: {
    apiKey: '',
    version: 'weekly',
    libraries: ['places', 'marker'] as const,
    mapIds: {
      depot: '',
      disposal: ''
    }
  },
  enableDebugTools: false,
  logLevel: 'error'
};
