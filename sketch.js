
let boids
let showSep = true, showAli = true, showCoh = true
let backdrop 
let bubbleSkins = []
let fishSkin = []


// Denne class kan tage 3 forskellige values som giver fiskene den valgte farve.
class RGB {
  constructor(r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  // Retunere den gennemsnitlige værdi for alle 3 values.
  average() {
    return (this.r + this.g + this.b)/3
  }

  // Variation er en funktion som tager forskellen fra den højeste værdi mellem to fisk og retunere den forskel.
  variation(color) {
    if (this.r > this.b) {
      return (this.r - color.r)/this.r
    } else {
      return (this.b - color.b)/this.b
    }
  }
}


// Laver en vektor ud fra x og y.
class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  // Retunere længden af vektoren.
  length() {
    return sqrt(this.x * this.x + this.y * this.y)
  }

  // Normalizezere vektoren.
  normalize() {
    let length = this.length()

    this.x = this.x / length
    this.y = this.y / length
  }

  // Tager dot produktet mellem en anden vektor og sig selv.
  dot(vec2) {
    return this.x * vec2.x + this.y * vec2.y
  }

  // Finder vinklen mellem to vektore.
  angle(vec2) {
    return acos(this.dot(vec2) / (this.length() * sqrt(vec2.x * vec2.x + vec2.y * vec2.y)))
  }


}


// Laver den matematiske mod funktion.
function mod(x, y) {
  return x - y*floor(x/y)
}

// Trail holder en liste for hver fisk over den sidste positioner.
class Trail {
  constructor() {
    this.length = 4
    this.coords = []
    this.index = 0

  }

  // Holder en liste oppe med et index som ændre sig afhængigt af hvor mange bobler der er lavet. Boblerne bliver mindre i takt med hvad hvad index er lig med.
  drawTrail(x, y) {
    if (frameCount % floor(Math.random()*5+5) == 0) {
      if (this.coords.length < this.length) {
        this.coords.push(new Vector(x, y))
      } else {
        if (this.index < this.length) {
          this.coords[this.index].x = x+random(-2,2)
          this.coords[this.index].y = y+random(-2,2)
        } else {
          this.index = 0
          this.coords[this.index].x = x+random(-2,2)
          this.coords[this.index].y = y+random(-2,2)
          
        }
        this.index++
      }
    }

    fill(255)
    push()
    imageMode(CENTER)
    noFill()
    stroke(255)
    strokeWeight(1)
    for (let i = 0; i < this.coords.length; i++) {
      let index = mod(i+this.index, this.coords.length)
      this.coords[index].y--
      circle(this.coords[index].x, this.coords[index].y, (floor(i/1.5))*2)
    }
    pop()
  }
}

