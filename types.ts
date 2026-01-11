export interface PromptCard {
  glyph: string;
  title: string;
  prompt: string;
  imageUrl: string;
  caption: string;
  tags: string[];
}

export interface GeneratedData {
  mainTitle: string;
  archetype: string;
  tone: string;
  use: string;
  bannerImageUrl: string;
  cards: PromptCard[];
  negativePrompts: string[];
  remixSuggestions: string[];
}


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


/* Landing Page Styles */
#landing-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  transition: opacity 0.6s ease-out;
  background-image: 
      linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
      url('https://storage.googleapis.com/aai-web-samples/app-assets/demons-codex/demon.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.landing-content {
  text-align: center;
  background-color: rgba(0,0,0,0.3);
  padding: 2rem;
  border-radius: 15px;
  position: relative; /* Ensures content is above the background */
  z-index: 1;
}

.landing-title {
  font-family: serif;
  font-size: 7rem;
  font-weight: 900;
  color: #ff4d4d; /* Red text */
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
  text-shadow:
      0 0 4px #fff,
      0 0 10px #0abcf9,
      0 0 20px #0abcf9; /* Blue glow */
}

.landing-subtitle {
  font-family: serif;
  font-size: 2rem;
  color: #f0f0f0;
  margin: 1rem 0 2.5rem 0;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.landing-features {
  margin: 2.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.feature-item {
  font-size: 1.5rem;
  font-weight: 500;
  color: #0abcf9;
  text-shadow: 0 0 5px rgba(10, 188, 249, 0.7);
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.feature-item:nth-child(1) { animation-delay: 0.2s; }
.feature-item:nth-child(2) { animation-delay: 0.4s; }
.feature-item:nth-child(3) { animation-delay: 0.6s; }

.feature-item span {
  color: #fff;
  margin-right: 0.75rem;
}

@keyframes fadeInUp {
  from {
      opacity: 0;
      transform: translateY(20px);
  }
  to {
      opacity: 1;
      transform: translateY(0);
  }
}

#enter-app-button {
  font-size: 1.2rem;
  padding: 1rem 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  background-color: transparent;
  border: 2px solid #0abcf9;
  border-radius: 8px;
  text-shadow: 0 0 5px #fff, 0 0 10px #0abcf9;
  box-shadow: 0 0 5px #0abcf9, inset 0 0 5px #0abcf9, 0 0 15px #0abcf9;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse-blue 2s infinite ease-in-out;
}

#enter-app-button:hover {
  background-color: rgba(10, 188, 249, 0.2);
  box-shadow: 0 0 10px #0abcf9, inset 0 0 10px #0abcf9, 0 0 30px #0abcf9;
}

@keyframes pulse-blue {
  0% {
      box-shadow: 0 0 5px #0abcf9, inset 0 0 5px #0abcf9, 0 0 15px #0abcf9;
  }
  50% {
      box-shadow: 0 0 10px #0abcf9, inset 0 0 10px #0abcf9, 0 0 30px #0abcf9;
  }
  100% {
      box-shadow: 0 0 5px #0abcf9, inset 0 0 5px #0abcf9, 0 0 15px #0abcf9;
  }
}


body {
font-family: 'Segoe UI', 'Roboto', sans-serif;
margin: 0;
background: #121212;
color: #f0f0f0;
}

.container {
width: 100%;
max-width: 900px;
display: flex;
flex-direction: column;
gap: 1.5rem;
margin: 2rem auto;
padding: 2rem;
background-color: rgba(18, 18, 18, 0.85);
border: 1px solid #444;
border-radius: 12px;
box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
backdrop-filter: blur(8px);
}

/* Rolling Text Banner */
.rolling-text-container {
background-color: #1a1a1a;
border: 1px solid #333;
border-radius: 8px;
overflow: hidden;
white-space: nowrap;
}

.rolling-text-content {
display: inline-block;
animation: roll 30s linear infinite;
color: #ff4d4d; /* Red text, matching title */
font-size: 1.5rem; /* Increased size for visibility */
font-weight: 600; /* Bolder for effect */
padding: 1.5rem 0; /* Increased padding */
text-shadow:
  0 0 2px #fff,
  0 0 5px #0abcf9,
  0 0 10px #0abcf9; /* Blue glow, matching title */
}

.rolling-text-content span {
  display: inline-block;
}

@keyframes roll {
from {
  transform: translateX(0%);
}
to {
  transform: translateX(-50%); /* Animate to half to loop seamlessly */
}
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 1rem;
  height: 40px; /* Reserve space */
}

.auth-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

header {
text-align: center;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem 0;
z-index: 2; /* Ensure content is visible */
}

#auth-actions {
  display: flex;
  gap: 0.5rem;
}

#user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

#user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #0cf;
}

#user-name {
  font-weight: 600;
}


.title {
font-size: 6rem;
font-weight: 900;
color: #ff4d4d; /* Red text */
text-transform: uppercase;
letter-spacing: 2px;
animation: electric-glow 2s ease-in-out infinite alternate;
text-shadow:
  0 0 4px #fff,
  0 0 10px #0abcf9,
  0 0 20px #0abcf9; /* Blue glow */
margin: 0;
}

@keyframes electric-glow {
from {
  text-shadow:
    0 0 4px #fff,
    0 0 10px #0abcf9,
    0 0 20px #0abcf9;
}
to {
  text-shadow:
    0 0 6px #fff,
    0 0 15px #0cf,
    0 0 30px #0cf;
}
}
