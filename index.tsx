
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
animation: electric-glow 2s <ease-any></ease-any>-out infinite alternate;
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

.subtitle {
  color: #0abcf9; /* Electric blue */
  text-shadow:
      -1px -1px 0 #ff4d4d,
       1px -1px 0 #ff4d4d,
      -1px  1px 0 #ff4d4d,
       1px  1px 0 #ff4d4d; /* Red outline */
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: -1.25rem;
  padding-bottom: 1rem; /* Add some space below */
}


.tabs {
display: flex;
flex-wrap: wrap;
justify-content: center;
gap: 1rem;
border-bottom: 1px solid #4a4a50;
padding-bottom: 1rem;
}

.tab-button {
padding: 0.75rem 1.5rem;
font-size: 1rem;
font-weight: 600;
color: #a0a0a0;
background-color: transparent;
border: 2px solid transparent;
border-radius: 8px;
cursor: pointer;
transition: all 0.2s ease;
position: relative;
}

.tab-button:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #0abcf9; /* Blue indicator */
  transition: width 0.3s ease;
  border-radius: 2px;
}

.tab-button.active {
color: #fff;
}

.tab-button.active:after {
  width: 80%;
}

.tab-button:hover:not(.active) {
color: #fff;
background-color: rgba(10, 188, 249, 0.1); /* Blue hover */
}

.tab-button:disabled {
  color: #555;
  cursor: not-allowed;
}

.tab-content {
display: none;
padding: 1.5rem;
background-color: #1a1a1a;
border: 1px solid #333;
border-radius: 8px;
animation: fadeIn 0.5s ease;
}

.tab-content.active {
display: block;
}

@keyframes fadeIn {
from { opacity: 0; transform: translateY(10px); }
to { opacity: 1; transform: translateY(0); }
}

.controls-container, .results-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt-group, .options-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #ccc;
}

textarea {
  width: calc(100% - 20px);
  padding: 10px;
  background-color: #252525;
  border: 1px solid #444;
  border-radius: 6px;
  color: #f0f0f0;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 40px;
}

textarea:focus {
  outline: none;
  border-color: #0cf;
  box-shadow: 0 0 0 2px rgba(0, 204, 255, 0.3);
}

.enhancement-toggle-button {
  padding: 0.5rem 1rem;
  background-color: #333;
  border: 1px solid #555;
  color: #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  margin-top: 0.5rem;
  align-self: flex-start; /* Don't stretch full width */
}

.enhancement-toggle-button.active {
  background-color: #0abcf9; /* Blue active state */
  color: #fff;
  border-color: #0abcf9;
  box-shadow: 0 0 5px rgba(10, 188, 249, 0.5);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.quality-selector-dropdown {
  width: 100%;
  padding: 10px;
  background-color: #252525;
  border: 1px solid #444;
  border-radius: 6px;
  color: #f0f0f0;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.quality-selector-dropdown:focus {
  outline: none;
  border-color: #0cf;
  box-shadow: 0 0 0 2px rgba(0, 204, 255, 0.3);
}


.quantity-selector, .aspect-ratio-selector, .duration-selector, .model-selection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quantity-button, .aspect-ratio-button, .duration-button {
  padding: 0.5rem 1rem;
  background-color: #333;
  border: 1px solid #555;
  color: #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-button.active, .aspect-ratio-button.active, .duration-button.active {
  background-color: #0abcf9; /* Blue active state */
  color: #fff;
  border-color: #0abcf9;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* --- UNIFIED BUTTON STYLES --- */
/* Base style for all primary function buttons */
.auth-button,
#generate-button,
.generate-button-style,
.action-button,
.subscription-tier .cta-button,
#chat-send-button {
  color: #ff4d4d; /* Red text for high contrast */
  background-color: transparent;
  border: 2px solid #0cf;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  text-transform: uppercase;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  text-shadow: none; /* Cleaner look */
}

/* Hover state for all */
.auth-button:hover:not(:disabled),
#generate-button:hover:not(:disabled),
.generate-button-style:hover:not(:disabled),
.action-button:hover:not(:disabled),
.subscription-tier .cta-button:hover:not(:disabled),
#chat-send-button:hover:not(:disabled) {
  background-color: rgba(0, 204, 255, 0.15);
  color: #fff;
  box-shadow: 0 0 8px rgba(0, 204, 255, 0.7);
}

