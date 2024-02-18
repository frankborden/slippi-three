import { type Config } from "tailwindcss";
import reactAria from "tailwindcss-react-aria-components";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [reactAria()],
} satisfies Config;
