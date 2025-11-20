# 🎡 Spin Wheel By Zaw Min Soe 

An interactive, animated spin wheel game built with vanilla JavaScript, HTML5 Canvas, and CSS. Features a beautiful red and white alternating segment design with smooth animations and a modal result display.

## ✨ Features

- **Interactive Spin Wheel**: Click the button to spin the wheel with smooth easing animations
- **Alternating Colors**: Red and white segments for a visually appealing design
- **Customizable Segments**: Easy to modify the prizes/rewards in the `segments` array
- **Modal Result Display**: Beautiful modal popup shows the winning result
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Keyboard navigation support (Enter/Space to spin, Escape to close modal)
- **Smooth Animations**: Cubic easing function for natural deceleration

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd Spin_Wheel
   ```

### Running the Application

#### Option 1: Using a Local Server (Recommended)
 using Node.js (if you have `http-server` installed):
```bash
npx http-server public -p 8000
```

#### Option 2: Direct File Access

Simply open `public/index.html` in your web browser. Note: Some features may be limited due to browser security restrictions.

## 📁 Project Structure

```
Spin_Wheel/
├── public/
│   ├── index.html      # Main HTML structure
│   ├── app.js          # JavaScript logic and canvas drawing
│   └── style.css       # Styling and animations
├── package.json        # Project metadata
├── firebase.json       # Firebase configuration (if using Firebase hosting)
└── README.md          # This file
```

## 🎮 How to Use

1. Open the application in your web browser
2. Click the **"Spin the Wheel"** button (or press Enter/Space)
3. Watch the wheel spin with smooth animations
4. When the spin completes, a modal will appear showing your prize
5. Click "Close" or press Escape to dismiss the modal

## ⚙️ Customization

### Changing Prizes/Segments

Edit the `segments` array in `public/app.js`:

```javascript
const segments = [
    'Your Prize 1',
    'Your Prize 2',
    'Your Prize 3',
    // Add more segments as needed
];
```

The wheel will automatically adjust to accommodate any number of segments.

### Changing Colors

Modify the `segmentColors` array in `public/app.js`:

```javascript
const segmentColors = ['#d90429', '#ffffff']; // Red and White
```

You can change these to any hex color codes you prefer.

### Adjusting Animation Speed

Modify the `duration` variable in the `spinWheel()` function:

```javascript
const duration = 4500; // Duration in milliseconds (default: 4500ms)
```

## 🛠️ Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, and responsive design
- **JavaScript (ES6+)**: Canvas API, animations, and interactivity
- **Canvas API**: For drawing the wheel segments and labels

## 📝 Key Functions

- `drawWheel(angle)`: Renders the wheel with all segments
- `drawLabel(text, angle)`: Draws text labels on each segment with word wrapping
- `spinWheel()`: Handles the spin animation with easing
- `announceWinner()`: Calculates and displays the winning segment
- `openModal(message)`: Shows the result modal
- `closeModal()`: Closes the result modal

## 🎨 Design Features

- Modern, clean UI with gradient buttons
- Smooth cubic easing animation
- Drop shadows for depth
- Responsive layout that adapts to screen size
- Accessible modal with keyboard support
- Center pointer indicator for accurate results

## 📄 License

ISC

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📧 Support

If you encounter any issues or have questions, please open an issue on the repository.

---

**Enjoy spinning! 🎉**

