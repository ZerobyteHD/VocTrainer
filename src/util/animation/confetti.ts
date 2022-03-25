/**
 * @author Nico Opheys
 * @copyright 2022 Nico Opheys
 * @version 25.03.2022
 */

export interface Particle {
    color: string;
    x: number;
    y: number;
    diameter: number;
    tilt: number;
    tiltAngleIncrement: number;
    tiltAngle: number;
}

export default class ConfettiRenderer {
    maxParticleCount: number;
    particleSpeed: number;
    canvas: HTMLCanvasElement;
    particles: Array<Particle>;
    waveAngle: number;
    colors: Array<string>;
    isActive: boolean;
    animationFrame: number;
    visualParent: HTMLElement;

    constructor(_visualParent:HTMLElement, _canvas:HTMLCanvasElement, _maxParticleCount:number = 150, _particleSpeed:number = 2) {
        this.maxParticleCount = _maxParticleCount;
        this.particleSpeed = _particleSpeed;
        this.canvas = _canvas;
        this.particles = [];
        this.waveAngle = 0;
        this.colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
        this.isActive = false;
        this.animationFrame = 0;
        this.visualParent = _visualParent;
    }

    playFor(duration:number) {
        this.start();
        setTimeout(()=>{
            this.stop();
        }, duration);
    }

    resetParticle(particle: Particle, width:number, height:number):Particle {
        particle.color = this.colors[(Math.random() * this.colors.length) | 0];
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = 0;
		return particle;
    }

    positionCanvas() {
        var rect:DOMRect = this.visualParent.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.left = rect.left+"px";
        this.canvas.style.top = rect.top+"px";
        return [rect.width, rect.height];
    }

    start() {
        this.isActive = true;

        var bounds = this.positionCanvas();

        var width = bounds[0];
		var height = bounds[1];

        this.canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none");

        window.addEventListener("resize", () => {
            this.positionCanvas();
        }, true);

        var context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        while (this.particles.length < this.maxParticleCount)
		    this.particles.push(this.resetParticle({color:"", x:0, y:0, diameter:0, tilt:0, tiltAngleIncrement:0, tiltAngle: 0}, width, height));
        if(this.animationFrame === 0) {
            const runAnimation = () => {
                var bounds = this.visualParent.getBoundingClientRect();

				context.clearRect(0, 0, bounds.width, bounds.height);
				if (this.particles.length === 0)
					this.animationFrame = 0;
				else {
					this.updateParticles();
					this.drawParticles(context);
					this.animationFrame = window.requestAnimationFrame(runAnimation);
				}
			}
            runAnimation();
        }
    }

    stop() {
        this.isActive = false;
    }

    drawParticles(context:CanvasRenderingContext2D) {
		var particle:Particle;
		var x:number;
		for (var i = 0; i < this.particles.length; i++) {
			particle = this.particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			context.strokeStyle = particle.color;
			x = particle.x + particle.tilt;
			context.moveTo(x + particle.diameter / 2, particle.y);
			context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
			context.stroke();
		}
	}

    updateParticles() {
		var bounds = this.positionCanvas();

        var width = bounds[0];
		var height = bounds[1];

		var particle:Particle;
		this.waveAngle += 0.01;
		for (var i = 0; i < this.particles.length; i++) {
			particle = this.particles[i];
			if(!this.isActive && particle.y < -15) {
                particle.y = height + 100;
            } else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(this.waveAngle);
				particle.y += (Math.cos(this.waveAngle) + particle.diameter + this.particleSpeed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if(particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if(this.isActive && this.particles.length <= this.maxParticleCount)
					this.resetParticle(particle, width, height);
				else {
					this.particles.splice(i, 1);
					i--;
				}
			}
		}
	}
}