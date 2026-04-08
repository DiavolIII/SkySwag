class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.sessionId = localStorage.getItem('ai_session_id') || this.generateSessionId();
        this.messages = [];
        this.init();
    }

    generateSessionId() {
        const id = 'ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ai_session_id', id);
        return id;
    }

    init() {
        this.createWidget();
        this.loadMessages();
    }

    createWidget() {
        // контейнер виджета
        const widget = document.createElement('div');
        widget.id = 'ai-assistant';
        widget.innerHTML = `
            <style>
                #ai-assistant {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: 'Space Grotesk', sans-serif;
                }
                .ai-button {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #d4af37, #e31b23);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: all 0.3s;
                    animation: pulse 2s infinite;
                }
                .ai-button:hover {
                    transform: scale(1.1);
                }
                .ai-button svg {
                    width: 30px;
                    height: 30px;
                    fill: white;
                }
                .ai-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 500px;
                    background: linear-gradient(135deg, #141414, #0a0a0a);
                    border: 2px solid #d4af37;
                    border-radius: 20px;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    animation: fadeInUp 0.3s ease;
                }
                .ai-window.open {
                    display: flex;
                }
                .ai-header {
                    background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
                    padding: 15px;
                    border-bottom: 1px solid #d4af37;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ai-header h3 {
                    color: #d4af37;
                    margin: 0;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .ai-header .close {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .ai-header .close:hover {
                    color: #e31b23;
                    transform: rotate(90deg);
                }
                .ai-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .ai-message {
                    max-width: 85%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    animation: fadeInUp 0.2s ease;
                }
                .ai-message.user {
                    background: linear-gradient(135deg, #d4af37, #e31b23);
                    color: #000;
                    align-self: flex-end;
                    border-bottom-right-radius: 4px;
                }
                .ai-message.assistant {
                    background: #1a1a1a;
                    color: #fff;
                    align-self: flex-start;
                    border-bottom-left-radius: 4px;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                }
                .ai-message.assistant strong {
                    color: #d4af37;
                }
                .ai-typing {
                    background: #1a1a1a;
                    color: #888;
                    align-self: flex-start;
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 0.9rem;
                    display: flex;
                    gap: 4px;
                }
                .ai-typing span {
                    width: 8px;
                    height: 8px;
                    background: #d4af37;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
                .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-10px); opacity: 1; }
                }
                .ai-input {
                    padding: 15px;
                    border-top: 1px solid #2a2a2a;
                    display: flex;
                    gap: 10px;
                }
                .ai-input input {
                    flex: 1;
                    padding: 10px 15px;
                    background: #1a1a1a;
                    border: 1px solid #d4af37;
                    border-radius: 25px;
                    color: #fff;
                    font-family: inherit;
                    outline: none;
                }
                .ai-input input:focus {
                    border-color: #e31b23;
                }
                .ai-input button {
                    background: linear-gradient(135deg, #d4af37, #e31b23);
                    border: none;
                    border-radius: 25px;
                    padding: 10px 20px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .ai-input button:hover {
                    transform: scale(1.05);
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
                }
            </style>
            <div class="ai-button" id="aiButton">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
            </div>
            <div class="ai-window" id="aiWindow">
                <div class="ai-header">
                    <h3>🚁 AI Помощник SkySwag</h3>
                    <button class="close" id="aiClose">×</button>
                </div>
                <div class="ai-messages" id="aiMessages"></div>
                <div class="ai-input">
                    <input type="text" id="aiInput" placeholder="Задайте вопрос о вертолетах..." autocomplete="off">
                    <button id="aiSend">📤</button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);

        // обработчики событий
        document.getElementById('aiButton').onclick = () => this.toggle();
        document.getElementById('aiClose').onclick = () => this.close();
        document.getElementById('aiSend').onclick = () => this.sendMessage();
        document.getElementById('aiInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('aiWindow');
        if (this.isOpen) {
            window.classList.add('open');
        } else {
            window.classList.remove('open');
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('aiWindow').classList.remove('open');
    }

    async loadMessages() {
        const saved = localStorage.getItem(`ai_messages_${this.sessionId}`);
        if (saved) {
            this.messages = JSON.parse(saved);
            this.renderMessages();
        } else {
            this.addWelcomeMessage();
        }
    }

    addWelcomeMessage() {
        const welcomeMsg = {
            role: 'assistant',
            content: 'Здравствуйте! Я AI-помощник SkySwag.\n\nЯ могу помочь вам с:\n🚁 Выбором вертолета\n💰 Лизингом и кредитованием\n📞 Контактами менеджеров\n\nЗадайте мне любой вопрос о наших вертолетах и услугах!'
        };
        this.messages.push(welcomeMsg);
        this.saveMessages();
        this.renderMessages();
    }

    saveMessages() {
        localStorage.setItem(`ai_messages_${this.sessionId}`, JSON.stringify(this.messages));
    }

    renderMessages() {
        const container = document.getElementById('aiMessages');
        container.innerHTML = this.messages.map(msg => `
            <div class="ai-message ${msg.role}">
                ${msg.content.replace(/\n/g, '<br>')}
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        if (!message) return;

        // крейт сообщения пользователя
        this.messages.push({ role: 'user', content: message });
        this.saveMessages();
        this.renderMessages();
        input.value = '';

        // индикатор печати
        this.showTypingIndicator();

        try {
            const token = localStorage.getItem('skywag_token') || localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });

            this.hideTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                this.messages.push({ role: 'assistant', content: data.answer });
                this.saveMessages();
                this.renderMessages();
            } else {
                this.messages.push({
                    role: 'assistant',
                    content: 'Извините, сервис временно недоступен. Пожалуйста, свяжитесь с нами по телефону +7 (000) 123-45-67'
                });
                this.saveMessages();
                this.renderMessages();
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.messages.push({
                role: 'assistant',
                content: 'Ошибка подключения. Пожалуйста, проверьте интернет-соединение.'
            });
            this.saveMessages();
            this.renderMessages();
        }
    }

    showTypingIndicator() {
        const container = document.getElementById('aiMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-typing';
        typingDiv.id = 'aiTyping';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const typing = document.getElementById('aiTyping');
        if (typing) typing.remove();
    }
}

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});