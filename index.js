const $body = $("body")
function randomIntFromRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1, y1, x2, y2) {
	const xDist = x2 - x1
	const yDist = y2 - y1

	return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

function trigonometricValues(x1, y1, x2, y2) {
	const c1 = x2 - x1
	const c2 = y2 - y1
	const h = distance(x1, y1, x2, y2)

	return h === 0 ? [1, 0, 0] : [c1 / h, c2 / h, c1 / (c2 || Number.EPSILON)]
}

function orthogonalization(v1, v2, cos, sin) {
	const u = cos * v1 - sin * v2
	const v = sin * v1 + cos * v2

	return [u, v]
}

$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})
var doAnim = true
var simulation1 = function () {
	const canvas = document.querySelector("canvas")
	var c = canvas.getContext("2d")
	canvas.width = $body.prop("clientWidth")
	canvas.height = innerHeight

	var colors = [
		"#A60D0D"
	]

	addEventListener("resize", () => {
		canvas.width = $body.prop("clientWidth")
		canvas.height = innerHeight

		init()
	})
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
			y: y
		}
	}

	Particle.prototype.draw = function (lastPoint) {
		c.beginPath()
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
		c.fillStyle = this.color
		c.fill()
		c.closePath()
	}

	Particle.prototype.update = function () {
		this.omega = 0
		;[this.cos, this.sin, this.tan] = trigonometricValues(circle.x, circle.y, this.x, this.y)
		this.centerdistance = Math.max(1, distance(circle.x, circle.y, this.x, this.y))

		const alpha = Math.pow(circle.radius / this.centerdistance, 2)
		const v = {
			r: circle.U * (1 - alpha) * this.cos,
			theta: -circle.U * (1 + alpha) * this.sin
		}
		;[this.vx, this.vy] = orthogonalization(v.r, v.theta, this.cos, this.sin)
		for (var i = 0; i < vortices.length; i++) {
			this.vorcirculation[i] = vortices[i].localcirculation / Math.max(1, distance(vortices[i].x, vortices[i].y, this.x, this.y))
			;[this.vcos[i], this.vsin[i], this.vtan[i]] = trigonometricValues(vortices[i].x, vortices[i].y, this.x, this.y)
			;[this.vvx[i], this.vvy[i]] = orthogonalization(-0.01 * Math.abs(this.vorcirculation[i]), this.vorcirculation[i], this.vcos[i], this.vsin[i])

			this.vx += this.vvx[i]
			this.vy += this.vvy[i]
		}

		const lastPoint = {
			x: this.x + this.vx,
			y: this.y + this.vy
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
			this.x += circle.U

			this.ratio = (this.x - this.xorigin) / innerWidth
			this.localcirculation = this.circulation * (this.ratio / Math.pow(this.ratio + 0.25, 2))
		}

		this.update()
	}
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
		createVortex = false

		circle = new Circle()
		circle.draw()

		vortices[0] = new Vortex()
		for (let i = 0; i < canvas.width * 0.8; i++) {
			x = randomIntFromRange(-100, 1.1 * canvas.width)
			y = randomIntFromRange(-100, canvas.height + 100)
			particles.push(new Particle(x, y, colors))
		}
	}
	function animate() {
		if (!doAnim) {
			return
		}

		frame = requestAnimationFrame(animate)
		c.fillStyle = "rgba(220, 232, 242, 0.05)"
		c.fillRect(0, 0, canvas.width, canvas.height)

		vortices.forEach(vortex => {
			vortex.update()
		})

		for (var i = 0; i < vortices.length; i++) {
			if (vortices[i].x > 2 * canvas.width) {
				vortices.splice(i, 1)
				i--
				continue
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
		particles.forEach(particle => {
			particle.update()
		})

		circle.draw()
	}
	const control = document.querySelector(".animation-toggle")
	const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
	let paused = reducedMotion.matches
	let inView = true
	let frame = null
	function syncAnimation() {
		cancelAnimationFrame(frame)
		doAnim = !paused && inView && !document.hidden
		control.textContent = paused ? "Play animation" : "Pause animation"
		control.setAttribute("aria-pressed", String(paused))
		if (doAnim) animate()
	}
	control.addEventListener("click", () => { paused = !paused; syncAnimation() })
	reducedMotion.addEventListener("change", event => { paused = event.matches; syncAnimation() })
	document.addEventListener("visibilitychange", syncAnimation)
	new IntersectionObserver(entries => {
		inView = entries[0].isIntersecting
		syncAnimation()
	}).observe(document.querySelector(".section1"))

	init()
	syncAnimation()
}


const tabs = Array.from(document.querySelectorAll('[role="tab"]'))
function selectTab(tab) {
	tabs.forEach(item => {
		const selected = item === tab
		item.setAttribute("aria-selected", String(selected))
		item.tabIndex = selected ? 0 : -1
		item.classList.toggle("active-video", selected)
		document.getElementById(item.getAttribute("aria-controls")).hidden = !selected
	})
}
tabs.forEach((tab, index) => {
	tab.addEventListener("click", () => selectTab(tab))
	tab.addEventListener("keydown", event => {
		let next
		if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length]
		if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length]
		if (event.key === "Home") next = tabs[0]
		if (event.key === "End") next = tabs[tabs.length - 1]
		if (next) { event.preventDefault(); selectTab(next); next.focus() }
	})
})
const sectionLinks = document.querySelectorAll('.navbar a[href^="#section"]')
const navigationObserver = new IntersectionObserver(entries => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			sectionLinks.forEach(link => {
				const active = link.hash === "#" + entry.target.id
				link.classList.toggle("active", active)
				if (active) link.setAttribute("aria-current", "location")
				else link.removeAttribute("aria-current")
			})
		}
	}
}, { rootMargin: "-15% 0px -60% 0px" })
document.querySelectorAll('main > section').forEach(section => navigationObserver.observe(section))
sectionLinks.forEach(link => link.addEventListener("click", () => $(".navbar-collapse").collapse("hide")))
simulation1()
