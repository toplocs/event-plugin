/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/@toplocs/plugin-sdk/dist/**/*.{js,css}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