/* Disabled state for all */
.auth-button:disabled,
#generate-button:disabled,
.generate-button-style:disabled,
.action-button:disabled,
.subscription-tier .cta-button:disabled,
#chat-send-button:disabled {
  background-color: transparent;
  color: #555;
  border-color: #555;
  cursor: not-allowed;
  box-shadow: none;
}

/* Fine-tuning for specific buttons */
#generate-button,
.generate-button-style,
.action-button {
  flex-grow: 1;
}

#generate-button,
.generate-button-style {
  font-size: 1.1rem;
}

.auth-button {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.subscription-tier .cta-button {
  width: 100%;
  box-sizing: border-box;
}

#chat-send-button {
  flex-shrink: 0; /* Prevents chat button from shrinking */
}

.results-content {
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #1a1a1a;
}
.results-content h2 {
  margin-top: 0;
  color: #0abcf9; /* Blue header */
}

.gallery-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  border: 1px solid #444;
}

.gallery-item .main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover .main-image {
  transform: scale(1.05);
}

.watermark {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  opacity: 0.7;
  pointer-events: none;
}

.remove-button, .share-button {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.remove-button {
  top: 5px;
  right: 5px;
}

.share-button {
  top: 5px;
  left: 5px;
}

.gallery-item:hover .remove-button,
.gallery-item:hover .share-button {
  opacity: 1;
}

.remove-button:hover, .share-button:hover {
  transform: scale(1.1);
  background-color: rgba(0, 0, 0, 0.9);
}

.remove-button:hover { background-color: #ff4d4d; }
.share-button:hover { background-color: #0cf; }


.loader {
  text-align: center;
  padding: 2rem;
}

.spinner {
border: 4px solid rgba(255, 255, 255, 0.3);
border-top: 4px solid #0abcf9; /* Blue spinner */
border-radius: 50%;
width: 40px;
height: 40px;
animation: spin 1s linear infinite;
margin: 0 auto 1rem;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

.hidden {
display: none !important;
}

.error-message, #library-empty-message, #inspiration-empty-message {
  background-color: rgba(0, 204, 255, 0.15); /* Blue error message */
  color: #bbeeff;
  border: 1px solid #0abcf9;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

/* Image/Video Upload Area */
.upload-area {
  border: 2px dashed #444;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #252525;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.upload-area:hover, .upload-area.dragover {
  border-color: #0cf;
  background-color: #333;
}
.file-input {
  display: none;
}
.upload-placeholder {
  color: #888;
  font-weight: 500;
}
.upload-area.has-preview .upload-placeholder {
  display: none;
}
.upload-preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.upload-preview-container img, 
.upload-preview-container video {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  object-fit: contain;
}
.preview-clear-button {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 2px solid #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}
.preview-clear-button:hover {
  background-color: #ff4d4d;
  border-color: #ff4d4d;
  transform: scale(1.1);
}

/* Model Selection */
.model-block {
  flex-grow: 1;
  padding: 1rem;
  background-color: #333;
  border: 1px solid #555;
  color: #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.model-block.active {
  background-color: rgba(10, 188, 249, 0.8); /* Blue active state */
  color: #fff;
  border-color: #0abcf9;
}
.model-block h3 {
  margin: 0 0 0.25rem 0;
}
.model-block p {
  margin: 0;
  font-size: 0.9rem;
}

/* Chat Tab Styles */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 60vh;
  max-height: 700px;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #1e1e1e;
}

#chat-history {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #555 #1a1a1a;
}

.chat-message {
  padding: 0.75rem 1.25rem;
  border-radius: 18px;
  max-width: 80%;
  line-height: 1.5;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-message img {
  max-width: 100%;
  border-radius: 12px;
  max-height: 250px;
  object-fit: contain;
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  background-color: #005f7a; /* Dark Cyan */
  color: #fff;
  border-bottom-right-radius: 4px;
}

.ai-message {
  align-self: flex-start;
  background-color: transparent; /* Wrapper is transparent */
  color: #f0f0f0;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  padding: 0; /* Remove padding from wrapper */
  max-width: 90%;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #444;
}

.message-content {
  background-color: #333;
  padding: 0.75rem 1.25rem;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

#chat-typing-indicator {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

#chat-typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0abcf9; /* Blue typing indicator */
  animation: typing-bounce 1.4s infinite ease-in-out both;
}
#chat-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
#chat-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
0%, 80%, 100% { transform: scale(0); }
40% { transform: scale(1.0); }
}


#chat-form {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #333;
  align-items: flex-end;
}

.chat-action-button {
  color: #a0a0a0;
  background-color: transparent;
  border: 2px solid #555;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.chat-action-button:hover:not(:disabled) {
  color: #0cf;
  border-color: #0cf;
}

.chat-action-button:disabled {
  color: #444;
  border-color: #444;
  cursor: not-allowed;
}

#chat-input {
  flex-grow: 1;
  resize: none;
  min-height: 44px; /* Default height */
  max-height: 150px; /* Max height before scroll */
  height: 44px;
}

.chat-upload-preview {
  padding: 0.5rem 1rem;
  border-top: 1px solid #333;
  position: relative;
  background-color: #252525;
}

.chat-upload-preview img {
  max-height: 80px;
  border-radius: 6px;
}

.chat-upload-preview .preview-clear-button {
  top: 10px;
  right: 18px;
}

/* Library Toast */
#library-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

/* Subscription Tiers */
.subscription-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.subscription-tier {
  padding: 1.5rem;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.subscription-tier:hover {
  transform: translateY(-5px);
  border-color: #555;
}

.subscription-tier.recommended {
  border-color: #0abcf9; /* Blue recommended border */
  box-shadow: 0 0 20px rgba(10, 188, 249, 0.3);
}

.subscription-tier h3 {
  font-size: 1.5rem;
  color: #f0f0f0;
  margin-top: 0;
}

.subscription-tier .price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #0cf;
  margin: 0.5rem 0;
}

.subscription-tier .price span {
  font-size: 1rem;
  font-weight: normal;
  color: #a0a0a0;
}

.subscription-tier ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  text-align: left;
  flex-grow: 1;
}

