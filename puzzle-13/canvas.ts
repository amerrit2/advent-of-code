import { createCanvas } from 'canvas';

const canvas = createCanvas(200, 200).getContext('2d');

// Write "Awesome!"
canvas.font = '30px Impact'
canvas.rotate(0.1)
canvas.fillText('Awesome!', 50, 100)

// Draw line under text
var text = canvas.measureText('Awesome!')
canvas.strokeStyle = 'rgba(0,0,0,0.5)'
canvas.beginPath()
canvas.lineTo(50, 102)
canvas.lineTo(50 + text.width, 102)
canvas.stroke()
