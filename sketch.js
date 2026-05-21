let lines = [];
let closedShapes = [];
let startTime;

const COLORS = [
  [255, 0, 255],
  [0, 0, 255],
  [255, 255, 0]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(10);
  startTime = millis();
}

function draw() {
  background(10, 20);

  for (let l of lines) {
    l.update();
    l.show();
  }

  noStroke();
  for (let s of closedShapes) {
    fill(...s.color, 120);
    beginShape();
    for (let p of s.points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  drawPrompt();
}

function drawPrompt() {
  let elapsed = (millis() - startTime) / 1000;
  if (elapsed >= 2) return;

  let alpha = elapsed < 3 ? 255 : map(elapsed, 3, 4, 255, 0);
  let pulse = map(sin(millis() * 0.005), -1, 1, 0.4, 1.0);
  let a = alpha * pulse;

  textAlign(CENTER, CENTER);
  textStyle(NORMAL);

  for (let r = 24; r >= 4; r -= 4) {
    let haloAlpha = map(r, 4, 24, a * 0.05, a * 0.01);
    textSize(22 + r);
    fill(0, 255, 120, haloAlpha);
    text("Click anywhere", width / 2, height / 2);
  }

  textSize(22);
  fill(0, 255, 120, a);
  text("Click anywhere", width / 2, height / 2);
}

function mousePressed() {
  lines.push(new SpiralLine(mouseX, mouseY));
}

class SpiralLine {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.points = [this.pos.copy()];
    this.alive = true;

    this.angle = random(TWO_PI);
    this.radiusStep = random(1.5, 3);

    this.noiseOffset = random(1000);

    this.mode = "curved";
    this.modeTimer = 0;
    this.lockedAngle = this.angle;
  }

  update() {
    if (!this.alive) return;

    this.modeTimer++;

    if (this.modeTimer > random(40, 120)) {
      this.modeTimer = 0;
      this.mode = random(["jagged", "curved", "edged"]);
    }

    let step = this.radiusStep;
    let nextAngle = this.angle;
    let noiseVal = noise(this.noiseOffset);

    if (this.mode === "curved") {
      nextAngle += map(noiseVal, 0, 1, -0.4, 0.4);
    } else if (this.mode === "jagged") {
      nextAngle += random(-1.2, 1.2);
    } else if (this.mode === "edged") {
      if (frameCount % 10 === 0) {
        this.lockedAngle += random(-HALF_PI, HALF_PI);
      }
      nextAngle = this.lockedAngle;
    }

    this.angle = nextAngle;

    let drift = 0.015 * frameCount;
    let dx = cos(this.angle + drift) * step;
    let dy = sin(this.angle + drift) * step;
    let next = createVector(this.pos.x + dx, this.pos.y + dy);

    for (let i = 0; i < this.points.length - 20; i++) {
      if (p5.Vector.dist(next, this.points[i]) < 6) {
        this.makeLoop(i);
        break;
      }
    }

    this.pos = next.copy();
    this.points.push(next);
    this.noiseOffset += 0.01;

    if (this.outOfBounds(next)) {
      this.alive = false;
    }
  }

  makeLoop(index) {
    let loopPoints = this.points.slice(index);
    if (loopPoints.length > 10) {
      closedShapes.push({
        points: loopPoints,
        color: random(COLORS)
      });
    }
  }

  outOfBounds(p) {
    return p.x < 0 || p.x > width || p.y < 0 || p.y > height;
  }

  show() {
    stroke(0, 255, 120);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let p of this.points) {
      vertex(p.x, p.y);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(10);
}