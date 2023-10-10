/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,md}"],
  theme: {
    
    extend: {
      colors:{
        'sopris' :{
          green: '#B4E89B',
          mutedgreen: "#799C68",
          darkgreen: "#060D02",
          creme: "#E4C590"
        }
      },
    },
  },
  plugins: [],
};
