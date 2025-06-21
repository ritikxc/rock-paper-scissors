class EnhancedAI {
    constructor() {
        this.moveHistory = [];
        this.frequency = { rock: 0, paper: 0, scissors: 0 };
        this.lastPlayerMove = null;
        this.consecutiveMoves = 0;
    }
    
    predictMove() {
        if (Math.random() < 0.3 || this.moveHistory.length < 3) {
            return this.getRandomChoice();
        }
        
        if (this.consecutiveMoves >= 3) {
            return this.counterRepeatStrategy();
        }
        
        return this.frequencyBasedResponse();
    }
    
    getRandomChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        return choices[Math.floor(Math.random() * choices.length)];
    }
    
    counterRepeatStrategy() {
        const repeatedMove = this.lastPlayerMove;
        const counter = {
            rock: 'paper',
            paper: 'scissors',
            scissors: 'rock'
        };
        const metaCounter = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        return metaCounter[counter[repeatedMove]];
    }
    
    frequencyBasedResponse() {
        const maxFreq = Math.max(...Object.values(this.frequency));
        const bestMoves = Object.keys(this.frequency).filter(
            move => this.frequency[move] === maxFreq
        );
        const predictedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        
        const counter = {
            rock: 'paper',
            paper: 'scissors',
            scissors: 'rock'
        };
        return counter[predictedMove];
    }
    
    updateMemory(playerMove) {
        if (playerMove === this.lastPlayerMove) {
            this.consecutiveMoves++;
        } else {
            this.consecutiveMoves = 1;
        }
        this.lastPlayerMove = playerMove;
        
        this.moveHistory.push(playerMove);
        this.frequency[playerMove]++;
        
        if (this.moveHistory.length > 15) {
            const oldMove = this.moveHistory.shift();
            this.frequency[oldMove]--;
        }
    }
}

const game = {
    ai: new EnhancedAI(),
    score: { wins: 0, losses: 0, ties: 0 },
    history: [],
    sounds: {
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        lose: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3'),
        tie: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-neutral-game-notification-951.mp3'),
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3')
    },
    
    init() {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
        });
        
        document.querySelectorAll('.choice-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.playSound('click');
                const userChoice = e.currentTarget.dataset.choice;
                this.playRound(userChoice);
            });
        });
        
        document.getElementById('history-btn').addEventListener('click', () => {
            this.playSound('click');
            const historyContainer = document.getElementById('history-container');
            historyContainer.classList.toggle('hidden');
            this.updateHistoryDisplay();
            
            // Scroll to history section when opened
            if (!historyContainer.classList.contains('hidden')) {
                historyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.playSound('click');
            this.resetGame();
        });
        
        // Initialize with empty history display
        this.updateHistoryDisplay();
    },
    
    playSound(soundName) {
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Sound playback prevented:", e));
        } catch (e) {
            console.log("Sound error:", e);
        }
    },
    
    determineWinner(userChoice, aiChoice) {
        if (userChoice === aiChoice) return 'tie';
        if (
            (userChoice === 'rock' && aiChoice === 'scissors') ||
            (userChoice === 'paper' && aiChoice === 'rock') ||
            (userChoice === 'scissors' && aiChoice === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    },
    
    playRound(userChoice) {
        this.ai.updateMemory(userChoice);
        const aiChoice = this.ai.predictMove();
        const result = this.determineWinner(userChoice, aiChoice);
        
        this.score[result === 'win' ? 'wins' : result === 'lose' ? 'losses' : 'ties']++;
        
        this.history.unshift({
            user: userChoice,
            ai: aiChoice,
            result: result,
            time: new Date().toLocaleTimeString()
        });
        
        this.updateScoreDisplay();
        this.displayResult(userChoice, aiChoice, result);
        this.updateHistoryDisplay();
        
        this.playSound(result);
    },
    
    updateScoreDisplay() {
        document.getElementById('wins').textContent = this.score.wins;
        document.getElementById('losses').textContent = this.score.losses;
        document.getElementById('ties').textContent = this.score.ties;
    },
    
    displayResult(userChoice, aiChoice, result) {
        const resultText = document.getElementById('result-text');
        const aiChoiceDisplay = document.getElementById('ai-choice');
        const userChoiceDisplay = document.getElementById('user-choice');
        
        userChoiceDisplay.textContent = this.getEmoji(userChoice);
        aiChoiceDisplay.textContent = this.getEmoji(aiChoice);
        
        resultText.textContent = 
            result === 'win' ? 'YOU WIN!' :
            result === 'lose' ? 'AI WINS!' : 'TIE GAME!';
        
        resultText.className = result;
        resultText.style.animation = result === 'win' ? 'flicker 1.5s infinite' :
                                   result === 'lose' ? 'shake 0.5s 3' : 'glow 2s';
        
        setTimeout(() => {
            resultText.style.animation = '';
        }, 2000);
    },
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<li class="empty">No games played yet</li>';
            return;
        }
        
        this.history.forEach((round, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="time">${round.time}</span>
                <span class="moves">
                    <span class="move">${this.getEmoji(round.user)}</span>
                    <span class="vs">vs</span>
                    <span class="move">${this.getEmoji(round.ai)}</span>
                </span>
                <span class="result ${round.result}">${round.result.toUpperCase()}</span>
            `;
            historyList.appendChild(li);
        });
    },
    
    getEmoji(choice) {
        const emojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        return emojis[choice] || '❓';
    },
    
    resetGame() {
        this.ai = new EnhancedAI();
        this.score = { wins: 0, losses: 0, ties: 0 };
        this.history = [];
        this.updateScoreDisplay();
        document.getElementById('result-text').textContent = 'CHOOSE YOUR MOVE!';
        document.getElementById('user-choice').textContent = '❓';
        document.getElementById('ai-choice').textContent = '❓';
        this.updateHistoryDisplay();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    game.init();
});