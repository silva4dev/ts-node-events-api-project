export default {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  clearMocks: true,
  coverageProvider: 'v8',
  transform: {
    '^.+\\.ts?$': [
      '@swc/jest'
    ]
  }
}
