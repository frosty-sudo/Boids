
let boids
let showSep = true, showAli = true, showCoh = true


class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  length() {
    return sqrt(this.x * this.x + this.y * this.y)
  }

  normalize() {
    let length = this.length()

    this.x = this.x / length
    this.y = this.y / length
  }

  dot(vec2) {
    return this.x * vec2.x + this.y * vec2.y
  }

  angle(vec2) {
    return acos(this.dot(vec2) / (this.length() * sqrt(vec2.x * vec2.x + vec2.y * vec2.y)))
  }


}


class Boid {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.facing = new Vector(1,1)
    this.steeringSpeed = 0.0015
    this.viewRadius = 60
    this.color = random()
  }


  seperation() {
    let seperationBoost = document.getElementById("inputRange1").value
    // console.log(this.facing.dot({
    //   x:(this.y-mouseY)-this.facing.y,
    //   y:-(this.x-mouseX)-this.facing.x 
    // }))
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)

      if (ds != 0 && ds < this.viewRadius) {
        stroke(255, 0, 0, -(255/this.viewRadius)*ds + 255)
        // line(this.x, this.y, opBoid.x, opBoid.y)

        let direction = this.facing.dot({
          x:(this.y - opBoid.y)-this.facing.y,
          y:-(this.x - opBoid.x)-this.facing.x 
        })

        this.facing.normalize()

        let seperationDistanceForce = (this.viewRadius - ds) * 0.2

        if (abs(direction) != direction) {
          let xRotated = this.facing.x * cos(this.steeringSpeed*seperationBoost*seperationDistanceForce) - this.facing.y * sin(this.steeringSpeed*seperationBoost*seperationDistanceForce)
          let yRotated = this.facing.x * sin(this.steeringSpeed*seperationBoost*seperationDistanceForce) + this.facing.y * cos(this.steeringSpeed*seperationBoost*seperationDistanceForce)

          // line(this.x, this.y, xRotated * -20 + this.x, yRotated * -20 + this.y)
          this.facing.x += xRotated
          this.facing.y += yRotated
        } else {
          let xRotated = this.facing.x * cos(-this.steeringSpeed*seperationBoost*seperationDistanceForce) - this.facing.y * sin(-this.steeringSpeed*seperationBoost*seperationDistanceForce)
          let yRotated = this.facing.x * sin(-this.steeringSpeed*seperationBoost*seperationDistanceForce) + this.facing.y * cos(-this.steeringSpeed*seperationBoost*seperationDistanceForce)

          // line(this.x, this.y, xRotated * -20 + this.x, yRotated * -20 + this.y)
          this.facing.x += xRotated
          this.facing.y += yRotated

        }
      }
    }
  }

  alignment() {
    let alignmentBoost = document.getElementById("inputRange2").value
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)

      if (ds != 0 && ds < this.viewRadius) {
        this.facing.x += opBoid.facing.x * this.steeringSpeed * alignmentBoost
        this.facing.y += opBoid.facing.y * this.steeringSpeed * alignmentBoost
      }
    }
  }

  cohesion() {
    let cohesionBoost = document.getElementById("inputRange3").value
    let avgX = 0
    let avgY = 0
    let amount = 0
    for (let i = 0; i < boids.length; i++) {
      let opBoid = boids[i]
      let ds = distance(this, opBoid)


      if (/* ds != 0 &&  */ds < this.viewRadius) {
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
    // circle(avgX, avgY, 10)
    
    if (avgX == this.x && avgY == this.y) {
      return
    }
    if (abs(direction) != direction) {
      let xRotated = this.facing.x * cos(-this.steeringSpeed * cohesionBoost) - this.facing.y * sin(-this.steeringSpeed * cohesionBoost)
      let yRotated = this.facing.x * sin(-this.steeringSpeed * cohesionBoost) + this.facing.y * cos(-this.steeringSpeed * cohesionBoost)

      // line(this.x, this.y, xRotated * -20 + this.x, yRotated * -20 + this.y)
      this.facing.x += xRotated
      this.facing.y += yRotated
    } else {
      let xRotated = this.facing.x * cos(this.steeringSpeed * cohesionBoost) - this.facing.y * sin(this.steeringSpeed * cohesionBoost)
      let yRotated = this.facing.x * sin(this.steeringSpeed * cohesionBoost) + this.facing.y * cos(this.steeringSpeed * cohesionBoost)

      // line(this.x, this.y, xRotated * -20 + this.x, yRotated * -20 + this.y)
      this.facing.x += xRotated
      this.facing.y += yRotated

    }

  }


  draw() {
    // if (mouseIsPressed) {

    //   this.facing.x = this.x - mouseX
    //   this.facing.y = this.y - mouseY
    // }
    
    

    this.facing.normalize()

    let speedX = this.facing.x * deltaTime
    let speedY = this.facing.y * deltaTime

    let speed = 0.2

    if (this.x < 0 && abs(this.facing.x) == this.facing.x) {
      // this.x = 0
      // this.facing.x *= -1
      this.x = width
      // this.y = height - this.y
    }
    if (this.y < 0 && abs(this.facing.y) == this.facing.y) {
      // this.y = 0
      // this.facing.y *= -1
      this.y = height
    }
    if (this.x > width && abs(this.facing.x) != this.facing.x) {
      // this.x = width
      // this.facing.x *= -1
      this.x = 0
    }
    if (this.y > height && abs(this.facing.y) != this.facing.y) {
      // this.y = height
      // this.facing.y *= -1
      this.y = 0
    }

    this.x -= speedX*speed
    this.y -= speedY*speed
    noStroke()
    fill(0)
    push()
    translate(this.x, this.y)
    rotate(atan2(this.facing.y, this.facing.x)+HALF_PI)
    triangle(0, 10, -5, -2, +5, -2)
    stroke(0)
    strokeWeight(1)
    // line(0,0, 0, 100)
    pop()

  }
}


function setup() {
  let can = createCanvas(windowWidth, windowHeight);
  can.style("position", "relative")
  boids = []

  for (let i = 0; i < 100; i++) {
    boids.push(new Boid(i*10+ 110, 100))
    // boids.push(new Boid(i*10+ 130, 100))
    // boids.push(new Boid(i*10+ 115, 115))
  }
}

function draw() {
  if (deltaTime > 100) {
    deltaTime = 0
  }
  background(220);

  for (let i = 0; i < boids.length; i++) {
    boids[i].draw()
  }

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

  textAlign(LEFT)
  textSize(20)
  noStroke()
  text("Seperation: " + showSep, 10, 30)
  text("Aligment: " + showAli, 10, 30 + 30)
  text("Cohesion: " + showCoh, 10, 30 + 30*2)

}


function distance(boid1, boid2) {
  return sqrt((boid1.x - boid2.x)**2 + (boid1.y - boid2.y)**2)
}


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