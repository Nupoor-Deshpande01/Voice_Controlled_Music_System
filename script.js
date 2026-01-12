class SmartVolumeControl {
    constructor() {
        // Audio nodes
        this.audioContext = null;
        this.musicSource = null;
        this.musicGainNode = null;
        this.microphone = null;
        this.analyser = null;

        // State
        this.isListening = false;
        this.originalVolume = 1.0;
        this.currentVolume = 1.0;

        // Tunable parameters
        this.speechThreshold = 0.05;   // Adjust if needed
        this.maxReduction = 0.6;        // Up to 60% volume reduction

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.audioFile = document.getElementById("audioFile");
        this.musicPlayer = document.getElementById("musicPlayer");
        this.micBtn = document.getElementById("micBtn");
        this.micStatus = document.getElementById("micStatus");
        this.loudnessBar = document.getElementById("loudnessBar");
        this.loudnessValue = document.getElementById("loudnessValue");
    }

    setupEventListeners() {
        this.audioFile.addEventListener("change", (e) => this.loadAudioFile(e));
        this.micBtn.addEventListener("click", () => this.toggleMicrophone());
        this.musicPlayer.addEventListener("play", () => this.setupMusicAudio());
    }

    loadAudioFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        this.musicPlayer.src = url;
        this.musicPlayer.load();
    }

    setupMusicAudio() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.musicSource = this.audioContext.createMediaElementSource(this.musicPlayer);
        this.musicGainNode = this.audioContext.createGain();
        this.musicGainNode.gain.value = this.originalVolume;

        this.musicSource.connect(this.musicGainNode);
        this.musicGainNode.connect(this.audioContext.destination);
    }

    async toggleMicrophone() {
        if (!this.isListening) {
            await this.startListening();
        } else {
            this.stopListening();
        }
    }

    async startListening() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;

            this.microphone.connect(this.analyser);

            this.isListening = true;
            this.micBtn.textContent = "Disable Microphone";
            this.micBtn.classList.add("active");
            this.micStatus.textContent = "Microphone active – Speak to lower music";
            this.micStatus.style.background = "#d4edda";
            this.micStatus.style.color = "#155724";

            this.startAnalyzing();

        } catch (err) {
            console.error(err);
            this.micStatus.textContent = "Microphone access denied";
            this.micStatus.style.background = "#f8d7da";
            this.micStatus.style.color = "#721c24";
        }
    }

    stopListening() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        this.isListening = false;
        this.micBtn.textContent = "Enable Microphone";
        this.micBtn.classList.remove("active");
        this.micStatus.textContent = "Microphone disabled";
        this.micStatus.style.background = "#f8f9fa";
        this.micStatus.style.color = "#666";

        this.adjustMusicVolume(this.originalVolume);
        this.updateLoudnessDisplay(0);
    }

    startAnalyzing() {
        const bufferLength = this.analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const analyze = () => {
            if (!this.isListening) return;

            // ✅ CORRECT: time-domain data for loudness
            this.analyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const normalized = (dataArray[i] - 128) / 128;
                sum += normalized * normalized;
            }

            const rms = Math.sqrt(sum / bufferLength);

            this.updateLoudnessDisplay(rms);
            this.processVoiceDetection(rms);

            requestAnimationFrame(analyze);
        };

        analyze();
    }

    processVoiceDetection(rms) {
        if (rms > this.speechThreshold) {
            const intensity = Math.min(rms / 0.15, 1);
            const reduction = intensity * this.maxReduction;
            const targetVolume = this.originalVolume * (1 - reduction);

            this.adjustMusicVolume(targetVolume);
        } else {
            this.adjustMusicVolume(this.originalVolume);
        }
    }

    adjustMusicVolume(targetVolume) {
        if (!this.musicGainNode) return;

        const now = this.audioContext.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(this.currentVolume, now);
        this.musicGainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.15);

        this.currentVolume = targetVolume;
    }

    updateLoudnessDisplay(rms) {
        const percentage = Math.min(rms * 200, 100);
        this.loudnessBar.style.width = percentage + "%";
        this.loudnessValue.textContent = Math.round(percentage);
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    new SmartVolumeControl();
});
