import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
import { type Config } from "tailwindcss";
import reactAria from "tailwindcss-react-aria-components";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    reactAria(),
    iconsPlugin({
      collections: getIconCollections(["tabler"]),
    }),
  ],
} satisfies Config;
