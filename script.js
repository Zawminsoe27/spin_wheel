// Global variables
let wheel, spinButton, result, isSpinning = false, segments = [], currentRotation = 0;
let resultModal, modalResult, closeModal, closeModalBtn, spinAgain;
const segmentData = [
    { text: "Option 1", color: "#FF6B6B" },
    { text: "Option 2", color: "#4ECDC4" },
    { text: "Option 3", color: "#45B7D1" },
    { text: "Option 4", color: "#96CEB4" },
    { text: "Option 5", color: "#FFEAA7" },
    { text: "Option 6", color: "#DDA0DD" },
    { text: "Option 7", color: "#98D8C8" },
    { text: "Option 8", color: "#F7DC6F" },
    { text: "Option 9", color: "#BB8FCE" },
    { text: "Option 10", color: "#85C1E9" }
];

// Initialize the spin wheel
function initSpinWheel() {
    wheel = document.getElementById('wheel');
    spinButton = document.getElementById('spinButton');
    result = document.getElementById('result');
    
    // Modal elements
    resultModal = document.getElementById('resultModal');
    modalResult = document.getElementById('modalResult');
    closeModal = document.getElementById('closeModal');
    closeModalBtn = document.getElementById('closeModalBtn');
    spinAgain = document.getElementById('spinAgain');
    
    spinButton.addEventListener('click', spin);
    
    // Modal event listeners
    closeModal.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);
    spinAgain.addEventListener('click', () => {
        hideModal();
        spin();
    });
    
    // Close modal when clicking outside
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            hideModal();
        }
    });
    
    createSegments();
}

// Create SVG segments
function createSegments() {
    const segmentsContainer = document.getElementById('segments');
    const centerX = 200;
    const centerY = 200;
    const radius = 192; // Slightly smaller than the circle to account for border
    const numSegments = segmentData.length;
    const anglePerSegment = 360 / numSegments;
    
    segmentData.forEach((segment, index) => {
        const startAngle = (index * anglePerSegment - 90) * Math.PI / 180; // Start from top
        const endAngle = ((index + 1) * anglePerSegment - 90) * Math.PI / 180;
        
        // Calculate path for pie slice
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');
        
        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', segment.color);
        path.setAttribute('stroke', 'rgba(255,255,255,0.3)');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('class', 'segment');
        path.setAttribute('data-index', index);
        path.setAttribute('data-text', segment.text);
        
        // Calculate text position (middle of the segment)
        const textAngle = (startAngle + endAngle) / 2;
        const textRadius = radius * 0.7; // Position text closer to center
        const textX = centerX + textRadius * Math.cos(textAngle);
        const textY = centerY + textRadius * Math.sin(textAngle);
        
        // Create text element
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('class', 'segment-text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', segment.color === '#FFEAA7' || segment.color === '#F7DC6F' ? '#333' : 'white');
        text.textContent = segment.text.length > 8 ? segment.text.substring(0, 8) + '...' : segment.text;
        
        // Add to segments container
        segmentsContainer.appendChild(path);
        segmentsContainer.appendChild(text);
        
        segments.push(path);
    });
}

// Spin the wheel
function spin() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    result.textContent = '';
    
    // Generate random rotation (multiple full rotations + random segment)
    const baseRotation = 1800; // 5 full rotations
    const randomRotation = Math.random() * 360;
    const targetRotation = currentRotation + baseRotation + randomRotation;
    
    // Set CSS custom properties for animation
    wheel.style.setProperty('--current-rotation', `${currentRotation}deg`);
    wheel.style.setProperty('--target-rotation', `${targetRotation}deg`);
    
    // Add spinning class
    wheel.classList.add('spinning');
    
    // Update current rotation for next spin
    currentRotation = targetRotation;
    
    // Calculate which segment will be selected
    const normalizedRotation = (360 - (randomRotation % 360)) % 360;
    const segmentAngle = 360 / segments.length;
    const selectedSegmentIndex = Math.floor(normalizedRotation / segmentAngle);
    
    // Show result after animation completes
    setTimeout(() => {
        showResult(selectedSegmentIndex);
        resetWheel();
    }, 4000);
}

// Show the result
function showResult(segmentIndex) {
    const selectedText = segmentData[segmentIndex].text;
    const selectedColor = segmentData[segmentIndex].color;
    
    // Update the small result display
    result.textContent = `🎉 You got: ${selectedText}! 🎉`;
    result.style.color = '#FFD700';
    
    // Add a small celebration effect
    result.style.transform = 'scale(1.1)';
    setTimeout(() => {
        result.style.transform = 'scale(1)';
    }, 200);
    
    // Show modal with result
    showModal(selectedText, selectedColor);
}

// Show modal dialog
function showModal(selectedText, selectedColor) {
    modalResult.textContent = selectedText;
    modalResult.style.color = selectedColor;
    resultModal.classList.add('show');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Hide modal dialog
function hideModal() {
    resultModal.classList.remove('show');
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Reset the wheel
function resetWheel() {
    isSpinning = false;
    spinButton.disabled = false;
    
    // Remove spinning class but keep final position
    setTimeout(() => {
        wheel.classList.remove('spinning');
        // Set the final rotation directly on the wheel element
        wheel.style.transform = `rotate(${currentRotation}deg)`;
    }, 100);
}

// Handle keyboard input
function handleKeydown(e) {
    if (e.code === 'Space' && !document.getElementById('spinButton').disabled) {
        e.preventDefault();
        document.getElementById('spinButton').click();
    }
    
    // Close modal with Escape key
    if (e.code === 'Escape' && resultModal.classList.contains('show')) {
        hideModal();
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initSpinWheel();
    document.addEventListener('keydown', handleKeydown);
});