
// Game state
let currentPosition = 0;
let isRolling = false;

// Audio context for sound effects
let audioContext;

// Initialize audio context
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Sound effect functions
function playDiceRollSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playMoveSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playLadderSound() {
    if (!audioContext) return;
    
    // Ascending melody for ladder/milestone
    const frequencies = [440, 523, 659, 784];
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.2);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.2);
    });
}

function playChallengeSound() {
    if (!audioContext) return;
    
    // Descending melody for challenge/snake
    const frequencies = [784, 659, 523, 440];
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.08);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime + index * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.08 + 0.15);
        
        oscillator.start(audioContext.currentTime + index * 0.08);
        oscillator.stop(audioContext.currentTime + index * 0.08 + 0.15);
    });
}

function playWinSound() {
    if (!audioContext) return;
    
    // Victory fanfare
    const melody = [523, 659, 784, 1047, 784, 1047, 1318];
    melody.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
        
        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
    });
}

// IAS Journey Phases
const phases = {
    'Study Phase': { range: [1, 25], color: '#2196F3', emoji: '📚' },
    'Prelims Phase': { range: [26, 50], color: '#9C27B0', emoji: '📝' },
    'Mains Phase': { range: [51, 75], color: '#FF9800', emoji: '✍️' },
    'Interview Phase': { range: [76, 95], color: '#4CAF50', emoji: '🗣️' },
    'Final Phase': { range: [96, 100], color: '#FFC107', emoji: '🏆' }
};

// Game board configuration (ladders and challenges) - Phase specific
const specialCells = {
    // Study Phase (1-25)
    4: { type: 'ladder', destination: 14, message: 'Daily routine established! 📅', phase: 'Study Phase' },
    9: { type: 'ladder', destination: 21, message: 'NCERT books completed! 📖', phase: 'Study Phase' },
    16: { type: 'challenge', destination: 6, message: 'Social media distraction! 📱', phase: 'Study Phase' },
    19: { type: 'challenge', destination: 7, message: 'Lost focus on studies! 😴', phase: 'Study Phase' },
    23: { type: 'ladder', destination: 25, message: 'Foundation concepts clear! 💡', phase: 'Study Phase' },

    // Prelims Phase (26-50)
    28: { type: 'ladder', destination: 44, message: 'Current Affairs updated! 📰', phase: 'Prelims Phase' },
    32: { type: 'challenge', destination: 18, message: 'Mock test score dropped! 📉', phase: 'Prelims Phase' },
    39: { type: 'ladder', destination: 49, message: 'Previous year papers solved! 📋', phase: 'Prelims Phase' },
    42: { type: 'challenge', destination: 35, message: 'Revision stress! 😰', phase: 'Prelims Phase' },
    47: { type: 'ladder', destination: 50, message: 'Prelims strategy perfected! 🎯', phase: 'Prelims Phase' },

    // Mains Phase (51-75)
    54: { type: 'ladder', destination: 68, message: 'Essay writing improved! ✒️', phase: 'Mains Phase' },
    59: { type: 'challenge', destination: 41, message: 'Answer writing block! 🚫', phase: 'Mains Phase' },
    63: { type: 'ladder', destination: 74, message: 'Optional subject mastered! 📚', phase: 'Mains Phase' },
    67: { type: 'challenge', destination: 52, message: 'Time management issues! ⏰', phase: 'Mains Phase' },
    72: { type: 'ladder', destination: 75, message: 'GS papers practice done! 📝', phase: 'Mains Phase' },

    // Interview Phase (76-95)
    78: { type: 'ladder', destination: 92, message: 'Mock interviews aced! 🎤', phase: 'Interview Phase' },
    82: { type: 'challenge', destination: 61, message: 'Personality test anxiety! 😥', phase: 'Interview Phase' },
    85: { type: 'ladder', destination: 94, message: 'Current affairs sharp! 🔍', phase: 'Interview Phase' },
    89: { type: 'challenge', destination: 73, message: 'Interview nervousness! 😰', phase: 'Interview Phase' },
    92: { type: 'challenge', destination: 76, message: 'Self-doubt before interview! 🤔', phase: 'Interview Phase' },

    // Final Phase (96-100)
    97: { type: 'ladder', destination: 100, message: 'Confidence boost before result! 💪', phase: 'Final Phase' }
};

