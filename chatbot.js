const returnOptions = (option, index, size) => {
    let classes = "option-btn cursor-pointer rounded-lg bg-blue-500 text-white font-medium w-full text-center";

    switch (size) {
        case 'sm':
            classes += " px-3 py-1 text-sm";
            break;
        case 'md':
            classes += " px-4 py-2 text-base";
            break;
        case 'lg':
            classes += " px-5 py-3 text-lg";
            break;
        default:
            classes += " px-4 py-2 text-base";
    }

    return `
      <button class="${classes}" data-index="${index}">
        ${option.text}
      </button>
    `;
};


class Chatbot {
    constructor(name, containerId, config, heightClass, optionSize = 'sm') {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.handleOptionClick = this.handleOptionClick.bind(this);
        this.name = name;
        this.heightClass = heightClass;
        this.optionSize = optionSize;
        this.loadedScripts = new Set(); // Track loaded scripts
        this.init();
    }

    init() {
        this.container.innerHTML = `
        <div class="flex flex-col gap-y-3 min-w-[20rem] max-w-[35rem]">
          <div class="flex gap-x-1 items-center justify-center py-2 border-b border-b-gray-400">
            <span class="relative flex h-4 w-4 inline-flex mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
            <span>${this.name} is Online</span>
          </div>
          <div class="flex flex-col gap-y-4 p-4 overflow-y-auto ${this.heightClass}" id="chat-container"></div>
        </div>
      `;
        this.renderChat("start");
    }

    // Safely load external scripts
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (this.loadedScripts.has(src)) {
                resolve();
                return;
            }

            const fullSrc = src.startsWith('http') ? src : `https:${src}`;

            // First try to load with createElement approach
            try {
                const script = document.createElement('script');
                script.src = fullSrc;
                script.async = true;
                script.onload = () => {
                    this.loadedScripts.add(src);
                    resolve();
                };
                script.onerror = (error) => {
                    console.warn(`Failed to load script with createElement: ${fullSrc}`, error);
                    // Fall back to fetch and eval approach
                    this.loadScriptWithFetch(fullSrc).then(resolve).catch(reject);
                };
                document.head.appendChild(script);
            } catch (error) {
                console.warn(`Error adding script to head: ${fullSrc}`, error);
                // Fall back to fetch and eval approach
                this.loadScriptWithFetch(fullSrc).then(resolve).catch(reject);
            }
        });
    }

    // Alternative script loading method using fetch and eval
    loadScriptWithFetch(src) {
        return fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch script: ${src}`);
                }
                return response.text();
            })
            .then(scriptContent => {
                // Execute the script content
                const scriptFunc = new Function(scriptContent);
                scriptFunc();
                this.loadedScripts.add(src);
            });
    }

    renderChat(step) {
        const chatContainer = document.getElementById("chat-container");
        const chatData = this.config[step];

        const typingIndicator = document.createElement("div");
        typingIndicator.className = "bot-msg flex gap-x-2 items-end w-[80%] self-start";
        typingIndicator.innerHTML = `
        <img src="./img/agent.jpg" class="h-8 w-8 rounded-full flex-shrink-0" />
        <div class="flex flex-col gap-y-2">
          <div class="loader"></div>
        </div>
      `;
        chatContainer.appendChild(typingIndicator);

        // Preload any scripts needed for options
        const scriptsToLoad = [];
        chatData.options.forEach(option => {
            if (option.load) {
                scriptsToLoad.push(this.loadScript(option.load));
            }
        });

        // Start preloading scripts immediately
        const scriptsPromise = Promise.all(scriptsToLoad).catch(error => {
            console.error("Error preloading scripts:", error);
        });

        setTimeout(() => {
            chatContainer.removeChild(typingIndicator);

            const botMsg = document.createElement("div");
            botMsg.className = "bot-msg flex gap-x-2 items-end w-[80%] self-start";
            botMsg.innerHTML = `
          <img src="./img/agent.jpg" class="h-8 w-8 rounded-full flex-shrink-0" />
            <div class="flex flex-col gap-y-2">
              ${chatData.message.map(msg => `<span class="bg-[#E5E7EB] w-fit py-1 px-4 pl-2 rounded">${msg}</span>`).join('')}
              <div class="flex flex-col gap-2 bg-[#E5E7EB] p-2 rounded w-fit opt-container">
                ${chatData.options.map((option, index) => returnOptions(option, index, this.optionSize)
            ).join('')}
              </div>
          </div>
        `;

            chatContainer.appendChild(botMsg);
            botMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Attach click handlers immediately, don't wait for scripts to load
            this.attachOptionHandlers(botMsg, chatData);
            
        }, 600);
    }

    attachOptionHandlers(botMsg, chatData) {
        botMsg.querySelectorAll(".option-btn").forEach((button, idx) => {
            const option = chatData.options[idx];
            let triggers = null;

            if (option.execute && option.execute?.length) {
                triggers = option.execute
            }

            button.addEventListener("click", async (e) => {
                const index = button.getAttribute("data-index");
                const selectedOption = option;

                if (triggers) {
                    triggers.forEach(fn => {
                        if (typeof fn === 'function') {
                            fn();
                        }
                    });
                }

                // If option contains URL, open it and return
                if (selectedOption.url) {
                    window.open(selectedOption.url, "_blank");
                    return;
                }
                
                // Show loading state for the button if script needs to be loaded
                if (selectedOption.load) {
                    const originalText = button.textContent.trim();
                    button.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Loading...`;
                    button.disabled = true;
                    
                    try {
                        // Load script if needed
                        await this.loadScript(selectedOption.load);
                        
                        // Success state - briefly show success before proceeding
                        button.innerHTML = `<span class="inline-block mr-1">✓</span> ${originalText}`;
                        button.classList.remove("bg-blue-500");
                        button.classList.add("bg-green-500");
                        
                        // Short delay to show the success state
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.error("Failed to load script:", error);
                        // Show error state briefly
                        button.innerHTML = `<span class="inline-block mr-1">⚠️</span> Error loading`;
                        button.classList.remove("bg-blue-500");
                        button.classList.add("bg-red-500");
                        
                        // Short delay to show the error state
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                // Proceed with the selection
                const currOption = selectedOption.text;
                this.handleOptionClick(selectedOption.next, currOption);
            });
        });
    }

    handleOptionClick(nextStep, selectedOption) {
        // Remove options from bot message && container
        document.querySelectorAll(".option-btn").forEach(btn => btn.remove());
        document.querySelector(".opt-container").remove();

        const chatContainer = document.getElementById("chat-container");

        // Close chat if no next step
        if (!nextStep) {
            const chatClosed = document.createElement("div");
            chatClosed.className = "flex gap-x-2 items-center w-[80%] self-start text-sm text-gray-500 mx-auto";
            chatClosed.innerHTML = `
          <hr class="bg-gray-100 w-1/3" />
          <span class="whitespace-nowrap">Chat Closed</span>
          <hr class="bg-gray-100 w-[30%] w-1/3" />
        `;

            chatContainer.appendChild(chatClosed);
            return;
        }

        const userMsg = document.createElement("div");
        userMsg.className = "user-msg flex gap-x-2 items-end justify-end w-[80%] self-end";
        userMsg.innerHTML = `
        <div class="flex items-center justify-center bg-blue-500 text-white font-medium w-fit py-1 px-4 rounded">
          ${selectedOption}
        </div>
        <img src="./img/user-icon.jpg" class="h-8 w-8 rounded-full flex-shrink-0" />
      `;
        chatContainer.appendChild(userMsg);
        setTimeout(() => this.renderChat(nextStep), 500);
    }
}