.subscription-tier ul li {
  margin-bottom: 0.75rem;
  color: #ccc;
}

.subscription-tier .badge {
  background-color: #0abcf9; /* Blue badge */
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.logo-tier {
  border-color: #0abcf9; /* Blue logo tier border */
  box-shadow: 0 0 20px rgba(10, 188, 249, 0.3);
  justify-content: space-between;
}

.logo-tier-spacer {
  flex-grow: 1;
}

.logo-tier__title {
  font-size: 2rem;
  font-weight: 900;
  color: #ff4d4d; /* Match title red */
  text-transform: uppercase;
  line-height: 1.1;
  text-shadow:
      0 0 4px #fff,
      0 0 10px #0abcf9,
      0 0 20px #0abcf9; /* Match title glow */
  margin: 0 0 1rem 0;
}

.logo-tier .cta-button {
  width: auto;
  padding: 0.75rem 2rem;
}

footer {
  padding: 1rem;
  margin-top: 1.5rem;
  text-align: center;
  color: #888;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-links a {
  color: #888;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #0cf;
}

.footer-disclaimer {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: #666;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.footer-copyright {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #888;
}

/* Character Creation */
#character-creation-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

.character-creator-title {
  text-align: center;
  color: #0abcf9; /* Blue title */
  margin-bottom: 0;
  font-family: serif;
  font-size: 2rem;
}

.character-creator-main {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.character-creator-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.character-creator-main .character-creator-section:first-child {
  flex: 2; /* Prompts take more space */
}
.character-creator-main .character-creator-section:last-child {
  flex: 1; /* Avatar takes less space */
  align-items: center;
}


#character-avatar-display {
  width: 150px;
  height: 150px;
  border: 2px dashed #444;
  border-radius: 8px;
  background-color: #252525;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

#character-avatar-display:has(#character-avatar-img:not(.hidden)) {
  border-color: #0cf;
  border-style: solid;
}

#character-avatar-display .loader {
  position: absolute;
  background-color: rgba(0,0,0,0.7);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0; /* Override default loader padding */
}
#character-avatar-display .loader .spinner {
  margin: 0;
}