// Get current phase based on position
function getCurrentPhase(position) {
    for (const [phaseName, phaseData] of Object.entries(phases)) {
        if (position >= phaseData.range[0] && position <= phaseData.range[1]) {
            return { name: phaseName, data: phaseData };
        }
    }
    return { name: 'Study Phase', data: phases['Study Phase'] };
}

// Initialize the game
function initGame() {
    createBoard();
    updatePlayerPosition();
    updateUI();
}

// Create the game board
function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';

    // Create cells from 100 to 1 (reverse order for proper display)
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            let cellNumber;
            
            // Calculate cell number based on snake pattern
            if (row % 2 === 0) {
                cellNumber = 100 - (row * 10 + col);
            } else {
                cellNumber = 100 - (row * 10 + (9 - col));
            }

            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${cellNumber}`;

            // Add phase-based styling
            const currentPhase = getCurrentPhase(cellNumber);
            if (cellNumber >= 1 && cellNumber <= 25) {
                cell.classList.add('study-phase');
            } else if (cellNumber >= 26 && cellNumber <= 50) {
                cell.classList.add('prelims-phase');
            } else if (cellNumber >= 51 && cellNumber <= 75) {
                cell.classList.add('mains-phase');
            } else if (cellNumber >= 76 && cellNumber <= 95) {
                cell.classList.add('interview-phase');
            } else if (cellNumber >= 96 && cellNumber <= 100) {
                cell.classList.add('final-phase');
            }

            // Add special styling for different cell types
            if (cellNumber === 1) {
                cell.classList.add('start');
            } else if (cellNumber === 100) {
                cell.classList.add('finish');
            } else if (specialCells[cellNumber]) {
                cell.classList.add(specialCells[cellNumber].type);
            }

            // Add cell content
            const cellNumber_div = document.createElement('div');
            cellNumber_div.className = 'cell-number';
            cellNumber_div.textContent = cellNumber;
            cell.appendChild(cellNumber_div);

            if (specialCells[cellNumber]) {
                const icon = document.createElement('div');
                icon.className = 'cell-icon';
                icon.textContent = specialCells[cellNumber].type === 'ladder' ? '🪜' : '⚠️';
                cell.appendChild(icon);
            }

            board.appendChild(cell);
        }
    }
}

// Update player position on the board
function updatePlayerPosition() {
    // Remove player from all cells
    document.querySelectorAll('.player').forEach(player => player.remove());

    if (currentPosition > 0) {
        const cell = document.getElementById(`cell-${currentPosition}`);
        if (cell) {
            const player = document.createElement('div');
            player.className = 'player';
            player.textContent = '👩‍💼';
            cell.appendChild(player);
        }
    }
}

// Update UI elements
function updateUI() {
    document.getElementById('currentPosition').textContent = currentPosition;
    updatePhaseIndicator();
}

// Update phase indicator
function updatePhaseIndicator() {
    const currentPhase = getCurrentPhase(currentPosition);
    const phaseElement = document.getElementById('currentPhase');
    const phaseProgressElement = document.getElementById('phaseProgress');
    
    if (phaseElement) {
        phaseElement.textContent = `${currentPhase.data.emoji} ${currentPhase.name}`;
        phaseElement.style.background = `linear-gradient(45deg, ${currentPhase.data.color}20, ${currentPhase.data.color}40)`;
        phaseElement.style.color = currentPhase.data.color;
    }
    
    // Update phase progress
    if (phaseProgressElement) {
        phaseProgressElement.innerHTML = '';
        Object.entries(phases).forEach(([phaseName, phaseData]) => {
            const step = document.createElement('div');
            step.className = 'phase-step';
            step.textContent = phaseData.emoji;
            step.title = phaseName;
            
            if (currentPosition >= phaseData.range[1]) {
                step.classList.add('completed');
            } else if (currentPosition >= phaseData.range[0] && currentPosition <= phaseData.range[1]) {
                step.classList.add('current');
            }
            
            phaseProgressElement.appendChild(step);
        });
    }
}

// Roll dice function
function rollDice() {
    if (isRolling) return;

    // Initialize audio context on first user interaction
    if (!audioContext) {
        initAudio();
    }

    isRolling = true;
    const rollBtn = document.getElementById('rollDice');
    const diceElement = document.getElementById('dice');
    
    rollBtn.disabled = true;
    
    // Play dice roll sound
    playDiceRollSound();
    
    // Animate dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const tempRoll = Math.floor(Math.random() * 6) + 1;
        diceElement.textContent = tempRoll;
        rollCount++;
        
        if (rollCount >= 10) {
            clearInterval(rollInterval);
            
            // Final dice result
            const diceResult = Math.floor(Math.random() * 6) + 1;
            diceElement.textContent = diceResult;
            document.getElementById('lastRoll').textContent = diceResult;
            
            // Move player
            setTimeout(() => {
                movePlayer(diceResult);
                isRolling = false;
                rollBtn.disabled = false;
            }, 500);
        }
    }, 100);

    // Play dice roll sound (visual feedback)
    diceElement.style.animation = 'none';
    setTimeout(() => {
        diceElement.style.animation = 'roll 0.5s ease';
    }, 10);
}

// Move player function
function movePlayer(steps) {
    let newPosition = currentPosition + steps;

    // Check if player overshoots 100
    if (newPosition > 100) {
        showMessage("Can't overshoot! Stay where you are. 🛑");
        return;
    }

    const oldPhase = getCurrentPhase(currentPosition);

    // Animate movement step by step
    animateMovement(currentPosition, newPosition, () => {
        currentPosition = newPosition;
        updatePlayerPosition();
        updateUI();

        // Check for phase completion
        const newPhase = getCurrentPhase(currentPosition);
        if (oldPhase.name !== newPhase.name && currentPosition > 1) {
            showPhaseCompletionMessage(oldPhase.name);
        }

        // Check for special cells
        if (specialCells[currentPosition]) {
            const special = specialCells[currentPosition];
            setTimeout(() => {
                showMessage(special.message);
                
                // Play appropriate sound based on cell type
                if (special.type === 'ladder') {
                    playLadderSound();
                } else if (special.type === 'challenge') {
                    playChallengeSound();
                }
                
                setTimeout(() => {
                    currentPosition = special.destination;
                    updatePlayerPosition();
                    updateUI();
                    
                    // Check for win condition
                    if (currentPosition >= 100) {
                        playWinSound();
                        showWinModal();
                    }
                }, 1000);
            }, 500);
        } else if (currentPosition >= 100) {
            playWinSound();
            showWinModal();
        }
    });
}

// Show phase completion message
function showPhaseCompletionMessage(completedPhase) {
    let message = '';
    switch(completedPhase) {
        case 'Study Phase':
            message = '🎉 Study Phase Cleared! Ready for Prelims! 📝';
            break;
        case 'Prelims Phase':
            message = '🎉 Prelims Cleared! Moving to Mains! ✍️';
            break;
        case 'Mains Phase':
            message = '🎉 Mains Cleared! Interview time! 🗣️';
            break;
        case 'Interview Phase':
            message = '🎉 Interview Cleared! Final stretch! 🏆';
            break;
    }
    
    if (message) {
        setTimeout(() => {
            showMessage(message);
            playLadderSound();
        }, 1000);
    }
}

// Animate player movement
function animateMovement(start, end, callback) {
    if (start >= end) {
        callback();
        return;
    }

    const step = () => {
        start++;
        currentPosition = start;
        updatePlayerPosition();
        updateUI();
        
        // Play move sound for each step
        playMoveSound();

        if (start < end) {
            setTimeout(step, 200);
        } else {
            callback();
        }
    };

    setTimeout(step, 200);
}

// Show message function
function showMessage(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 1000;
        animation: fadeInOut 3s ease;
    `;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);

    // Add fadeInOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        messageEl.remove();
        style.remove();
    }, 3000);
}

// Show win modal
function showWinModal() {
    const modal = document.getElementById('winModal');
    modal.style.display = 'flex';
    
    // Add celebration effects
    createCelebrationEffects();
}

// Create celebration effects
function createCelebrationEffects() {
    const emojis = ['🎉', '🎊', '👏', '🏆', '⭐', '💫'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: 30px;
                z-index: 1001;
                animation: fall 3s ease-out forwards;
                pointer-events: none;
            `;
            document.body.appendChild(emoji);

            setTimeout(() => emoji.remove(), 3000);
        }, i * 100);
    }

    // Add fall animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(calc(100vh + 50px)) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Restart game function
function restartGame() {
    currentPosition = 0;
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('lastRoll').textContent = '-';
    updatePlayerPosition();
    updateUI();
    
    // Remove any celebration effects
    document.querySelectorAll('[style*="fall"]').forEach(el => el.remove());
}

// Event listeners
document.getElementById('rollDice').addEventListener('click', rollDice);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isRolling) {
        e.preventDefault();
        rollDice();
    }
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // Audio context will be initialized on first user interaction (dice roll)
});
