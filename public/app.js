const segments = [
    'Jack & Jones T-Shirt',
    'Boss Raincoat',
    '5000 cashback',
    '3000 cashback',
    '15% discount',
    'Hoodie',
    'Baby T-shirt',
    '20% discount',
    '5% discount',
    "Belt + Socks"
];

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultEl = document.getElementById('result');
const modal = document.getElementById('resultModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModal');
const userInfoModal = document.getElementById('userInfoModal');
const userInfoForm = document.getElementById('userInfoForm');
const userNameInput = document.getElementById('userName');
const userPhoneInput = document.getElementById('userPhone');

let userInfo = {
    name: '',
    phone: ''
};

// Google Sheets Web App URL - Replace with your deployed Google Apps Script URL
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzcSHtr2v6FnjMZ40pKmz6fBDrwnJ_dxtKYrbTz7h_RxN_PH43mYVxXxY3hnwFay42nLg/exec';

const radius = canvas.width / 2;
const segmentAngle = (Math.PI * 2) / segments.length;

// Pointer is straight up (12 o’clock)
const pointerAngle = -Math.PI / 2;

// FIX 1 — Correct base rotation (no half-segment shift!)
const baseRotation = pointerAngle;

let rotation = 0;
let isSpinning = false;

const segmentColors = ['#ff0303', '#ffffff'];

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function drawWheel(angle = rotation) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < segments.length; i++) {
        const startAngle = baseRotation + angle + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 10, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segmentColors[i % 2];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7f1d1d';
        ctx.stroke();

        drawLabel(segments[i], startAngle + segmentAngle / 2);
    }

    drawCenterCap();
}

function drawLabel(text, angle) {
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = '16px "Poppins", sans-serif';

    const textRadius = radius * 0.65;
    const maxWidth = radius * 0.7;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) lines.push(currentLine);

    const lineHeight = 18;
    const offset = ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, textRadius, i * lineHeight - offset);
    });

    ctx.restore();
}

function drawCenterCap() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(radius, radius, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.restore();
}

function normalizeAngle(angle) {
    const full = Math.PI * 2;
    return ((angle % full) + full) % full;
}

// Function to send data to Google Sheets
async function sendToGoogleSheets(data) {
    if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('Google Sheets URL not configured. Please set GOOGLE_SHEETS_WEB_APP_URL in app.js');
        return;
    }

    try {
        const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Data sent to Google Sheets successfully:', result);
        } else {
            console.error('Failed to send data to Google Sheets:', response.status);
        }
    } catch (error) {
        // Fallback to no-cors mode if CORS fails
        try {
            await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('Data sent to Google Sheets (no-cors mode):', data);
        } catch (fallbackError) {
            console.error('Error sending data to Google Sheets:', fallbackError);
        }
    }
}

// FIX 2 — Winner calculation corrected 100%
function announceWinner() {
    // Reverse rotation (because wheel spins, pointer does not)
    const angle = normalizeAngle(-rotation);

    // Find which slice pointer is pointing to
    let winningIndex = Math.floor(angle / segmentAngle);

    winningIndex = winningIndex % segments.length;

    const prize = segments[winningIndex];
    const resultText = `You won: ${prize}!`;
    resultEl.textContent = resultText;
    openModal(resultText);
    
    // Send prize data to Google Sheets
    if (userInfo.name && userInfo.phone) {
        const prizeData = {
            type: 'prize',
            name: userInfo.name,
            phone: userInfo.phone,
            prize: prize,
            timestamp: new Date().toISOString()
        };
        sendToGoogleSheets(prizeData);
    }
}

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    resultEl.textContent = '';

    const extraRotations = 6 + Math.random() * 4;
    const finalRotation = rotation + extraRotations * Math.PI * 2;
    const duration = 4500;
    const startRotation = rotation;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const currentRotation = startRotation + (finalRotation - startRotation) * eased;

        drawWheel(currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            rotation = normalizeAngle(currentRotation);
            announceWinner();
            isSpinning = false;
            spinButton.disabled = false;
        }
    }

    requestAnimationFrame(animate);
}

spinButton.addEventListener('click', spinWheel);

spinButton.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        spinWheel();
    }
});

function openModal(message) {
    modalMessage.textContent = message;
    modal.setAttribute('aria-hidden', 'false');
    closeModalBtn.focus();
}

function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    spinButton.focus();
    spinButton.disabled = true;

}

closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
    if (event.target.dataset.closeModal !== undefined) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
    }
});

// Always show user info modal on page load and set up form handler
window.addEventListener('DOMContentLoaded', () => {
    // Always show the modal on page refresh
    userInfoModal.setAttribute('aria-hidden', 'false');
    spinButton.disabled = true;
    
    // Clear form fields to always ask for fresh user info on refresh
    userNameInput.value = '';
    userPhoneInput.value = '';
    
    // Clear localStorage to ensure fresh data entry
    localStorage.removeItem('userInfo');
    
    // Reset userInfo object
    userInfo.name = '';
    userInfo.phone = '';
    
    // Handle user info form submission
    if (userInfoForm) {
        userInfoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const name = userNameInput.value.trim();
            const phone = userPhoneInput.value.trim();
            
            if (name && phone) {
                userInfo.name = name;
                userInfo.phone = phone;
                
                // Store in localStorage for persistence
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                // Send user info to Google Sheets
                const userData = {
                    type: 'user_info',
                    name: name,
                    phone: phone,
                    timestamp: new Date().toISOString()
                };
                sendToGoogleSheets(userData);
                
                // Close the user info modal
                userInfoModal.setAttribute('aria-hidden', 'true');
                
                // Enable the spin button
                spinButton.disabled = false;
                
                // Focus on the spin button
                spinButton.focus();
            }
            
            return false;
        });
    }
    
    // Focus on the name input
    userNameInput.focus();
});

drawWheel();
