export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1/',
  googleMaps: {
    apiKey: '',
    version: 'weekly',
    libraries: ['places', 'marker'] as const
  },
  enableDebugTools: true,
  logLevel: 'debug'
};
