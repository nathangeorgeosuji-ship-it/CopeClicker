// --- Game State ---
let stress = parseInt(localStorage.getItem('startingStress')) || 860;
let copeCount = 0;
let badCopeCount = 0;
let baseStressRate = 1;
let isGameOver = false;

// Multipliers
let tempMultiplier = 1;      

// --- DOM Elements ---
const progressBar = document.querySelector('.progress-bar');
const mainBtn = document.querySelector('.coping-clicker-btn');
const countDisplay = document.querySelector('.count');
const listItems = document.querySelectorAll('.cont ul li');

// --- Initialization ---
listItems.forEach(li => li.classList.add('locked'));

// --- The Continuous Animation Loop ---
function animate() {
    if (isGameOver) return;
    
    stress += baseStressRate; 
    const percent = Math.floor((stress / 1000) * 100);
    progressBar.style.width = percent + "%";
    progressBar.innerText = `STRESS ${percent}%`;
    
    if (stress >= 1000) {
        stress = 1000;
        endGame(badCopeCount > 0 ? "bad" : "neutral");
        return;
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// --- Helper: Apply Stress Reduction ---
function applyCoping(baseReduction) {
    let totalReduction = baseReduction * tempMultiplier;
    stress = Math.max(0, stress - totalReduction);
    copeCount += (1 * tempMultiplier);
    processAction();
}

// --- Interaction Listeners ---
mainBtn.addEventListener('click', () => {
    if (isGameOver) return;
    applyCoping(10); 
});

// Good Buttons: 1.5x to 2x, fade animation
document.querySelectorAll('.good button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isGameOver) return;
        
        // Fade away effect
        const parent = e.target.parentElement;
        parent.style.transition = 'opacity 0.5s';
        parent.style.opacity = '0';
        setTimeout(() => parent.style.display = 'none', 500);
        
        const randomMult = Math.random() * (2 - 1.5) + 1.5;
        tempMultiplier = randomMult;
        applyCoping(25);
        tempMultiplier = 1; // Reset
    });
});

// Bad Buttons: 2x multiplier for 15s, stress rises faster
document.querySelectorAll('.bad button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isGameOver) return;
        badCopeCount++; 
        
        // Fade away effect
        const parent = e.target.parentElement;
        parent.style.transition = 'opacity 0.5s';
        parent.style.opacity = '0';
        setTimeout(() => parent.style.display = 'none', 500);
        
        // Logic: Stress rises faster and multiplier active for 15s
        baseStressRate += 0.5; 
        tempMultiplier = 2;
        setTimeout(() => { tempMultiplier = 1; }, 15000); 
        
        applyCoping(30);
    });
});

// --- Logic ---
function processAction() {
    updateUnlockables();
    countDisplay.textContent = `Count: ${Math.floor(copeCount)}`;
    if (stress <= 0) endGame(badCopeCount === 0 ? "good" : "neutral");
}

function updateUnlockables() {
    listItems.forEach((li, index) => {
        const requiredCount = 100 + (index * 100); 
        if (li.classList.contains('locked') && copeCount >= requiredCount) {
            li.classList.remove('locked');
            li.classList.add('fade-in'); 
            li.style.display = 'block'; 
        }
    });
}

// --- End Game Logic (Remains unchanged) ---
async function endGame(type) {
    if (isGameOver) return;
    isGameOver = true;
    const overlay = document.getElementById('ending-overlay');
    const textDiv = document.getElementById('ending-text');
    overlay.classList.add('fade-in');

    if (type === "bad") {
        document.body.classList.add('grayscale');
        textDiv.innerHTML = `<div class="bad-ending-title">BAD ENDING</div><p>Final Score: ${Math.floor(copeCount)}</p>`;
    } else if (type === "neutral") {
        textDiv.innerHTML = `<div class="neutral-ending-title">NEUTRAL ENDING</div><p>Final Score: ${Math.floor(copeCount)}</p>`;
    } else if (type === "good") {
        textDiv.innerHTML = `<div class="good-ending-title">GOOD ENDING</div><p>Final Score: ${Math.floor(copeCount)}</p>`;
    }
}
