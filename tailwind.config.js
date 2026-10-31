/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          purple: "#714b67",
          dark: "#52364b",
          hover: "#593952",
          light: "#f5edf3",
          teal: "#008784",
          tealDark: "#006d6a",
          tealLight: "#e6f4f4",
        },
      },
    },
  },
  plugins: [],
};
