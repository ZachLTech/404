const WebSocket = require('ws');
const { Client } = require('ssh2');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New connection established');
    
    const ssh = new Client();
    let stream = null;
    let initialDimensionsReceived = false;
    let terminalDimensions = { cols: 80, rows: 24 };
    
    ws.on('message', (data) => {
        try {
            const message = data.toString();
            if (message.startsWith('{')) {
                const parsed = JSON.parse(message);
                if (parsed.type === 'resize') {
                    terminalDimensions.cols = parsed.cols;
                    terminalDimensions.rows = parsed.rows / 1.1;
                    if (!initialDimensionsReceived) {
                        initialDimensionsReceived = true;
                        initializeSSHConnection();
                    } else if (stream) {
                        stream.setWindow(parsed.rows, parsed.cols);
                    }
                    return;
                } else if (parsed.type === 'data' && stream) {
                    stream.write(parsed.data);
                    return;
                }
            }
            if (stream) {
                stream.write(data);
            }
        } catch (error) {
            console.error('Message handling error:', error);
        }
    });

    function initializeSSHConnection() {
        ssh.connect({
            host: 'zachl.tech',
            username: 'visitor',
            port: 24,
            tryKeyboard: true,
            password: ''
        });
    }

    ssh.on('ready', () => {
        console.log('SSH Connection established');
        
        ssh.shell({ 
            term: 'xterm-256color',
            cols: terminalDimensions.cols,
            rows: terminalDimensions.rows
        }, (err, sstream) => {
            if (err) {
                console.error('Shell error:', err);
                wss.close();
                return;
            }
            
            stream = sstream;
            
            stream.on('data', (data) => {
                try {
                    ws.send(data.toString('utf8'));
                } catch (error) {
                    console.error('WebSocket send error:', error);
                }
            });
            
            stream.on('close', () => {
                console.log('Stream closed');
                ssh.end();
                wss.close();
            });
        });
    });
    
    ssh.on('error', (err) => {
        console.error('SSH error:', err);
        wss.close();
    });
    
    ssh.connect({
        host: 'zachl.tech',
        username: 'visitor',
        port: 24,
        tryKeyboard: true,
        password: ''
    });
    
    wss.on('close', () => {
        console.log('WebSocket connection closed');
        if (stream) stream.close();
        ssh.end();
    });
});

server.on('upgrade', (request, socket, head) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
        socket.write('HTTP/1.1 204 No Content\r\n');
        Object.entries(headers).forEach(([key, value]) => {
            socket.write(`${key}: ${value}\r\n`);
        });
        socket.write('\r\n');
        socket.destroy();
        return;
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`WebSocket server listening on port ${PORT}`);
});