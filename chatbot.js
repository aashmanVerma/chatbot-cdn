const returnOptions = (option, index, size) => {
  let classes = "option-btn cursor-pointer rounded-lg bg-blue-500 text-white font-medium w-full text-center";

  switch(size) {
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
            ${chatData.message.map(msg => `<span class="bg-[#E5E7EB] w-fit py-1 px-4 pl-2 rounded">${msg}</span>`).join('')}
            <div class="flex flex-col gap-2 bg-[#E5E7EB] p-2 rounded w-fit opt-container">
              ${chatData.options.map((option, index) => returnOptions(option, index, this.optionSize)
      ).join('')}
            </div>
        </div>
      `;

      botMsg.querySelectorAll(".option-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          const doesOptionContainUrl = chatData.options[index].url;

          // If option contains URL, open it
          if (doesOptionContainUrl) {
            window.open(chatData.options[index].url, "_blank");
            return;
          } else {
            const currOption = chatData.options[index].text;
            fn(chatData.options[index].next, currOption);
          }
        });
      });

      chatContainer.appendChild(botMsg);
      botMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
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