// --------- DOM objects --------- //
var $body = $("body")
var $asection1 = $("a[rel=section1]")
var $asection2 = $("a[rel=section2]")
var $asection3 = $("a[rel=section3]")
// var $asection4 = $('a[rel=section4]');
var $asection5 = $("a[rel=section5]")
var $navlink = $(".nav-link")
var $learnmore = $(".learn-more")
var $icon = $(".icon")
var $learnvon = $(".learnVon")
var $expertises = $(".expertises")
var $contact = $("#contact")

// --------- Important Functions Used --------- //
function randomIntFromRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

// function randomColor(colors) {
//   return colors[Math.floor(Math.random() * colors.length)]
// }

function distance(x1, y1, x2, y2) {
	const xDist = x2 - x1
	const yDist = y2 - y1

	return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function trigonometricValues(x1, y1, x2, y2) {
	const c1 = x2 - x1
	const c2 = y2 - y1
	const h = distance(x1, y1, x2, y2)

	return [c1 / h, c2 / h, c1 / c2]
}

function orthogonalization(v1, v2, cos, sin) {
	const u = cos * v1 - sin * v2
	const v = sin * v1 + cos * v2

	return [u, v]
}

// --------- Enabling tooltip --------- //

$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})

// --------- Begining of Simulation 1 --------- //
var doAnim = true
var simulation1 = function () {
	const canvas = document.querySelector("canvas")
	var c = canvas.getContext("2d")
	canvas.width = $body.prop("clientWidth")
	canvas.height = innerHeight

	// canvas.width = innerWidth
	// canvas.height = innerHeight

	const mouse = {
		x: canvas.width / 2,
		y: canvas.height / 2,
	}

	var colors = [
		// '#011C40',
		// '#8AA6BF',
		// '#DCE8F2',
		// '#295773',
		"#A60D0D",
	]

	// Event Listeners
	addEventListener("mousemove", event => {
		this.x = event.clientX
		this.y = event.clientY
		// circle.x = event.clientX
		// circle.y = event.clientY
	})

	addEventListener("resize", () => {
		canvas.width = $body.prop("clientWidth")
		canvas.height = innerHeight

		init()
	})

	// Create Circunference
	function Circle() {
		if (innerWidth > 992) {
			this.x = innerWidth / 4
			this.y = innerHeight / 2
			this.radius = 50
			radius = 1
			this.U = innerWidth / 1000
		} else {
			this.x = innerWidth / 4
			this.y = (3 * innerHeight) / 4
			this.radius = 75
			radius = 2
			this.U = 1
		}

		this.color = "#011C40"

		this.draw = function () {
			c.beginPath()
			c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
			c.fillStyle = this.color
			c.fill()
			c.strokeStyle = "#011C40"
			c.stroke()
			c.closePath()
		}
	}

	// Create Particles
	function Particle(x, y, color) {
		this.x = x
		this.y = y
		this.cos
		this.sin
		this.tan
		this.vx
		this.vy
		this.centerdistance
		this.vcos = []
		this.vsin = []
		this.vtan = []
		this.vvx = []
		this.vvy = []
		this.vorcirculation = []
		this.radius = radius
		this.color = color
		this.lastMouse = {
			x: x,
			y: y,
		}
	}

	Particle.prototype.draw = function (lastPoint) {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		// Remember to insert here the function of velocity
		// c.fillStyle = colorArray[Math.floor(Math.random()*colorArray.length)];
		c.fillStyle = this.color
		c.fill()
		c.closePath()
	}

	Particle.prototype.update = function () {
		// Move Points over time
		this.omega = 0

		// Relations to center fo circle
		;[this.cos, this.sin, this.tan] = trigonometricValues(circle.x, circle.y, this.x, this.y)
		this.centerdistance = distance(circle.x, circle.y, this.x, this.y)

		const alpha = Math.pow(circle.radius / this.centerdistance, 2)

		// linear velocity due circunference presence
		const v = {
			r: circle.U * (1 - alpha) * this.cos,
			theta: -circle.U * (1 + alpha) * this.sin,
		}

		// ortogonalization function
		;[this.vx, this.vy] = orthogonalization(v.r, v.theta, this.cos, this.sin)

		// angular velocity due vorticity presence
		for (var i = 0; i < vortices.length; i++) {
			this.vorcirculation[i] = vortices[i].localcirculation / distance(vortices[i].x, vortices[i].y, this.x, this.y)
			;[this.vcos[i], this.vsin[i], this.vtan[i]] = trigonometricValues(vortices[i].x, vortices[i].y, this.x, this.y)
			;[this.vvx[i], this.vvy[i]] = orthogonalization(-0.01 * Math.abs(this.vorcirculation[i]), this.vorcirculation[i], this.vcos[i], this.vsin[i])

			this.vx += this.vvx[i]
			this.vy += this.vvy[i]
		}

		const lastPoint = {
			x: this.x + this.vx,
			y: this.y + this.vy,
		}

		if (lastPoint.x > 1.1 * canvas.width) {
			lastPoint.x = 0
			lastPoint.y = randomIntFromRange(0, canvas.height)
			this.vy = 0
		}

		this.x = lastPoint.x
		this.y = lastPoint.y
		this.draw(lastPoint)
	}

	// Create vortices
	function Vortex() {
		this.xorigin = circle.x + 0.5 * circle.radius
		this.binar = 2 * (createdVortices % 2) - 1
		createdVortices += 1
		this.y = circle.y - circle.radius * this.binar
		this.x = this.xorigin
		this.circulation = 8 * circle.radius * this.binar
		this.ratio
		this.localcirculation
		this.create = true

		this.update = function () {
			// Move Points over time
			this.x += circle.U

			this.ratio = (this.x - this.xorigin) / innerWidth
			this.localcirculation = this.circulation * (this.ratio / Math.pow(this.ratio + 0.25, 2))
		}

		this.update()
	}

	// Implementation
	let circle
	let particles
	let vortices
	let x
	let y
	let radius

	var createVortex = false
	var createdVortices = 0

	function init() {
		particles = []
		vortices = []

		circle = new Circle()
		circle.draw()

		vortices[0] = new Vortex()

		// Abruptly creation particles
		for (let i = 0; i < canvas.width * 0.8; i++) {
			x = randomIntFromRange(-100, 1.1 * canvas.width)
			y = randomIntFromRange(-100, canvas.height + 100)
			particles.push(new Particle(x, y, colors))
		}
	}

	// Animation Loop
	function animate() {
		// Decide if keeps the animation
		if (!doAnim) {
			c = null
			return
		}

		requestAnimationFrame(animate)
		// c.clearRect(0, 0, canvas.width, canvas.height)
		c.fillStyle = "rgba(220, 232, 242, 0.05)"
		c.fillRect(0, 0, canvas.width, canvas.height)

		vortices.forEach(vortex => {
			vortex.update()
		})

		for (var i = 0; i < vortices.length; i++) {
			if (vortices[i].x > 2 * canvas.width) {
				vortices.splice(i, 1)
			}

			if (vortices[i].create && vortices[i].ratio > 0.2) {
				createVortex = true
				vortices[i].create = false
			}
		}

		if (createVortex) {
			vortices.push(new Vortex())
			createVortex = false
		}

		// c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
		particles.forEach(particle => {
			particle.update()
		})

		circle.draw()
	}

	// Way point to stop and play over the simulation
	var waypoint = new Waypoint({
		element: document.getElementsByClassName("section2"),
		handler: function (direction) {
			if (direction == "down") {
				doAnim = false
			} else {
				c = canvas.getContext("2d")
				doAnim = true
				init()
				animate()
				document.getElementById("header").classList.remove("fixed-bar")

				// change active bar
				$("a.active").removeClass("active")
				$asection1.addClass("active")
			}
		},
		offset: 200,
	})

	// stop animation by clicking button
	$(".play-pause").on("click", function () {
		$(".play-pause.invisible").removeClass("invisible")
		$(this).addClass("invisible")

		if (doAnim) {
			doAnim = false
		} else {
			c = canvas.getContext("2d")
			doAnim = true
			// init();
			animate()
		}
	})

	init()
	animate()
}

