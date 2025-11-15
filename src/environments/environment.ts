export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api/v1/',
  googleMaps: {
    apiKey: '',
    version: 'weekly',
    libraries: ['places', 'marker'] as const
  },
  enableDebugTools: false,
  logLevel: 'error'
};
