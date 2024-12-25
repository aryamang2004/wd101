class WhisperProtocol {
    constructor() {
        this.canvas = document.getElementById('frequencyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.frequencies = [];
        this.fragmentSize = 4;
        this.noiseLevel = 0.3;
        this.channelCount = 10;
        this.primaryColor = '#0FF4C6';
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
        this.drawChannelGrid();
    }

    drawChannelGrid() {
        const ctx = this.ctx;
        const channelHeight = this.canvas.height / this.channelCount;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = 'rgba(15, 244, 198, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= this.channelCount; i++) {
            const y = i * channelHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();

            if (i < this.channelCount) {
                ctx.fillStyle = '#0FF4C6';
                ctx.font = '12px Space Grotesk';
                ctx.fillText(`CH ${this.channelCount - i}`, 10, y + 20);
            }
        }
    }

    fragmentMessage(message) {
        const fragments = [];
        for (let i = 0; i < message.length; i += this.fragmentSize) {
            fragments.push(message.slice(i, i + this.fragmentSize));
        }
        return fragments;
    }

    frequencyHop(fragments) {
        return fragments.map(fragment => ({
            data: fragment,
            frequency: this.generateFrequencyPattern(fragment),
            channel: Math.floor(Math.random() * this.channelCount)
        }));
    }

    generateFrequencyPattern(fragment) {
        return Array.from(fragment).map(char => 
            (char.charCodeAt(0) * Math.random() + this.noiseLevel * Math.random())
        );
    }

    visualize(hoppedFragments) {
        const fragmentsContainer = document.getElementById('fragments-container');
        fragmentsContainer.innerHTML = '';
        this.drawChannelGrid();

        hoppedFragments.forEach((fragment, index) => {
            // Create and animate fragments
            const el = document.createElement('div');
            el.className = 'fragment glass-effect';
            el.textContent = fragment.data;
            el.style.left = `${(index / hoppedFragments.length) * 100}%`;
            el.style.top = `${fragment.channel * 10}%`;
            el.style.color = '#0FF4C6';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transition = 'all 0.5s ease';
            fragmentsContainer.appendChild(el);

            // Animate fragment
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(100px)';
            }, index * 500);

            // Draw wave pattern
            this.drawFrequencyWave(fragment, index);
        });
    }

    drawFrequencyWave(fragment, index) {
        const ctx = this.ctx;
        const channelHeight = this.canvas.height / this.channelCount;
        const baseY = (fragment.channel * channelHeight) + (channelHeight / 2);
        const startX = (index / 10) * this.canvas.width;
        const width = this.canvas.width / 10;

        ctx.beginPath();
        ctx.strokeStyle = '#0FF4C6';
        ctx.lineWidth = 2;

        for (let x = 0; x <= width; x++) {
            const waveHeight = 10 * Math.sin((x + startX) / 20);
            const xPos = startX + x;
            const yPos = baseY + waveHeight;

            if (x === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }

        ctx.shadowColor = '#0FF4C6';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Button click handler
function startWhisperProtocol() {
    const message = document.getElementById('message').value;
    if (!message) {
        alert('Please enter a message');
        return;
    }

    // Clear previous output
    document.getElementById('received-message').textContent = '';

    // Create new instance and process message
    const whisperProtocol = new WhisperProtocol();
    const fragments = whisperProtocol.fragmentMessage(message);
    const hoppedFragments = whisperProtocol.frequencyHop(fragments);
    
    // Visualize the encryption
    whisperProtocol.visualize(hoppedFragments);

    // Show the output after animation
    setTimeout(() => {
        const receivedMessage = document.getElementById('received-message');
        receivedMessage.textContent = message;
        receivedMessage.style.color = '#0FF4C6';
    }, fragments.length * 500 + 1000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('button');
    if (button) {
        button.addEventListener('click', startWhisperProtocol);
    }
});

window.addEventListener('resize', () => {
    const whisperProtocol = new WhisperProtocol();
    whisperProtocol.setupCanvas();
}); 
