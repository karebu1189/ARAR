import { Hands } from 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
import { Camera } from 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

const video = document.getElementById('camera');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Canvasサイズ設定
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 赤い四角オブジェクト
let obj = { x: canvas.width/2, y: canvas.height/2, size: 50 };

// Mediapipe Hands 初期化
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const hand = results.multiHandLandmarks[0];
    // ここでは手首(0)の座標を使用
    const xNorm = hand[0].x; // 0~1
    const yNorm = hand[0].y; // 0~1

    obj.x = xNorm * canvas.width;
    obj.y = yNorm * canvas.height;
  }
});

// カメラ起動
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();

// ゲームループ
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 赤い四角描画
  ctx.fillStyle = 'rgba(255,0,0,0.7)';
  ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);

  requestAnimationFrame(gameLoop);
}

gameLoop();
