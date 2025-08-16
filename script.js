const video = document.getElementById('camera');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// カメラ映像取得
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => { console.error("カメラ取得失敗:", err); });

// Canvasサイズをウィンドウに合わせる
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ゲーム用のオブジェクト
let obj = { x: 100, y: 100, size: 50, vx: 3, vy: 2 };

// メインループ
function gameLoop() {
  // Canvasクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // オブジェクト移動
  obj.x += obj.vx;
  obj.y += obj.vy;

  // 画面端で反射
  if (obj.x < 0 || obj.x > canvas.width - obj.size) obj.vx *= -1;
  if (obj.y < 0 || obj.y > canvas.height - obj.size) obj.vy *= -1;

  // オブジェクト描画
  ctx.fillStyle = 'rgba(255,0,0,0.7)';
  ctx.fillRect(obj.x, obj.y, obj.size, obj.size);

  requestAnimationFrame(gameLoop);
}

gameLoop();
