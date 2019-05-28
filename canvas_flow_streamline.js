// import utils from './utils.js'
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)]
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function trigonometricValues(x1, y1, x2, y2){
  const c1 = x2 - x1;
  const c2 = y2 - y1;
  const h = distance(x1, y1, x2, y2);

  return [c1/h, c2/h, c1/c2];
}

function orthogonalization(v1, v2, cos, sin){
  const u = cos * v1 - sin * v2;
  const v = sin * v1 + cos * v2;

  return [u, v];
}

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

var colors = [
  // '#011C40',
  // '#8AA6BF',
  // '#DCE8F2',
  // '#295773',
  '#A60D0D'
];

// Event Listeners
addEventListener('mousemove', event => {
    this.x = event.clientX
    this.y = event.clientY
    // circle.x = event.clientX
    // circle.y = event.clientY
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init();
});

// Create Circunference
function Circle() {
    this.x = innerWidth / 4;
    this.y = innerHeight / 2;
    this.radius = innerWidth/32;
    this.color = '#011C40';
    this.U = (innerWidth > 1000 ? innerWidth/1000 : 1);

    this.draw = function() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius , 0, Math.PI*2, false);
      c.fillStyle = this.color;
      c.fill();
      c.strokeStyle = '#011C40';
      c.stroke();
      c.closePath();
    }
}

// Create Particles
function Particle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.cos;
    this.sin;
    this.tan;
    this.vx;
    this.vy;
    this.centerdistance;
    this.vcos = [];
    this.vsin = [];
    this.vtan = [];
    this.vvx = [];
    this.vvy = [];
    this.vorcirculation = [];
    this.radius = 1;
    this.color = color;
    this.lastMouse = {x: x, y: y};
}

Particle.prototype.draw = function(lastPoint) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius , 0, Math.PI*2, false);
    // Remember to insert here the function of velocity
    // c.fillStyle = colorArray[Math.floor(Math.random()*colorArray.length)];
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
}

Particle.prototype.update = function() {
    // Move Points over time
    this.omega = 0;

    // Relations to center fo circle
    [this.cos, this.sin, this.tan] = trigonometricValues(circle.x, circle.y, this.x, this.y);
    this.centerdistance = distance(circle.x, circle.y, this.x, this.y);


    const alpha = (Math.pow(circle.radius/this.centerdistance, 2));

    // linear velocity due circunference presence
    const v = {r: circle.U*(1-alpha)*this.cos, theta: -circle.U*(1+alpha)*this.sin};

    // ortogonalization function
    [this.vx, this.vy] = orthogonalization(v.r, v.theta, this.cos, this.sin);

    // angular velocity due vorticity presence
    for (var i = 0; i < vortices.length; i++) {
      this.vorcirculation[i] = vortices[i].localcirculation/distance(vortices[i].x, vortices[i].y, this.x, this.y);
      [this.vcos[i], this.vsin[i], this.vtan[i]] = trigonometricValues(vortices[i].x, vortices[i].y, this.x, this.y);
      [this.vvx[i], this.vvy[i]] = orthogonalization(-0.01 * Math.abs(this.vorcirculation[i]), this.vorcirculation[i], this.vcos[i], this.vsin[i]);

      this.vx += this.vvx[i];
      this.vy += this.vvy[i];
    }

    const lastPoint = {x: this.x + this.vx,
                       y: this.y + this.vy};

    if (lastPoint.x > 1.1*canvas.width) {
      lastPoint.x = 0;
      lastPoint.y = randomIntFromRange(0,  canvas.height);
      this.vy = 0;
    }

    this.x = lastPoint.x;
    this.y = lastPoint.y;
    this.draw(lastPoint);

}

// Create vortices
function Vortex() {
    this.xorigin = circle.x + 0.5*circle.radius;
    this.binar = 2 * (createdVortices % 2) - 1;
    createdVortices += 1;
    this.y = circle.y - circle.radius * this.binar;
    this.x = this.xorigin;
    this.circulation = 8 * circle.radius * this.binar;
    this.ratio;
    this.localcirculation;
    this.create = true;

    this.update = function() {
        // Move Points over time
        this.x += circle.U;

        this.ratio = (this.x - this.xorigin)/innerWidth;
        this.localcirculation = this.circulation * (this.ratio/Math.pow((this.ratio + 0.25), 2));
    }

    this.update();
}

// Implementation
let circle;
let particles;
let vortices;
let x;
let y;


var createVortex = false;
var createdVortices = 0;

function init() {
    particles = [];
    vortices = [];

    circle = new Circle();
    circle.draw();

    vortices[0] = new Vortex();

    // Abruptly creation
    for (let i = 0; i < 2000; i++) {
      const radius = (Math.random() * 2) + 1;
      x = randomIntFromRange(-100,  canvas.width);
      y = randomIntFromRange(-100,  canvas.height + 100);
      particles.push( new Particle(x, y, radius, randomColor(colors)))
    }
    console.log(particles);
}



// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    // c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'rgba(220, 232, 242, 0.05)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Partial creation
    // if (particles.length < 2000) {
    //   x = randomIntFromRange(0,  canvas.width );
    //   y = randomIntFromRange(0,  canvas.height);
    //   particles.push( new Particle(x, y, 1, randomColor(colors)));
    // }

      vortices.forEach(vortex => {
        vortex.update();
     });

     for (var i = 0; i < vortices.length; i++) {
        if (vortices[i].x > 2 * canvas.width) {
          vortices.splice(i, 1);
        }

        // if (vortices[i].create && Math.sign(vortices[i].localcirculation) != vortices[i].binar) {
        if (vortices[i].create && vortices[i].ratio > 0.2) {
          createVortex = true;
          vortices[i].create = false;
          // debugger
        }
     }


     if (createVortex) {
       vortices.push( new Vortex());
       createVortex = false;
     }

    // c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
    particles.forEach(particle => {
     particle.update();
   });

   circle.draw();
}

init();
animate();
