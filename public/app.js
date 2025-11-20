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

const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_WEB_APP_ID/exec';

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultEl = document.getElementById('result');
const modal = document.getElementById('resultModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModal');
const userModal = document.getElementById('userInfoModal');
const userForm = document.getElementById('userInfoForm');
const userNameInput = document.getElementById('userName');
const userPhoneInput = document.getElementById('userPhone');
const userFormError = document.getElementById('userFormError');

const radius = canvas.width / 2;
const segmentAngle = (Math.PI * 2) / segments.length;

// Pointer is straight up (12 o’clock)
const pointerAngle = -Math.PI / 2;

// FIX 1 — Correct base rotation (no half-segment shift!)
const baseRotation = pointerAngle;

let rotation = 0;
let isSpinning = false;
let userProfile = null;

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
    sendResultToSheet(prize);
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

function openUserModal() {
    userForm.reset();
    userFormError.textContent = '';
    userModal.setAttribute('aria-hidden', 'false');
    userNameInput.focus();
}

function closeUserModal() {
    userModal.setAttribute('aria-hidden', 'true');
}

userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = userNameInput.value.trim();
    const phone = userPhoneInput.value.trim();

    if (!name || !phone) {
        userFormError.textContent = 'Name and phone number are required.';
        return;
    }

    userProfile = { name, phone };
    userFormError.textContent = '';
    closeUserModal();
    spinButton.disabled = false;
    spinButton.focus();
});

function sendResultToSheet(prize) {
    if (!userProfile) {
        console.warn('Skipping sheet sync: user info missing.');
        return;
    }

    if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.includes('REPLACE_WITH_YOUR_WEB_APP_ID')) {
        console.warn('Please configure GOOGLE_SHEET_WEB_APP_URL to enable sheet sync.');
        return;
    }

    const payload = {
        name: userProfile.name,
        phone: userProfile.phone,
        prize,
        timestamp: new Date().toISOString(),
    };

    fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).catch((error) => {
        console.error('Failed to send result to Google Sheet:', error);
    });
}

openUserModal();
drawWheel();
