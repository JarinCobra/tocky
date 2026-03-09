document.addEventListener('DOMContentLoaded', () => {
    
    const nameInput = document.getElementById('nameInput');
    const addBtn = document.getElementById('addBtn');
    const activeList = document.getElementById('activeList');
    const removedList = document.getElementById('removedList');
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    
    const winModal = document.getElementById('winModal');
    const winnerNameDisplay = document.getElementById('winnerName');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const muteBtn = document.getElementById('muteBtn');
    const clearRemovedBtn = document.getElementById('clearRemovedBtn'); // Nové tlačidlo

    let names = JSON.parse(localStorage.getItem('koloJmena')) || [];
    let removedNames = JSON.parse(localStorage.getItem('koloOdstranene')) || [];
    let isMuted = localStorage.getItem('koloMuted') === 'true';

    let currentRotation = 0;
    let isSpinning = false;
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

    function hratZvukVyhry() {
        if (isMuted) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            gain1.gain.setValueAtTime(0, audioCtx.currentTime);
            gain1.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05); 
            gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); 
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(audioCtx.currentTime);
            osc1.stop(audioCtx.currentTime + 0.5);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15); 
            gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
            gain2.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(audioCtx.currentTime + 0.15);
            osc2.stop(audioCtx.currentTime + 0.8);
        } catch (error) { console.log(error); }
    }

    function hratZvukPrdu() {
        if (isMuted) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth'; 
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
        } catch (e) { console.log(e); }
    }

    function saveData() {
        localStorage.setItem('koloJmena', JSON.stringify(names));
        localStorage.setItem('koloOdstranene', JSON.stringify(removedNames));
    }

    function updateMuteButton() {
        muteBtn.textContent = isMuted ? '🔇 Zvuk VYP' : '🔊 Zvuk ZAP';
    }

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('koloMuted', isMuted);
        updateMuteButton();
    });

    // --- NOVÁ FUNKCIA: Vymazanie histórie výhercov ---
    clearRemovedBtn.addEventListener('click', () => {
        // Kontrola, či vôbec je čo vymazať
        if (removedNames.length > 0) {
            // Bezpečnostná otázka pre užívateľa
            if (confirm('Opravdu chcete vymazat celou historii výherců?')) {
                removedNames = []; // Vyprázdnenie poľa
                saveData(); // Uloženie zmeny do pamäte
                updateLists(); // Prekreslenie zoznamu (zmiznú z obrazovky)
            }
        } else {
            alert('Seznam výherců je už prázdný.');
        }
    });

    updateMuteButton(); 

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (names.length === 0) {
            ctx.beginPath(); ctx.arc(200, 200, 200, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; ctx.fill(); 
            ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.stroke();
            return;
        }

        const sliceAngle = (2 * Math.PI) / names.length;

        for (let i = 0; i < names.length; i++) {
            ctx.beginPath();
            ctx.moveTo(200, 200);
            ctx.arc(200, 200, 200, i * sliceAngle, (i + 1) * sliceAngle);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "#0f172a";
            ctx.stroke();

            ctx.save();
            ctx.translate(200, 200);
            ctx.rotate(i * sliceAngle + sliceAngle / 2);
            ctx.fillStyle = "#ffffff"; 
            ctx.font = "600 20px 'Montserrat', sans-serif";
            ctx.textAlign = "right";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.fillText(names[i], 175, 7);
            ctx.restore();
        }

        ctx.beginPath(); ctx.arc(200, 200, 30, 0, 2 * Math.PI);
        ctx.fillStyle = "#1e293b"; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(200, 200, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#8b5cf6"; ctx.fill();
    }

    function updateLists() {
        activeList.innerHTML = '';
        names.forEach((name, index) => {
            const li = document.createElement('li');
            li.textContent = name;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Odstranit';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => {
                names.splice(index, 1);
                saveData(); 
                updateLists();
                drawWheel();
            };
            li.appendChild(deleteBtn);
            activeList.appendChild(li);
        });

        removedList.innerHTML = '';
        removedNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            li.style.color = "#64748b";
            li.style.background = "transparent";
            li.style.border = "1px dashed rgba(255,255,255,0.1)";
            removedList.appendChild(li);
        });
    }

    function pridatPolicko() {
        const inputText = nameInput.value.trim();
        if (inputText && !isSpinning) {
            const novePolozky = inputText.split(',').map(item => item.trim()).filter(item => item !== "");
            names.push(...novePolozky);
            
            nameInput.value = '';
            saveData(); 
            updateLists();
            drawWheel();
        }
    }

    addBtn.addEventListener('click', pridatPolicko);
    nameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') pridatPolicko();
    });

    spinBtn.addEventListener('click', () => {
        if (names.length === 0 || isSpinning) return;
        isSpinning = true;

        const randomSpins = Math.floor(Math.random() * 5 + 5) * 360; 
        const extraDegrees = Math.floor(Math.random() * 360);
        currentRotation += randomSpins + extraDegrees;

        canvas.style.transform = `rotate(${currentRotation}deg)`;

        let lastSliceIndex = -1;
        function checkSlice() {
            if (!isSpinning) return;

            const style = window.getComputedStyle(canvas);
            const matrix = style.getPropertyValue('transform');

            if (matrix !== 'none') {
                const values = matrix.split('(')[1].split(')')[0].split(',');
                const a = parseFloat(values[0]);
                const b = parseFloat(values[1]);
                let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
                if (angle < 0) angle += 360;

                const sliceDeg = 360 / names.length;
                const currentSliceIndex = Math.floor(((360 - angle) % 360) / sliceDeg) % names.length;

                if (lastSliceIndex !== -1 && currentSliceIndex !== lastSliceIndex) {
                    hratZvukPrdu(); 
                }
                lastSliceIndex = currentSliceIndex;
            }

            requestAnimationFrame(checkSlice);
        }
        
        requestAnimationFrame(checkSlice);
    });

    canvas.addEventListener('transitionend', () => {
        isSpinning = false;
        
        const actualDeg = currentRotation % 360;
        const sliceDeg = 360 / names.length;
        const winningIndex = Math.floor((360 - actualDeg) / sliceDeg) % names.length;
        const winner = names[winningIndex];

        hratZvukVyhry();

        winnerNameDisplay.textContent = winner;
        winModal.classList.add('show');

        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
        });

        names.splice(winningIndex, 1);
        removedNames.push(winner);
        
        saveData(); 
        
        currentRotation = actualDeg;
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${currentRotation}deg)`;
        canvas.offsetHeight; 
        canvas.style.transition = 'transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)';

        updateLists();
        drawWheel();
    });

    closeModalBtn.addEventListener('click', () => {
        winModal.classList.remove('show');
    });

    setTimeout(() => drawWheel(), 150);
    updateLists();
});