// Laver en enkelt boid.
class Boid {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.facing = new Vector(random(-1, 1), random(-1, 1))
    this.steeringSpeed = 0.0015
    this.viewRadius = 60
    this.trail = new Trail()
    this.speed = 0.2
    this.genFishSkin()



  }

  // Fordi "tint" commanden var alt for dyr at have kørende på hver fisk laver vi istedet en tmpgraphic som bliver tintet af koden og gemmer graphicen på som en atribut i objektet.
  genFishSkin() {
    this.generateColor()
    let skin = floor(random(0,fishSkin.length))
    let tmpGraphic = createGraphics(fishSkin[skin].width, fishSkin[skin].height)
    tmpGraphic.tint(this.color.r, this.color.g, this.color.b)
    tmpGraphic.image(fishSkin[skin], 0, 0)
    this.tintedImg = tmpGraphic.get()
    tmpGraphic.remove()
  }

  // Denne funktion tvinger fisken til at være over en hvis avg farve for at holde farvene stabile.
  generateColor() {
    while(this.color == null || this.color.average() < 100) {
      this.color = new RGB(random(0, 255), random(0, 255), random(0, 255))
    }
  }

  // seperation sørger for at fiskene ikke kommer for tæt på de andre.
  seperation() {
    let seperationBoost = document.getElementById("inputRange1").value
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)

      if (ds != 0 && ds < this.viewRadius) {
        stroke(255, 0, 0, -(255/this.viewRadius)*ds + 255)

        let direction = this.facing.dot({
          x:(this.x - opBoid.x)-this.facing.x,
          y:-(this.y - opBoid.y)-this.facing.y 
        })


        this.facing.normalize()
        let seperationDistanceForce = (this.viewRadius - ds) * 0.2 * this.color.variation(opBoid.color) < 0.2 ? 1 : 2

        // Rotere view direction til højre og venstre
        if (abs(direction) != direction) {
          let xRotated = this.facing.x * cos(this.steeringSpeed*seperationBoost*seperationDistanceForce) - this.facing.y * sin(this.steeringSpeed*seperationBoost*seperationDistanceForce)
          let yRotated = this.facing.x * sin(this.steeringSpeed*seperationBoost*seperationDistanceForce) + this.facing.y * cos(this.steeringSpeed*seperationBoost*seperationDistanceForce)

          this.facing.x += xRotated
          this.facing.y += yRotated
        } else {
          let xRotated = this.facing.x * cos(-this.steeringSpeed*seperationBoost*seperationDistanceForce) - this.facing.y * sin(-this.steeringSpeed*seperationBoost*seperationDistanceForce)
          let yRotated = this.facing.x * sin(-this.steeringSpeed*seperationBoost*seperationDistanceForce) + this.facing.y * cos(-this.steeringSpeed*seperationBoost*seperationDistanceForce)

          this.facing.x += xRotated
          this.facing.y += yRotated

        }
      }
    }
  }

  // Det gør at fiskene vender nogenlunde samme vej.
  alignment() {
    let alignmentBoost = document.getElementById("inputRange2").value
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)

      if (ds != 0 && ds < this.viewRadius && this.color.variation(opBoid.color) < 0.2) {
        this.facing.x += opBoid.facing.x * this.steeringSpeed * alignmentBoost
        this.facing.y += opBoid.facing.y * this.steeringSpeed * alignmentBoost
      }
    }
  }

  // Den gør at alle fisk vil søge ind mod midten af de fisk der er omkring dem.
  cohesion() {
    let cohesionBoost = document.getElementById("inputRange3").value * 2
    let avgX = 0
    let avgY = 0
    let amount = 0
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)

      if (ds < this.viewRadius && this.color.variation(opBoid.color) < 0.2) {
        avgX += opBoid.x
        avgY += opBoid.y
        amount++
      }
    }

    avgX = avgX / amount
    avgY = avgY / amount
    let direction = this.facing.dot({
      x:(this.y - avgY)-this.facing.y,
      y:-(this.x - avgX)-this.facing.x 
    })

    fill(0)
    stroke(0,255,0)
    
    if (avgX == this.x && avgY == this.y) {
      return
    }

    // Rotere view direction til højre og venstre
    if (abs(direction) == direction) {
      let xRotated = this.facing.x * cos(-this.steeringSpeed * cohesionBoost) - this.facing.y * sin(-this.steeringSpeed * cohesionBoost)
      let yRotated = this.facing.x * sin(-this.steeringSpeed * cohesionBoost) + this.facing.y * cos(-this.steeringSpeed * cohesionBoost)

      this.facing.x += xRotated
      this.facing.y += yRotated
    } else {
      let xRotated = this.facing.x * cos(this.steeringSpeed * cohesionBoost) - this.facing.y * sin(this.steeringSpeed * cohesionBoost)
      let yRotated = this.facing.x * sin(this.steeringSpeed * cohesionBoost) + this.facing.y * cos(this.steeringSpeed * cohesionBoost)

      this.facing.x += xRotated
      this.facing.y += yRotated

    }

  }

  // Tvinger boids væk fra kanter.
  borderRepellant() {
    let repellantForceMultiplier = 1

    // Rotere view direction til højre og venstre
    if (this.facing.x + this.x > width - 300) {
      let borderDistanceForce = (300-(width - (this.facing.x + this.x))) * repellantForceMultiplier
      if (this.facing.y < 0) {
        let xRotated = this.facing.x * cos(-this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(-this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(-this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(-this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  
      } else {
        let xRotated = this.facing.x * cos(this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  

      }
    }


    if (this.facing.x + this.x < 300) {
      let borderDistanceForce = (300-((this.facing.x + this.x))) * repellantForceMultiplier
      if (this.facing.y > 0) {

        let xRotated = this.facing.x * cos(-this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(-this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(-this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(-this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  
      } else {
        let xRotated = this.facing.x * cos(this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  

      }
    }


    if (this.facing.y + this.y > height - 200) {
      let borderDistanceForce = (200-(height - (this.facing.y + this.y))) * repellantForceMultiplier
      if (this.facing.x > 0) {
        let xRotated = this.facing.x * cos(-this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(-this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(-this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(-this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  
      } else {
        let xRotated = this.facing.x * cos(this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  

      }
    }


    if (this.facing.y + this.y < 200) {
      let borderDistanceForce = (200-((this.facing.y + this.y))) * repellantForceMultiplier
      if (this.facing.x < 0) {
        let xRotated = this.facing.x * cos(-this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(-this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(-this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(-this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  
      } else {
        let xRotated = this.facing.x * cos(this.steeringSpeed * borderDistanceForce) - this.facing.y * sin(this.steeringSpeed * borderDistanceForce)
        let yRotated = this.facing.x * sin(this.steeringSpeed * borderDistanceForce) + this.facing.y * cos(this.steeringSpeed * borderDistanceForce)
  
        this.facing.x += xRotated
        this.facing.y += yRotated  

      }
    }
  }

  // Funktionen tagner både trail og selve boiden.
  drawBoids() {
    if (mouseIsPressed && keyIsDown(71)) {
      this.facing.x = mouseX - this.x
      this.facing.y = mouseY - this.y
    }
    
    this.facing.normalize()
    let speedX = this.facing.x * deltaTime
    let speedY = this.facing.y * deltaTime
    this.x += speedX*this.speed
    this.y += speedY*this.speed

    noStroke()
    fill(0)
    this.trail.drawTrail(this.x, this.y)
    stroke(255)

    push()
    translate(this.x, this.y)
    rotate(atan2(this.facing.y, this.facing.x))
    fill(0)
    imageMode(CENTER)
    if (this.facing.x <= 0) {
      scale(1, -1)
      image(this.tintedImg, 0, 0)
    } else {
      image(this.tintedImg, 0, 0)
    }
    stroke(0)
    strokeWeight(1)
    pop()

  }
}

// Red boids er en child class af boid og de svømmer lidt hurtigere end de blå.
class redBoid extends Boid {
  constructor(x, y) {
    super(x, y)
    this.speed = 0.2*1.2
  }

  generateColor() {
    while(this.color == null || this.color.average() < 100) {
      this.color = new RGB(random(100, 255), random(0, 255), random(0, 100))
    }
  }
}

// de blå boids er bedre til at dreje end de røde.
class blueBoid extends Boid {
  constructor(x, y) {
    super(x, y)
    this.steeringSpeed = 0.0015 * 1.2
  }

  generateColor() {
    while(this.color == null || this.color.average() < 100) {
      this.color = new RGB(random(0, 100), random(0, 255), random(100, 255))
    }
  }
}

// Preloader alle fiskeskins og baggrunden
function preload() {
  fishSkin.push(loadImage('Assets/Fish/fish1.png'))
  fishSkin.push(loadImage('Assets/Fish/fish2.png'))
  fishSkin.push(loadImage('Assets/Fish/fish3.png'))
  fishSkin.push(loadImage('Assets/Fish/fish4.png'))
  fishSkin.push(loadImage('Assets/Fish/fish6.png'))
  backdrop = loadImage('Assets/Backdrop/tank.png')
  bubbleSkins.push(loadImage('Assets/Bubbles/bubble1.png'))
  bubbleSkins.push(loadImage('Assets/Bubbles/bubble2.png'))
  bubbleSkins.push(loadImage('Assets/Bubbles/bubble3.png'))
}


function setup() {
  let can = createCanvas(windowWidth, windowHeight);
  can.style("position", "relative")
  boids = []

  // Laver hver 50 røde og blå boids.
  for (let i = 0; i < 50; i++) {
    boids.push(new redBoid(i*10+ 110, 100))
    boids.push(new blueBoid(i*10+ 110, 120))
  }
}

// Køre alle regler for alle boids samt tegner dem.
function draw() {
  if (deltaTime > 100) {
    deltaTime = 0
  }
  background(220);
  image(backdrop, 0, 0)
  


  if (showSep) {
    for (let i = 0; i < boids.length; i++) {
      boids[i].seperation()
    }
  }

  if (showAli) {
    for (let i = 0; i < boids.length; i++) {
      boids[i].alignment()
    }
  }

  if (showCoh) {
    for (let i = 0; i < boids.length; i++) {
      boids[i].cohesion()
    }
  }

  for (let i = 0; i < boids.length; i++) {
    boids[i].borderRepellant()
  }


  for (let i = 0; i < boids.length; i++) {
    boids[i].drawBoids()
  }

  fill(255)
  stroke(0)
  strokeWeight(2)
  rect(5,5,160,98,10,10,10,10)

  fill(0)
  textAlign(LEFT)
  textSize(20)
  noStroke()
  text("Seperation: " + showSep, 10, 30)
  text("Aligment: " + showAli, 10, 30 + 30)
  text("Cohesion: " + showCoh, 10, 30 + 30*2)

}

// Finder distancen mellem to boids.
function distance(boid1, boid2) {
  return sqrt((boid1.x - boid2.x)**2 + (boid1.y - boid2.y)**2)
}

// s, a og c controllere hver især de tre regler.
function keyPressed() {
  if (key == "s") {
    showSep = !showSep
  }
  if (key == "a") {
    showAli = !showAli
  }
  if (key == "c") {
    showCoh = !showCoh
  }
}

// En funktion som laver vores sliders i bunden af skærmen.
const inputRange1 = document.getElementById("inputRange1");
const inputRange2 = document.getElementById("inputRange2");
const inputRange3 = document.getElementById("inputRange3");
const activeColor = "#568096";
const inactiveColor = "#999999";

inputRange1.addEventListener("input", function() {
  const ratio = (this.value - this.min) / (this.max - this.min) * 100;
  this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
});
inputRange2.addEventListener("input", function() {
  const ratio = (this.value - this.min) / (this.max - this.min) * 100;
  this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
});
inputRange3.addEventListener("input", function() {
  const ratio = (this.value - this.min) / (this.max - this.min) * 100;
  this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
});