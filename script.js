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

    const winSound = new Audio('https://actions.google.com/sounds/v1/magic/magic_chime_sweep.ogg');

    // TADY JE ZMĚNA: Pokud je paměť prázdná, vytvoří se úplně čisté kolo (prázdné pole [])
    let names = JSON.parse(localStorage.getItem('koloJmena')) || [];
    let removedNames = JSON.parse(localStorage.getItem('koloOdstranene')) || [];
    
    let isMuted = localStorage.getItem('koloMuted') === 'true';

    let currentRotation = 0;
    let isSpinning = false;
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

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
    });

    canvas.addEventListener('transitionend', () => {
        isSpinning = false;
        
        const actualDeg = currentRotation % 360;
        const sliceDeg = 360 / names.length;
        const winningIndex = Math.floor((360 - actualDeg) / sliceDeg) % names.length;
        const winner = names[winningIndex];

        if (!isMuted) {
            winSound.currentTime = 0;
            winSound.play();
        }

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