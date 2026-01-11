# The Demon Codex: Interactive Carousel

## Overview

This document outlines the design and implementation of "The Demon Codex," an interactive carousel that allows users to generate and display dark fantasy-themed relics. The application is built using modern web technologies, including React, TypeScript, and Tailwind CSS, and it leverages the Swiper library for the carousel functionality.

## Project Structure

```
/src
|-- components
|   |-- App.tsx
|   |-- GeneratorForm.tsx
|   |-- Header.tsx
|   |-- RelicCard.tsx
|   |-- RelicCarousel.tsx
|   |-- Loader.tsx
|-- styles
|   |-- index.css
|-- types
|   |-- types.ts
|-- main.tsx
/public
|-- vite.svg
.env
index.html
```

## Design and Features

### Header

- The header displays the title of the application, "The Demon Codex," in a large, stylized font.
- A subtitle, "Dark Fantasy Thumbnail Vault," is displayed below the main title.

### Generator Form

- A text area allows users to enter a theme for the relics they want to generate.
- A list of example prompts provides users with inspiration for their themes.
- A "Generate Relics" button submits the user's theme to the API and triggers the generation of new relics.

### Relic Carousel

- The carousel displays the generated relics in a horizontally scrollable format.
- Each relic is displayed as a card with an image, title, and a list of tags.
- The carousel is responsive and adapts to different screen sizes.
- Navigation buttons and pagination dots allow users to easily navigate through the relics.

### Relic Card

- Each relic card displays an image of the relic, its title, and a list of tags.
- The card also includes buttons for copying the relic's prompt, remixing the relic, and saving the relic.
- The "Copy Prompt" button copies the relic's prompt to the clipboard and displays a success message.

### Styling

- The application uses a dark theme with a color palette inspired by dark fantasy.
- The UI is designed to be visually appealing and easy to use.
- The application is responsive and works well on both desktop and mobile devices.

### Loading State

- A custom loader is displayed while new relics are being generated.

### Initial Experience

- The application is pre-loaded with a set of initial relics to immediately engage the user.

### API Key

- The API key is stored in a `.env` file for better security and configuration management.

## Current Plan

- Create the initial project structure.
- Implement the Header component.
- Implement the GeneratorForm component.
- Implement the RelicCarousel component.
- Implement the RelicCard component.
- Implement the main App component.
- Style the application using Tailwind CSS.
- Add the Swiper library for the carousel functionality.
- Define the Relic type for type safety.
- Create the main.tsx and index.html files.
- Create a Loader component to improve the loading state.
- Pre-load the application with initial relics to improve the initial experience.
- Secure the API key in a `.env` file.
- Implement the "Copy Prompt" functionality.
- Improve the error handling in the GeneratorForm component.
