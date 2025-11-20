let sketch = (p) => {
  let w, h;
  let p5canvas = {};
  let dragging = false;
  let slingshot;
  let inputText = "";
  const files = ["fly.mp3", "sling.mp3", "shot.mp3", "pop.mp3"];

  p.setup = () => {
    w = p.select("#canvasBox").width;
    h = p.select("#canvasBox").height;
    p.createCanvas(w, h);
    p5canvas.birds = [];
    p5canvas.floorNumbers = [];
    p5canvas.gravity = 0.5;
    p5canvas.maxHits = 1;
    p5canvas.birdLifetime = 10000;
    p5canvas.bgColor = [18, 18, 18];
    p5canvas.floorColor = [0, 0, 0];
    p5canvas.birdColor = [229, 57, 53];
    p5canvas.sfx = files.map((src) => {
      const a = new Audio(src);
      a.preload = "auto";
      return a;
    });
    slingshot = p.createVector(150, p.height - 150);
    p5canvas.birds.push(new Bird(slingshot.x, slingshot.y));
    generateFloor();
    p5canvas.sfx = ["fly.mp3", "sling.mp3", "shot.mp3", "pop.mp3"].map(
      (src) => {
        const a = new Audio(src);
        a.preload = "auto";
        return a;
      }
    );
    p5canvas.music = p.createAudio("angwybirds.mp3");
    p5canvas.music.autoplay(false);
    p5canvas.music.volume(0.4);
  };
  p.windowResized = () => {
    w = p.select("#canvasBox").width;
    h = p.select("#canvasBox").height;
    p.resizeCanvas(w, h);
    generateFloor();
  };
  p.draw = () => {
    p.background(20);
    p.background(p5canvas.bgColor);
    let b = p5canvas.birds[p5canvas.birds.length - 1];
    if (p.dist(p.mouseX, p.mouseY, b.pos.x, b.pos.y) < b.r) p.cursor("grab");
    else {
      p.cursor("default");
    }
    if (dragging) p.cursor("grabbing");
    drawFloor();
    drawPrediction();
    p5canvas.birds.forEach((b) => {
      b.update();
      b.show();
    });
  };
  p.mousePressed = () => {
    let b = p5canvas.birds[p5canvas.birds.length - 1];
    if (p.dist(p.mouseX, p.mouseY, b.pos.x, b.pos.y) < b.r) {
      dragging = true;
      playSFX("sling");
    }
  };
  p.mouseReleased = () => {
    if (!dragging) return;
    dragging = false;
    let b = p5canvas.birds[p5canvas.birds.length - 1];
    b.fly(p.createVector(p.mouseX, p.mouseY));
    playSFX("shot");
    p5canvas.birds.push(new Bird(slingshot.x, slingshot.y));
  };
  p.keyPressed = () => {
    if (p.key === "Backspace") inputText = inputText.slice(0, -1);
    document.getElementById("ph").value = inputText;
  };
  function generateFloor() {
    p5canvas.floorNumbers = [];
    let startX = p.width * 0.2;
    let w = (p.width * 0.8) / 10;
    p5canvas.floorNumbers.push({ x: startX - w, w, n: "+", glow: 0 });
    for (let i = 0; i < 10; i++)
      p5canvas.floorNumbers.push({ x: startX + i * w, w, n: i, glow: 0 });
  }
  function playSFX(name, volume = 0.5) {
    const i = files.indexOf(name + ".mp3");
    const a = p5canvas.sfx[i];
    if (!a) return;
    a.volume = volume;
    a.currentTime = 0.1;
    a.play().catch(() => {});
  }
  function drawFloor() {
    const h = 50;
    p.fill(0);
    p.rect(0, p.height - h, p.width, h);
    for (let f of p5canvas.floorNumbers) {
      p.fill(
        f.glow > 0 ? p.color(255, 255, 0, (f.glow -= 5)) : p5canvas.floorColor
      );
      p.rect(f.x, p.height - h, f.w, h);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(25);
      p.text(f.n, f.x + f.w / 2, p.height - h / 2);
    }
  }
  function drawPrediction() {
    if (!dragging) return;
    let pos = p.createVector(p.mouseX, p.mouseY);
    let vel = p5.Vector.sub(slingshot, p.createVector(p.mouseX, p.mouseY)).mult(
      0.15
    );
    p.noFill();
    p.strokeWeight(2);
    for (let t = 0; t < 100; t += 2) {
      vel.y += p5canvas.gravity;
      pos.add(vel.copy());
      p.stroke(255, 255, 0, p.map(t, 0, 100, 255, 0));
      p.ellipse(pos.x, pos.y, 5);
    }
  }
  class Bird {
    constructor(x, y) {
      this.pos = p.createVector(x, y);
      this.r = 20;
      this.vel = p.createVector();
      this.flying = false;
      this.hidden = false;
      this.hits = 0;
      this.ine = 1;
    }
    fly(target) {
      this.vel = p5.Vector.sub(slingshot, target).mult(0.15);
      this.flying = true;
      this.ine = 1;
    }
    update() {
      if (this.ine > 0) this.ine -= 0.1;
      if (dragging && this === p5canvas.birds[p5canvas.birds.length - 1])
        this.pos.set(p.mouseX, p.mouseY);
      else if (this.flying) {
        this.vel.y += p5canvas.gravity;
        this.pos.add(this.vel);
        if (this.ine > 0) return;

        if (this.pos.x - this.r < 0 || this.pos.x + this.r > p.width)
          this.vel.x *= -1;
        if (this.pos.y - this.r < 0) this.vel.y *= -1;

        const h = 50;
        if (this.pos.y + this.r > p.height - h) {
          this.pos.y = p.height - h - this.r;
          this.vel.y *= -0.7;
          this.vel.x *= 0.7;

          for (let f of p5canvas.floorNumbers)
            if (
              this.pos.x > f.x &&
              this.pos.x < f.x + f.w &&
              this.hits < p5canvas.maxHits
            ) {
              inputText += f.n;
              document.getElementById("ph").value += f.n;
              f.glow = 255;
              this.hits++;
              playSFX("hit");
              break;
            }
        }
        this.r *= 0.995;
        if (this.r < 1) this.hidden = true;
      }
    }
    show() {
      if (this.hidden) return;
      p.fill(p5canvas.birdColor);
      p.noStroke();
      p.ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
  }
};
let wheel;

function initWheel() {
  const roles = ["Developer", "Designer", "Manager", "QA", "Support", "Other"];
  let held = false;
  wheel = new p5((p) => {
    let spin = 0,
      spinning = false,
      speed = 0,
      slices = roles.length;
    p.setup = () => {
      let c = p.createCanvas(400, 400);
      c.parent("wheel-container");
      p.angleMode(p.DEGREES);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
    };
    p.draw = () => {
      p.clear();
      p.translate(p.width / 2, p.height / 2);
      p.push();
      p.rotate(spin);
      for (let i = 0; i < slices; i++) {
        let normalized = ((spin % 360) + 360 - 360 / 12) % 360;
        let sliceAngle = 360 / slices;
        let idx = Math.floor(
          (slices - Math.floor(normalized / sliceAngle)) % slices
        );
        p.fill(i % 2 ? "#2563eb" : "#3b82f6");
        if (i == idx) p.fill("#4bb44f9");
        p.arc(
          0,
          0,
          300,
          300,
          (i * 360) / slices,
          ((i + 1) * 360) / slices,
          p.PIE
        );
        p.push();
        let a = (i * 360) / slices + 360 / (2 * slices);
        p.rotate(a);
        p.translate(100, 0);
        p.rotate(-a);
        p.fill(255);
        p.text(roles[i], 0, 0);
        p.pop();
      }
      p.pop();
      p.fill("#ef4444");
      p.triangle(-10, 160, 10, 160, 0, 140);
      if (spinning) {
        spin += speed;
        if (!held) speed *= 0.99;
        if (speed < 0.05) {
          spinning = false;
          speed = 0;
          showResult();
        }
      }
    };
    p.keyPressed = () => {
      if (p.key === " ") {
        if (spinning) return;
        speed = p.random(30, 50);
        held = true;
        spinning = true;
        document.getElementById("role-result").textContent = "You are: ...";
      }
    };
    p.keyReleased = () => {
      if (p.key === " ") {
        if (spinning && !held) return;
        held = false;
      }
    };
    function showResult() {
      let normalized = ((spin % 360) + 360 - 360 / 12) % 360;
      let sliceAngle = 360 / slices;
      let idx = Math.floor(
        (slices - Math.floor(normalized / sliceAngle)) % slices
      );
      document.getElementById("create8").disabled = false;
      document.getElementById(
        "role-result"
      ).textContent = `You are: ${roles[idx]}`;
    }
  });
}