// open pdf function
function openPDF() {
	// window.open("https://raw.githubusercontent.com/wiki/shiplab/vesseljs/files/open_6_DOF.pdf")
	window.open("Felipe_CV_Software_Engineer.pdf")
}

var simulationbar = function () {
	var waypoint = new Waypoint({
		element: document.getElementsByClassName("section2"),
		handler: function () {
			document.getElementById("header").classList.add("fixed-bar")
			$("a.active").removeClass("active")
			$asection2.addClass("active")
			document.getElementById("waypoint-1-1").classList.add("run-bar-1-1")
			document.getElementById("waypoint-1-2").classList.add("run-bar-1-2")
			document.getElementById("waypoint-1-3").classList.add("run-bar-1-3")
			document.getElementById("waypoint-1-4").classList.add("run-bar-1-4")
			document.getElementById("waypoint-1-5").classList.add("run-bar-1-5")
			document.getElementById("waypoint-2-1").classList.add("run-bar-2-1")
			document.getElementById("waypoint-2-2").classList.add("run-bar-2-2")
			document.getElementById("waypoint-2-3").classList.add("run-bar-2-3")
			document.getElementById("waypoint-2-4").classList.add("run-bar-2-4")
			document.getElementById("waypoint-2-5").classList.add("run-bar-2-5")
		},
		offset: "10%",
	})

	var waypoint = new Waypoint({
		element: document.getElementsByClassName("section3"),
		handler: function () {
			$("a.active").removeClass("active")
			$asection3.addClass("active")
		},
	})

	// var waypoint = new Waypoint({
	// 	element: document.getElementsByClassName("section4"),
	// 	handler: function () {
	// 		$("a.active").removeClass("active")
	// 		$asection4.addClass("active")
	// 	},
	// })

	var waypoint = new Waypoint({
		element: document.getElementsByClassName("section5"),
		handler: function () {
			$("a.active").removeClass("active")
			$asection5.addClass("active")
		},
		offset: "25%",
	})
}

