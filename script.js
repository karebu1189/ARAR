import { Hands } from 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
import { Camera } from 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

const video = document.getElementById('camera');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// -------------------
// 敵情報
// -------------------
let enemies = [];
const enemyCount = 6;
for (let i = 0; i < enemyCount; i++) {
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2 + 50,
    radius: 30,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 1
  });
}

// -------------------
// ビーム情報
// -------------------
let beams = [];
let explosions = [];

// -------------------
// MediaPipe Hands設定
// -------------------
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// -------------------
// 手の検出結果
// -------------------
hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    const x = lm[8].x * canvas.width;
    const y = lm[8].y * canvas.height;

    // 指を曲げたらビーム発射
    const curl = lm[8].y - lm[6].y;
    if (curl < -0.02) {
      beams.push({ x, y, vx: 0, vy: -15, trail: [] });
    }
  }
});

// -------------------
// カメラ起動
// -------------------
const cam = new Camera(video, {
  onFrame: async () => { await hands.send({ image: video }); },
  width: canvas.width,
  height: canvas.height
});
cam.start();

// -------------------
// 描画ループ
// -------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // -------------------
  // 敵描画＆移動
  // -------------------
  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    e.x += e.vx;
    e.y += e.vy;

    if (e.x < e.radius || e.x > canvas.width - e.radius) e.vx *= -1;
    if (e.y < e.radius || e.y > canvas.height / 2) e.vy *= -1;

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // -------------------
  // ビーム描画＆衝突判定（逆順ループ）
  // -------------------
  for (let i = beams.length - 1; i >= 0; i--) {
    let b = beams[i];
    b.y += b.vy;

    // 光の尾(trail)追加
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 30) b.trail.shift();

    // トレイル描画
    for (let j = 0; j < b.trail.length; j++) {
      const p = b.trail[j];
      ctx.fillStyle = `rgba(0,255,255,${j / b.trail.length})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10 * (j / b.trail.length + 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // 衝突判定（逆順ループ）
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      const dx = b.x - e.x;
      const dy = b.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < e.radius + 10) {
        // 爆発パーティクル追加
        for (let k = 0; k < 30; k++) {
          explosions.push({
            x: e.x,
            y: e.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            t: 40,
            r: Math.random() * 5 + 5
          });
        }
        enemies.splice(j, 1);
        beams.splice(i, 1);
        break;
      }
    }
  }

  // -------------------
  // 爆発描画
  // -------------------
  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 255)},0,${ex.t / 40})`;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.r * (ex.t / 40 + 0.5), 0, Math.PI * 2);
    ctx.fill();

    ex.x += ex.vx;
    ex.y += ex.vy;
    ex.t--;
    if (ex.t <= 0) explosions.splice(i, 1);
  }

  requestAnimationFrame(draw);
}

draw();
