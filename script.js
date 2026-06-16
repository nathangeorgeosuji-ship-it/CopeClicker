// --- Game State ---
// Retrieve starting stress from localStorage (set by front.html), default to 860
let stress = parseInt(localStorage.getItem('startingStress')) || 860;
let copeCount = 0;
let badCopeCount = 0;
let baseStressRate = 1;
let isGameOver = false;

// Multipliers
let permanentMultiplier = 1; 
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
    
    // Constant stress increase
    stress += baseStressRate; 
    
    // Update UI
    const percent = Math.floor((stress / 1000) * 100);
    progressBar.style.width = percent + "%";
    progressBar.innerText = `STRESS ${percent}%`;
    
    // Check for Loss Conditions (Bad Ending or Neutral Loss)
    if (stress >= 1000) {
        stress = 1000;
        endGame(badCopeCount > 0 ? "bad" : "neutral");
        return;
    }
    
    requestAnimationFrame(animate);
}

// Start the loop
requestAnimationFrame(animate);

// --- Helper: Apply Stress Reduction ---
function applyCoping(baseReduction) {
    let currentMult = permanentMultiplier * tempMultiplier;
    let totalReduction = baseReduction * currentMult;
    
    stress = Math.max(0, stress - totalReduction);
    // Multiply counts earned based on multipliers
    copeCount += (1 * currentMult); 
    
    processAction();
}

// --- Interaction Listeners ---
mainBtn.addEventListener('click', () => {
    if (isGameOver) return;
    applyCoping(10); 
});

document.querySelectorAll('.good button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isGameOver) return;
        
        // 1. Fade away animation
        const li = e.target.parentElement;
        li.classList.remove('fade-in'); 
        li.classList.add('fade-out');
        setTimeout(() => { li.style.display = 'none'; }, 500);
        
        // 2. Permanent multiplier between x1.5 and x2.0
        const randomBonus = (Math.random() * 0.5) + 1.5; 
        permanentMultiplier *= randomBonus;
        
        applyCoping(25);
    });
});

document.querySelectorAll('.bad button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isGameOver) return;
        badCopeCount++; 
        
        // 1. Fade away animation
        const li = e.target.parentElement;
        li.classList.remove('fade-in');
        li.classList.add('fade-out');
        setTimeout(() => { li.style.display = 'none'; }, 500);
        
        // 2. Make stress rise faster
        stress += 80; 
        baseStressRate += 0.5; // Increased penalty so stress rises even faster
        
        // 3. x2 multiplier for 15 seconds (15000 milliseconds)
        tempMultiplier = 2;
        setTimeout(() => { tempMultiplier = 1; }, 15000); 
        
        applyCoping(30);
    });
});

// --- Logic ---
function processAction() {
    updateUnlockables();
    countDisplay.textContent = `Count: ${Math.floor(copeCount)}`;
    
    // Check for Win Conditions (Good Ending or Neutral Win)
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

    const overlay = document.getElementById('ending-overlay');
    const textDiv = document.getElementById('ending-text');
    overlay.classList.add('fade-in');

    // 1. BAD ENDING
    if (type === "bad") {
        document.body.classList.add('grayscale');
        textDiv.innerHTML = `
            <p>The choices you have made were bad.</p>
            <p>This caused for short satisfaction but higher stress.</p>
        `;
        await new Promise(r => setTimeout(r, 3000));
        textDiv.style.opacity = 0;
        await new Promise(r => setTimeout(r, 1000));
        textDiv.style.opacity = 1;
        textDiv.innerHTML = `
            <div class="bad-ending-title">BAD ENDING</div>
            <div style="font-size: 1.5rem;">Final Score: ${Math.floor(copeCount)}</div>
        `;
    } 
    
    // 2. NEUTRAL ENDING (Win or Loss variants)
    else if (type === "neutral") {
        const isWin = stress <= 0;
        
        if (isWin) {
            textDiv.innerHTML = `
                <p>Well done you won. But wasn't that stressful?</p>
                <p>Coping like that without positive coping mechanisms can be stressful and risky.</p>
            `;
        } else {
            textDiv.innerHTML = `
                <p>Coping without a positive coping mechanism can be very hard.</p>
                <p>It's not impossible but extremely difficult as you've learnt.</p>
            `;
        }

        await new Promise(r => setTimeout(r, 3000));
        textDiv.style.opacity = 0;
        await new Promise(r => setTimeout(r, 1000));
        textDiv.style.opacity = 1;
        textDiv.innerHTML = `
            <div class="neutral-ending-title">NEUTRAL ENDING</div>
            <div style="font-size: 1.5rem;">Final Score: ${Math.floor(copeCount)}</div>
        `;
    } 
    
    // 3. GOOD ENDING
    else if (type === "good") {
        textDiv.innerHTML = `
            <p>You made the right choices :D</p>
            <p>These coping mechanisms may not be as instant as the other ones but they are a lot better in the long run.</p>
        `;
        await new Promise(r => setTimeout(r, 3000));
        textDiv.style.opacity = 0;
        await new Promise(r => setTimeout(r, 1000));
        textDiv.style.opacity = 1;
        textDiv.innerHTML = `
            <div class="good-ending-title">GOOD ENDING</div>
            <div style="font-size: 1.5rem;">Final Score: ${Math.floor(copeCount)}</div>
        `;
    }
}