var simulation2 = function () {
	// create a tab explanation point
	function showTooltip(x, y, contents) {
		$('<div id="tooltip">' + contents + "</div>")
			.css({
				position: "absolute",
				display: "none",
				top: y + 5,
				left: x + 5,
				border: " x solid #fdd",
				padding: "2px",
				"background-color": "#fee",
				opacity: 0.8,
			})
			.appendTo("body")
			.fadeIn(200)
	}

	var canada = [
		[2016, 158046],
		[2015, 154620],
		[2014, 149405],
		[2013, 135353],
		[2012, 124862],
		[2011, 114482],
		[2010, 108045],
		[2009, 101446],
		[2008, 107675],
		[2007, 107094],
		[2006, 113002],
	]

	var china = [
		[2016, 199685],
		[2015, 214556],
		[2014, 211429],
		[2013, 209918],
		[2012, 207478],
		[2011, 202875],
		[2010, 203014],
		[2009, 189490],
		[2008, 190440],
		[2007, 186318],
		[2006, 184766],
	]

	var iran = [
		[2016, 187209],
		[2015, 139414],
		[2014, 139707],
		[2013, 140612],
		[2012, 142127],
		[2011, 194613],
		[2010, 196548],
		[2009, 195799],
		[2008, 200789],
		[2007, 204583],
		[2006, 203400],
	]

	var iraq = [
		[2016, 220339],
		[2015, 171889],
		[2014, 152906],
		[2013, 146340],
		[2012, 144902],
		[2011, 130575],
		[2010, 116307],
		[2009, 115221],
		[2008, 112509],
		[2007, 93174],
		[2006, 96429],
	]

	var kwait = [
		[2016, 149758],
		[2015, 144919],
		[2014, 145319],
		[2013, 148110],
		[2012, 148833],
		[2011, 132571],
		[2010, 115290],
		[2009, 112772],
		[2008, 133801],
		[2007, 128376],
		[2006, 131865],
	]

	var russia = [
		[2016, 149758],
		[2015, 144919],
		[2014, 145319],
		[2013, 148110],
		[2012, 148833],
		[2011, 132571],
		[2010, 115290],
		[2009, 112772],
		[2008, 133801],
		[2007, 128376],
		[2006, 131865],
	]

	var saudiarabia = [
		[2016, 523010],
		[2015, 508237],
		[2014, 484110],
		[2013, 480352],
		[2012, 487969],
		[2011, 464088],
		[2010, 406992],
		[2009, 407930],
		[2008, 459694],
		[2007, 439406],
		[2006, 458951],
	]

	var uea = [
		[2016, 154189],
		[2015, 148838],
		[2014, 139113],
		[2013, 139278],
		[2012, 132469],
		[2011, 127675],
		[2010, 115724],
		[2009, 111641],
		[2008, 123937],
		[2007, 121523],
		[2006, 123397],
	]

	var usa = [
		[2016, 438053],
		[2015, 464056],
		[2014, 431745],
		[2013, 368266],
		[2012, 321319],
		[2011, 278330],
		[2010, 270234],
		[2009, 264405],
		[2008, 244840],
		[2007, 249791],
		[2006, 251657],
	]

	// introduce to plot
	data = [
		{
			data: canada,
			label: "Canada",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
			color: "#2f9a4e",
		},
		{
			data: china,
			label: "China",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: iran,
			label: "Iran",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: iraq,
			label: "Iraq",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: russia,
			label: "Russia",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: saudiarabia,
			label: "Saudi Arabia",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: uea,
			label: "UEA",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: saudiarabia,
			label: "Saudi Arabia",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: usa,
			label: "USA",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
		{
			data: russia,
			label: "Russia",
			lines: {
				show: true,
				width: 0.5,
			},
			points: {
				show: true,
			},
		},
	]
	options = {
		legend: {
			position: "nw",
		},
		grid: {
			clickable: true,
			hoverable: true,
		},
		axisLabels: {
			show: true,
		},
		xaxes: [
			{
				axisLabel: "Year",
			},
		],
		yaxes: [
			{
				position: "left",
				axisLabel: "Oil Production (Metric tons, thousand)",
			},
		],
	}

	// plot chart
	// chart1 = $.plot($("#placeholder"), data, options)

	// highlight one element in chart
	$("#placeholder").bind("plothover", function (event, pos, item) {
		$("#tooltip").remove()
		if (item) {
			// console.log(item.datapoint[0]);
			var x = item.datapoint[0].toFixed(0),
				y = item.datapoint[1].toFixed(0)
			showTooltip(item.pageX, item.pageY, item.series.label + ": Year = " + x + "; Prod. = " + y + " m.")
		}
	})
}

$(document).ready(function () {
	// Bind to the resize event of the window object
	$(window)
		.on("resize", function () {
			if (innerWidth < 992) {
				$contact.addClass("col-12")
				$contact.removeClass("col-6")
			} else {
				$contact.addClass("col-6")
				$contact.removeClass("col-12")
			}
		})
		.resize()

	$navlink.on("click", function () {
		//verify witch panel to show
		var panelToShow = $(this).attr("rel")

		if (panelToShow.split("-")[0] == "video") {
			$(".expertises").removeClass("active-video")
			$(this).addClass("active-video")
			$(".card-body").children().addClass("invisible")
			$("." + panelToShow).removeClass("invisible")
		} else {
			// Scroll down
			$("html, body").animate(
				{
					scrollTop: $("." + panelToShow).offset().top,
				},
				1500,
				"swing"
			)
		}
	})

	$learnmore.on("click", function () {
		// Scroll down
		$("html, body").animate(
			{
				scrollTop: $(".section2").offset().top,
			},
			1500,
			"swing"
		)
	})

	$icon.on("click", function () {
		$(".play-pause.invisible").removeClass("invisible")
		$(this).addClass("invisible")

		if (doAnim) {
			doAnim = false
		} else {
			c = canvas.getContext("2d")
			doAnim = true
			// init();
			animate()
		}
	})

	$learnvon.hover(
		function () {
			$(this).find("path").css("fill", "#011C40")
		},
		function () {
			$(this).find("path").css("fill", "#DCE8F2")
		}
	)
})

simulation1()
simulation2()
simulationbar()
// menufunction();
