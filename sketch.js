const policyText = `
<p>We <strong>do not collect your email, name, or any other information</strong>. <i>Information collected is only stored on your localStorage</i>, and never reaches any online servers.</p>
<p>We and our app will <strong>not be responsible</strong> IF any of your information is transferred to someone else without your consent. May have been a virus or anything. This app is provided <i>as-is</i> to the user.</p>
<p>Again, your data will <strong>not be stored or used by anyone</strong> unless you share a screenshot with someone else. In any case, you will be responsible if your data leaks.</p>
Your localStorage will be used to store a bunch of app preferences and stuff.
<p>You may request <i>deletion of your account</i> if you ever manage to sign up. Your data is protected by you and your browser's security.</p>
<p>We may update this policy and <strong>will not notify you</strong> when updates are significant.</p><br>`+`
<p>We do not track or monitor your usage of this application beyond the client-side storage necessary for functionality. All preferences, settings, and interactions remain strictly on your device. No data is transmitted to any server, cloud service, or third-party platform. You are fully responsible for safeguarding your own device and access credentials.</p>
<p>This application is provided <strong>"as-is"</strong>, without any warranties or guarantees of performance, security, or reliability. Any issues arising from misuse, unauthorized access, or device compromise are not the responsibility of the developers.</p>
<p>We may include optional features that require local storage for functionality, such as saving user preferences, caching data for faster load times, or storing temporary session information. All such data remains on your device and is never transmitted externally.</p>
<p>If you choose to share screenshots, logs, or other information from the app, that data leaves your control and we cannot be responsible for how it is used. Please exercise caution and discretion.</p>
<p>You may request deletion of any locally stored data by clearing your browser storage or app cache. No personal information is collected, stored, or processed externally at any point.</p>
<p>We may update this policy periodically to reflect changes in the app’s features or to clarify usage terms. Updates are effective immediately upon modification. It is your responsibility to review the policy from time to time.</p>
<p>By using this application, you acknowledge and accept that the developers are not liable for any data loss, device issues, or other outcomes resulting from app usage. You are solely responsible for protecting your own information.</p>
<p>Cookies or similar mechanisms may be used only for caching interface settings and are entirely client-side. We do not use cookies for tracking, marketing, or analytics purposes.</p>
<p>All intellectual property within the app, including code, graphics, and documentation, remains the property of the developers and is provided under the terms of use strictly for personal, non-commercial use.</p>
<p>If you experience any unexpected behavior, security warnings, or suspicious activity, you should immediately discontinue use and secure your device. We are not liable for any damages or consequences arising from such events.</p>
<p>Your continued use of this application constitutes acceptance of this privacy and usage policy. You retain full control over your data, which remains on your device unless you voluntarily share it.</p>
<p>You must agree that im a stupid web dev</p>
<p>The application may include links, references, or integrations with external content. We do not control these external resources and are not responsible for their content, privacy practices, or security.</p>
<p>Please note that although we make reasonable efforts to ensure the app functions correctly, no guarantee is made regarding uninterrupted access, error-free performance, or compatibility with all devices and environments.</p>
<p>You are encouraged to maintain backups of any data or preferences you wish to retain. We assume no responsibility for lost or corrupted data.</p>
<p>By using this application, you confirm that you understand these terms and agree to use the app responsibly and at your own risk.</p>
<p>This policy may be extended or modified in future releases, and continued usage after such updates signifies your acceptance of the revised terms.</p>
<p>All local data storage, including <i>localStorage</i>, <i>IndexedDB</i>, or similar technologies, is under your control. You can inspect, modify, or delete it at any time.</p>
<p>This app was made by a user who doesnt like users much P:</p><p>
We strongly advise against sharing device access, credentials, or locally stored data with anyone you do not trust. Doing so is entirely at your own risk.</p><p>
The application does not collect any personally identifiable information, usage metrics, or behavioral data. Any telemetry or analytics functionality is strictly disabled and remains inactive unless manually enabled by you.</p><p>
This policy serves as the full extent of our privacy and usage guidelines. By interacting with the app, you acknowledge that you have read, understood, and agreed to all the provisions contained herein.</p>
<p>Blah blah blah ehem</p>
`.repeat(20).trim();
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
      if (this.r < 0.02) return;
      if (this.ine > 0) this.ine -= 0.1;
      const isLast = this === p5canvas.birds[p5canvas.birds.length - 1];
      if (dragging && isLast) {
        this.pos.set(p.mouseX, p.mouseY);
        return;
      }
      if (!this.flying) return;
      this.vel.y += p5canvas.gravity;
      {
        const nextX = this.pos.x + this.vel.x;
        const nextY = this.pos.y + this.vel.y;
        if (nextX - this.r < 0) {
          this.pos.x = this.r;
          this.vel.x *= -0.8;
        }
        else if (nextX + this.r > p.width) {
          this.pos.x = p.width - this.r;
          this.vel.x *= -0.8;
        }
        if (nextY - this.r < 0) {
          this.pos.y = this.r;
          this.vel.y *= -0.8;
        }
      }
      this.pos.add(this.vel);
      if (this.ine > 0) return;
      const floor = p.height - 50;
      if (this.pos.y + this.r > floor) {
        this.pos.y = floor - this.r;
        this.vel.y *= -0.7;
        this.vel.x *= 0.7;
        for (let f of p5canvas.floorNumbers) {
          if (this.pos.x > f.x && this.pos.x < f.x + f.w && this.hits < p5canvas.maxHits) {
            inputText += f.n;
            document.getElementById("ph").value += f.n;
            f.glow = 255;
            this.hits++;
            playSFX("hit");
            break;
          }
        }
      }
      for (let o of p5canvas.birds) {
        if (o === this || o.r < 0.05 || o.hidden) continue;
        const dx = o.pos.x - this.pos.x;
        const dy = o.pos.y - this.pos.y;
        const d = Math.hypot(dx, dy);
        const minD = this.r + o.r;
        if (d > 0 && d < minD) {
          const nx = dx / d;
          const ny = dy / d;
          const overlap = minD - d;
          this.pos.x -= nx * overlap * 0.5;
          this.pos.y -= ny * overlap * 0.5;
          o.pos.x += nx * overlap * 0.5;
          o.pos.y += ny * overlap * 0.5;
          const rvx = this.vel.x - o.vel.x;
          const rvy = this.vel.y - o.vel.y;
          const sep = rvx * nx + rvy * ny;
          if (sep < 0) {
            const j = -(sep * 0.9);
            this.vel.x += j * nx;
            this.vel.y += j * ny;
            o.vel.x -= j * nx;
            o.vel.y -= j * ny;
          }
        }
      }
      this.r *= 0.998;
      if (this.r < 1) this.hidden = true;
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
