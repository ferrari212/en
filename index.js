// --------- Important Functions Used --------- //
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// function randomColor(colors) {
//   return colors[Math.floor(Math.random() * colors.length)]
// }

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function trigonometricValues(x1, y1, x2, y2) {
  const c1 = x2 - x1;
  const c2 = y2 - y1;
  const h = distance(x1, y1, x2, y2);

  return [c1 / h, c2 / h, c1 / c2];
}

function orthogonalization(v1, v2, cos, sin) {
  const u = cos * v1 - sin * v2;
  const v = sin * v1 + cos * v2;

  return [u, v];
}



// --------- Begining of Simulation 1 --------- //
var doAnim = true;
var simulation1 = function() {

  const canvas = document.querySelector('canvas')
  var c = canvas.getContext('2d')
  canvas.width = $("body").prop("clientWidth");
  canvas.height = innerHeight;

  // canvas.width = innerWidth
  // canvas.height = innerHeight

  const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
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
    canvas.width = $("body").prop("clientWidth");
    canvas.height = innerHeight

    init();
  });

  // Create Circunference
  function Circle() {
    this.x = innerWidth / 4;
    this.y = innerHeight / 2;
    this.radius = innerWidth / 32;
    this.color = '#011C40';
    this.U = (innerWidth > 1000 ? innerWidth / 1000 : 1);

    this.draw = function() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
    this.lastMouse = {
      x: x,
      y: y
    };
  }

  Particle.prototype.draw = function(lastPoint) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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


    const alpha = (Math.pow(circle.radius / this.centerdistance, 2));

    // linear velocity due circunference presence
    const v = {
      r: circle.U * (1 - alpha) * this.cos,
      theta: -circle.U * (1 + alpha) * this.sin
    };

    // ortogonalization function
    [this.vx, this.vy] = orthogonalization(v.r, v.theta, this.cos, this.sin);

    // angular velocity due vorticity presence
    for (var i = 0; i < vortices.length; i++) {
      this.vorcirculation[i] = vortices[i].localcirculation / distance(vortices[i].x, vortices[i].y, this.x, this.y);
      [this.vcos[i], this.vsin[i], this.vtan[i]] = trigonometricValues(vortices[i].x, vortices[i].y, this.x, this.y);
      [this.vvx[i], this.vvy[i]] = orthogonalization(-0.01 * Math.abs(this.vorcirculation[i]), this.vorcirculation[i], this.vcos[i], this.vsin[i]);

      this.vx += this.vvx[i];
      this.vy += this.vvy[i];
    }

    const lastPoint = {
      x: this.x + this.vx,
      y: this.y + this.vy
    };

    if (lastPoint.x > 1.1 * canvas.width) {
      lastPoint.x = 0;
      lastPoint.y = randomIntFromRange(0, canvas.height);
      this.vy = 0;
    }

    this.x = lastPoint.x;
    this.y = lastPoint.y;
    this.draw(lastPoint);

  }

  // Create vortices
  function Vortex() {
    this.xorigin = circle.x + 0.5 * circle.radius;
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

      this.ratio = (this.x - this.xorigin) / innerWidth;
      this.localcirculation = this.circulation * (this.ratio / Math.pow((this.ratio + 0.25), 2));
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
    for (let i = 0; i < canvas.width; i++) {
      const radius = (Math.random() * 2) + 1;
      x = randomIntFromRange(-100, canvas.width);
      y = randomIntFromRange(-100, canvas.height + 100);
      particles.push(new Particle(x, y, radius, colors))
    }
  }



  // Animation Loop
  function animate() {

    // Decide if keeps the animation
    if (!doAnim) {
      c = null;
      return;
    }

    requestAnimationFrame(animate)
    // c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'rgba(220, 232, 242, 0.05)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    vortices.forEach(vortex => {
      vortex.update();
    });

    for (var i = 0; i < vortices.length; i++) {
      if (vortices[i].x > 2 * canvas.width) {
        vortices.splice(i, 1);
      }

      if (vortices[i].create && vortices[i].ratio > 0.2) {
        createVortex = true;
        vortices[i].create = false;
      }
    }


    if (createVortex) {
      vortices.push(new Vortex());
      createVortex = false;
    }

    // c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
    particles.forEach(particle => {
      particle.update();
    });

    circle.draw();
  }

  // Way point to stop and play over the simulation
  var waypoint = new Waypoint({
    element: document.getElementsByClassName('section2'),
    handler: function(direction) {
      if (direction == 'down') {
        doAnim = false;
      } else {
        c = canvas.getContext('2d')
        doAnim = true;
        init();
        animate();
        document.getElementById('header').classList.remove('fixed-bar');

        // change active bar
        $('a.active').removeClass("active");
        $('a[rel=section1]').addClass("active");
      }
    },
    offset: 200
  });


  init();
  animate();
}

var simulationbar = function() {
  var waypoint = new Waypoint({
    element: document.getElementsByClassName('section2'),
    handler: function() {
      document.getElementById('header').classList.add('fixed-bar');
      $('a.active').removeClass("active");
      $('a[rel=section2]').addClass("active");
      document.getElementById('waypoint-1-1').classList.add('run-bar-1-1');
      document.getElementById('waypoint-1-2').classList.add('run-bar-1-2');
      document.getElementById('waypoint-1-3').classList.add('run-bar-1-3');
      document.getElementById('waypoint-1-4').classList.add('run-bar-1-4');
      document.getElementById('waypoint-1-5').classList.add('run-bar-1-5');
      document.getElementById('waypoint-2-1').classList.add('run-bar-2-1');
      document.getElementById('waypoint-2-2').classList.add('run-bar-2-2');
      document.getElementById('waypoint-2-3').classList.add('run-bar-2-3');
      document.getElementById('waypoint-2-4').classList.add('run-bar-2-4');
      document.getElementById('waypoint-2-5').classList.add('run-bar-2-5');
    }
  });

  var waypoint = new Waypoint({
    element: document.getElementsByClassName('section3'),
    handler: function() {
      $('a.active').removeClass("active");
      $('a[rel=section3]').addClass("active");
    }
  });

  var waypoint = new Waypoint({
    element: document.getElementsByClassName('section4'),
    handler: function() {
      $('a.active').removeClass("active");
      $('a[rel=section4]').addClass("active");
    }
  });

  var waypoint = new Waypoint({
    element: document.getElementsByClassName('section5'),
    handler: function() {
      $('a.active').removeClass("active");
      $('a[rel=section5]').addClass("active");
    },
    offset: '25%'
  });
}

$(document).ready(function() {
  $('.nav-link')
    .on("click", function() {
      //verify witch panel to show
      var panelToShow = $(this).attr("rel");

      // Scroll down
      $('html, body').animate({
        'scrollTop': $('.' + panelToShow).offset().top
      }, 1500, 'swing');
    });

  $('.learn-more')
    .on("click", function() {

      // Scroll down
      $('html, body').animate({
        'scrollTop': $('.section2').offset().top
      }, 1500, 'swing');
    });
});


simulation1();
simulationbar();
// menufunction();
