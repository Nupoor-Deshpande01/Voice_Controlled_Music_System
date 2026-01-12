🎧 Smart Volume Control System (Web-Based)

A web-based intelligent music player that automatically adjusts music volume in real time based on human speech detected through the microphone. The system reduces music volume when someone speaks and smoothly restores it when the environment becomes quiet, simulating modern in-car infotainment and smart audio systems.

🚀 Key Features

Real-time microphone input analysis using the Web Audio API

Automatic music volume reduction during speech

Adaptive volume control based on voice intensity (soft vs loud speech)

Smooth fade-in and fade-out transitions for better user experience

Built-in web music player with local audio file support

Live voice loudness visualization

🧠 How It Works

Captures microphone input using getUserMedia()

Computes RMS (Root Mean Square) amplitude from time-domain audio data to estimate speech loudness

Uses adaptive gain control to dynamically adjust music volume via a GainNode

Restores original volume when speech is no longer detected

🛠️ Tech Stack

HTML, CSS, JavaScript

Web Audio API

Real-time audio signal processing

🎯 Use Cases

Simulates intelligent in-car audio systems

Hands-free music control during conversations

Context-aware audio adaptation for smart environments

⚠️ Notes

This is a browser-based prototype and controls audio played within the web application. System-wide volume control is restricted by browser security policies.

📌 Future Enhancements

Improved speech detection using frequency band filtering

Adaptive learning of user speaking patterns

Multi-speaker intensity estimation

ML-based voice activity detection