.avatar-placeholder {
  font-size: 5rem;
  color: #444;
  font-family: serif;
  user-select: none;
}

#character-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#start-chat-button {
  margin-top: 1rem;
}

/* Chat Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #333;
  background-color: #2a2a2a; /* Slightly lighter */
}

#character-chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #0cf;
  flex-shrink: 1;
  min-width: 0;
}

#character-chat-header-info > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#character-chat-header-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #444;
}

#create-new-character-button {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  text-transform: none;
  flex-shrink: 0;
}

.chat-action-button.recording {
  background-color: #0abcf9; /* Blue recording state */
  color: white;
  border-color: #0abcf9;
  animation: pulse-blue-mic 1.5s infinite ease-in-out;
}

@keyframes pulse-blue-mic {
  0% {
      box-shadow: 0 0 0 0 rgba(10, 188, 249, 0.7);
  }
  70% {
      box-shadow: 0 0 0 10px rgba(10, 188, 249, 0);
  }
  100% {
      box-shadow: 0 0 0 0 rgba(10, 188, 249, 0);
  }
}

/* Inspiration Gallery */
#inspiration-gallery {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.inspiration-gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0;
  border: 1px solid #444;
  cursor: help;
}

.inspiration-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.inspiration-gallery-item:hover img {
  transform: scale(1.05);
}

.prompt-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
  color: #fff;
  padding: 2.5rem 1rem 1rem 1rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  line-height: 1.4;
  pointer-events: none;
}

.inspiration-gallery-item:hover .prompt-overlay {
  opacity: 1;
  transform: translateY(0);
}

.prompt-text {
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

.author-text {
  font-size: 0.8rem;
  margin: 0.5rem 0 0 0;
  font-style: italic;
  color: #ccc;
}

.report-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #aaa;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: auto; /* Ensure it's clickable */
}

.inspiration-gallery-item:hover .report-button {
  opacity: 1;
}

.report-button:hover {
  color: #fff;
  background-color: #ff4d4d;
  transform: scale(1.1);
}

/* Policy Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Above toast */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s;
  backdrop-filter: blur(5px);
}

.modal-overlay:not(.hidden) {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  background-color: #1e1e1e;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #0abcf9;
  box-shadow: 0 5px 25px rgba(10, 188, 249, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.modal-overlay:not(.hidden) .modal-container {
  transform: scale(1);
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.modal-title-text {
  color: #0abcf9;
  font-size: 1.5rem;
  margin: 0;
}

.modal-close-button {
  background: none;
  border: none;
  color: #888;
  font-size: 2.5rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.modal-close-button:hover {
  color: #fff;
  transform: rotate(90deg);
}

.modal-body {
  overflow-y: auto;
  /* Custom scrollbar for modal content */
  scrollbar-width: thin;
  scrollbar-color: #555 #1a1a1a;
}
.modal-body h1, .modal-body h2 {
  color: #0abcf9;
  margin-top: 1em;
}
.modal-body a {
  color: #ff4d4d;
}

.modal-body ul {
  padding-left: 20px;
}

.modal-body li {
  margin-bottom: 0.5rem;
}


/* For Webkit browsers */
.modal-body::-webkit-scrollbar {
width: 8px;
}

.modal-body::-webkit-scrollbar-track {
background: #1a1a1a;
border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
background-color: #555;
border-radius: 4px;
border: 2px solid #1a1a1a;
}

