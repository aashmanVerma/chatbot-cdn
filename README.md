# Adgenix Media Chatbot

This is a lightweight chatbot developed for **Adgenix Media**, designed to be embedded into any website using a CDN.

## Features
- Simple integration via a script tag
- Supports predefined responses and interactive chat
- Customizable styling via an external CSS file

## Usage

### 1. Include the Chatbot in Your Website
Add the following lines inside your HTML `<head>`:

```html
<script src="https://unpkg.com/@tailwindcss/browser@4"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-username/chatbot-cdn/chatbot.css">
<script src="https://cdn.jsdelivr.net/gh/your-username/chatbot-cdn/chatbot.js"></script>
```

### 2. Add the Chatbot Container
Place this inside your `<body>` where you want the chatbot to appear:

```html
<div id="chat-wrapper"></div>
<script>
    const chatbotConfig = {
      start: {
        message: "Hello! How can I assist you today?",
        options: [
          { text: "Tell me a joke", next: "joke" },
          { text: "Give me a quote", next: "quote" },
        ],
      },
      joke: {
        message: "Why don’t skeletons fight each other? Because they don’t have the guts!",
        options: [{ text: "Back to start", next: "start" }],
      },
      quote: {
        message: "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
        options: [{ text: "Back to start", next: "start" }],
      },
    };

    // Initialize the chatbot
    new Chatbot("Angela", "chat-wrapper", chatbotConfig);
</script>
```

## Customization
You can edit `chatbot.css` to modify the chatbot’s appearance.

## CDN Links
- **JavaScript:** [chatbot.js](https://cdn.jsdelivr.net/gh/aashmanVerma/chatbot-cdn/chatbot.js)
- **CSS:** [chatbot.css](https://cdn.jsdelivr.net/gh/aashmanVerma/chatbot-cdn/chatbot.css)

## License
This chatbot is owned by **Adgenix Media**. Redistribution without permission is prohibited.
