class Chatbot {
  constructor(name, containerId, config) {
    this.container = document.getElementById(containerId);
    this.config = config;
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.name = name;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="flex flex-col gap-y-3 w-[35rem]">
        <div class="flex gap-x-1 items-center justify-center py-2 border-b border-b-gray-400">
          <span class="relative flex h-4 w-4 inline-flex mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
          <span>${this.name} is Online</span>
        </div>
        <div class="flex flex-col gap-y-4 p-4 overflow-y-auto h-[400px]" id="chat-container"></div>
      </div>
    `;
    this.renderChat("start");
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

    const fn = this.handleOptionClick;
    
    setTimeout(() => {
      chatContainer.removeChild(typingIndicator);
      
      const botMsg = document.createElement("div");
      botMsg.className = "bot-msg flex gap-x-2 items-end w-[80%] self-start";
      botMsg.innerHTML = `
        <img src="./img/agent.jpg" class="h-8 w-8 rounded-full flex-shrink-0" />
          <div class="flex flex-col gap-y-2">
            <span class="bg-[#E5E7EB] w-fit py-1 px-4 pl-2 rounded">${chatData.message}</span>
            <div class="flex flex-wrap gap-2 bg-[#E5E7EB] p-2 rounded w-fit opt-container">
              ${chatData.options.map((option, index) => `
                <button class="option-btn px-2 cursor-pointer py-1 rounded bg-blue-300 w-fit" data-index="${index}">
                  ${option.text}
                </button>`   
              ).join('')}
            </div>
        </div>
      `;

      botMsg.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          fn(chatData.options[index].next, step);
        });
      });

      chatContainer.appendChild(botMsg);
    }, 600);
  }

  handleOptionClick(nextStep, currStep) {
    // Remove options from bot message && container
    document.querySelectorAll(".option-btn").forEach(btn => btn.remove());
    document.querySelector(".opt-container").remove();

    const chatContainer = document.getElementById("chat-container");
    const selectedOption = this.config[currStep].options.find(opt => opt.next === nextStep)?.text || "You selected an option";

    const userMsg = document.createElement("div");
    userMsg.className = "user-msg flex gap-x-2 items-end justify-end w-[80%] self-end";
    userMsg.innerHTML = `
      <div class="flex flex-col gap-y-1 justify-end items-end">
        <span class="bg-[#E5E7EB] w-fit py-1 px-4 pl-2 rounded">${selectedOption}</span>
      </div>
      <img src="./img/user-icon.jpg" class="h-8 w-8 rounded-full flex-shrink-0" />
    `;
    chatContainer.appendChild(userMsg);
    setTimeout(() => this.renderChat(nextStep), 500);
  }
}