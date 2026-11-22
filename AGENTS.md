# Project guidelines

## Component theme

Use the approved palette for all future components built in this project:

| Role | Color | Hex | Usage |
| --- | --- | --- | --- |
| Primary | Black | `#000000` | Main surfaces and navigation |
| Secondary | White | `#FFFFFF` | Text and contrasting surfaces |
| Tertiary | Gold | `#BA992D` | Accents, highlights, and selected states |

Use gold sparingly as an accent. Maintain readable contrast for text and interactive states when applying the palette.

## Typography and UI components

- Use Manrope for application typography, including navigation, headings, body text, and form controls.
- Keep Orbitron at weight 700 for the Maplestreet wordmark.
- Use Manrope at weight 700 for navigation buttons.
- Style components with Tailwind CSS utilities instead of CSS modules or custom component stylesheets. Define shared colors, fonts, radii, and shadows in the Tailwind `@theme` block in `src/app/globals.css`.
- Use shadcn/ui for design work and new UI components, including navigation menus. Keep shared shadcn/ui components in `src/components/ui` and style them with the approved palette.
