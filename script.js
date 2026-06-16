// --- Game State ---
let savedStress = localStorage.getItem('startingStress');
let stress = savedStress !== null ? parseInt(savedStress) : 660;

let copeCount = 0;
let badCopeCount = 0;
let baseStressRate = 1;
let isGameOver = false;

let permanentMultiplier = 1; 
let tempMultiplier = 1;      

// --- DOM Elements ---
const progressBar = document.querySelector('.progress-bar');
const mainBtn = document.querySelector('.coping-clicker-btn');
const countDisplay = document.querySelector('.count');
const listContainer = document.querySelector('.cont');
const listItems = document.querySelectorAll('.cont ul li');

// --- Initialization ---
listItems.forEach(li => li.classList.add('locked'));

// --- The Continuous Animation Loop ---
function animate() {
    if (isGameOver) return;
    
    stress += baseStressRate; 
    
    const percent = Math.min(100, Math.floor((stress / 1000) * 100));
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
    let currentMult = permanentMultiplier * tempMultiplier;
    let totalReduction = baseReduction * currentMult;
    
    stress = Math.max(0, stress - totalReduction);
    copeCount += (1 * currentMult);
    
    processAction();
}

// --- Interaction Listeners (Event Delegation) ---
mainBtn.addEventListener('click', () => {
    if (isGameOver) return;
    applyCoping(10); 
});

// Using event delegation on the container to catch clicks on list buttons
listContainer.addEventListener('click', (e) => {
    if (isGameOver) return;
    
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const parentLi = btn.parentElement;
    parentLi.style.display = 'none';

    if (parentLi.classList.contains('good')) {
        permanentMultiplier = Math.random() > 0.5 ? 0.6 : 1;
        applyCoping(25);
    } else if (parentLi.classList.contains('bad')) {
        badCopeCount++; 
        stress += 80; 
        baseStressRate += 0.3; 
        tempMultiplier = 2;
        setTimeout(() => { tempMultiplier = 1; }, 1500); 
        applyCoping(30);
    }
});

// --- Logic ---
function processAction() {
    updateUnlockables();
    countDisplay.textContent = `Count: ${Math.floor(copeCount)}`;
    
    if (stress <= 0) {
        endGame(badCopeCount === 0 ? "good" : "neutral");
    }
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

// --- End Game Logic ---
async function endGame(type) {
    if (isGameOver) return;
    isGameOver = true;

    localStorage.removeItem('startingStress');

    const overlay = document.getElementById('ending-overlay');
    const textDiv = document.getElementById('ending-text');
    overlay.classList.add('fade-in');

    if (type === "bad") {
        document.body.classList.add('grayscale');
        textDiv.innerHTML = `<p>The choices you have made were bad.</p><p>Short satisfaction, but higher stress.</p>`;
        await new Promise(r => setTimeout(r, 3000));
        textDiv.innerHTML = `<div class="bad-ending-title">BAD ENDING</div><div>Final Score: ${Math.floor(copeCount)}</div>`;
    } else if (type === "neutral") {
        textDiv.innerHTML = `<p>You won, but that was stressful.</p>`;
        await new Promise(r => setTimeout(r, 3000));
        textDiv.innerHTML = `<div class="neutral-ending-title">NEUTRAL ENDING</div><div>Final Score: ${Math.floor(copeCount)}</div>`;
    } else if (type === "good") {
        textDiv.innerHTML = `<p>You made the right choices :D</p>`;
        await new Promise(r => setTimeout(r, 3000));
        textDiv.innerHTML = `<div class="good-ending-title">GOOD ENDING</div><div>Final Score: ${Math.floor(copeCount)}</div>`;
    }
}