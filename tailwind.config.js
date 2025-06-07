/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Puedes agregar colores personalizados aquí
      },
      fontFamily: {
        // Puedes agregar fuentes personalizadas aquí
      },
    },
  },
  plugins: [
    forms,
  ],
}
