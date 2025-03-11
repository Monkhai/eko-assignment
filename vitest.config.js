import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
  },
})
