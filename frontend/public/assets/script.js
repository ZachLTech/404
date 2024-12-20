let term;
let socket;
let termFontSize;
let isConnected = false;
const PROXY_URL = 'wss://exit-api.zachl.tech';

function initTerminal() {
    if (getWidth() > 630) {
        termFontSize = 24
    } else {
        termFontSize = 10
    }

    term = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#ffffff'
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: termFontSize,
        letterSpacing: 0,
        lineHeight: 1,
        scrollback: 1500
    });
    
    const container = document.getElementById('terminal');
    container.style.display = "block";
    container.style.position = "absolute";
    container.style.zIndex = "100";
    term.open(container);

    term.write('\r\x1B[1;32mTerminal Initialized Successfully!\x1B[0m\r\n');
    term.write('\r\n\x1B[94m[samsepiol@mrrobots4e11 ~]$ \x1B[0mssh -p 24 exit.zachl.tech\n');

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    
    setTimeout(() => {
        fitAddon.fit();
        term.focus();
    }, 0);

    term.onKey(({ key, domEvent }) => {
        if (domEvent.ctrlKey && domEvent.key === 'c') {
            if (isConnected) {
                disconnect();
            }
        }
    });

    window.addEventListener('resize', () => {
        fitAddon.fit();
        if (socket && isConnected) {
            socket.send(JSON.stringify({
                type: 'resize',
                cols: term.cols,
                rows: term.rows
            }));
        }
    });
}

function connect() {
    if (isConnected) return;    
    try {
        socket = new WebSocket(PROXY_URL);
        
        socket.onopen = () => {
            isConnected = true;
            term.write('\r\n\x1B[1;32mGood Afternoon Elliot.\x1B[0m\r\n\n');
            term.write('\x1B[1;31mMORE COMING SOON\n\n\x1B[0m\r\n');
            term.write('\x1B[1;31mIf you\'re now stuck here, refresh the page.\n\n\x1B[0m\r\n\n')

            const dimensions = {
                cols: term.cols,
                rows: term.rows
            };

            socket.send(JSON.stringify({
                type: 'resize',
                cols: dimensions.cols,
                rows: dimensions.rows
            }));
            
            term.onData(data => {
                if (isConnected) {
                    if (data.includes("exit") || data.includes("\u0003")) {
                        disconnect();
                        return;
                    }
                    socket.send(JSON.stringify({
                        type: 'data',
                        data: data
                    }));
                }
            });
        };
        
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'status') {
                    switch(message.status) {
                        case 'disconnected':
                        case 'error':
                            isConnected = false;
                            disconnect();
                            return;
                    }
                }
                if (typeof event.data === 'string' && 
                    (event.data.includes("Connection closed") || 
                     event.data.includes("Session ended"))) {
                    disconnect();
                    return;
                }
                term.write(event.data);
            } catch (e) {
                term.write(event.data);
            }
        };
        
        socket.onclose = () => {
            disconnect();
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            disconnect();
        };
        
    } catch (error) {
        console.error('Connection error:', error);
        disconnect();
    }
}

function disconnect() {
    if (!isConnected) return;
    
    if (socket) {
        socket.close();
    }
    
    isConnected = false;
    term.clear();
    term.write('\r\n\x1B[1;31mDisconnected from exit.zachl.tech\x1B[0m\r\n\n');
    term.dispose()
    const container = document.getElementById('terminal');
    container.style.display = "none";
    container.style.position = "absolute";
    container.style.zIndex = "-100";
}

function type(element, text, speed = 50, delay = 0) {
    setTimeout(() => {
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }, delay);
}

function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

async function handleEasterEgg() {
    await initTerminal();
    connect();
}

window.addEventListener('load', () => {
    let typingElement = document.getElementById("prompt")
    let typingElement2 = document.getElementById("prompt2")
    type(typingElement, 'It\'s quiet in here', 60)
    type(typingElement, '...ㅤ', 400, 60*20)
    type(typingElement2, 'Go Home?', 80, 400*4+60*20)
});