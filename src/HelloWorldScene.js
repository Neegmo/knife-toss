import Phaser from 'phaser';

export default class HelloWorldScene extends Phaser.Scene {
    constructor() {
        super('hello-world');
    }

    preload() {
        this.load.image("Log", "Log.png");
        this.load.image("Knife", "Knife.png");
    }

	knifeGroup = []

	create() {
		const logRadius = this.textures.get('Log').getSourceImage().width / 2;
		const knifeForce = new Phaser.Math.Vector2(0, -0.4)

		this.log = this.matter.add.image(540, 700, "Log", null, {
			isStatic: true,
			circleRadius: logRadius,
			label: 'log'
		}).setFriction(0, 0, 0);

		this.highScore = 0
		this.highScoreText = this.add.text(540, 700, `${this.highScore}`, {
			fontSize: "50px",
			strokeThickness: 2,
			stroke: "#ffffff",
			align: "center",
		  }).setOrigin(0.5, 0.5);
	
		this.input.on('pointerdown', () => {
			this.knife = this.matter.add.image(540, 1800, "Knife", null, {label: 'knife'});
			this.knife.setData('hasHitLog', false)
			this.knife.applyForce(knifeForce);
			this.knifeGroup.push(this.knife)
		});

		this.matter.world.on('collisionstart', (event) => {
			event.pairs.forEach((pair) => {
				const { bodyA, bodyB } = pair;
				
				// Check if the log and knife are the pair colliding
				if ((bodyA.label === 'log' && bodyB.label === 'knife') || 
					(bodyA.label === 'knife' && bodyB.label === 'log') ) {
					this.knifeGroup[this.knifeGroup.length-1].setData('hasHitLog', true)
					if(this.knifeGroup[this.knifeGroup.length-1].getData('logRotation') === undefined){

						// @ts-ignore
						this.knifeGroup[this.knifeGroup.length-1].setData('logRotation', this.log.rotation)
					}
					this.updateScore()
				}

				if(bodyA.label === 'knife' && bodyB.label === 'knife') {
					this.highScoreText.text = "KNIFES COLLIDED!"
					this.resetScene();
				}
			});
		});
	}

    update(time, delta) {
		const rotationSpeed = 0.002 * delta;
		// @ts-ignore
    	this.log.rotation += rotationSpeed;
		// console.log(this.log.rotation)

		// this.log.rotation = Math.PI / 2

		this.knifeGroup.forEach(element => {
			if (element.getData('hasHitLog')) {
			// Assuming you want the knife to stick to a certain point on the log
			// Calculate the new position based on the log's rotation
			// @ts-ignore
			const angle = this.log.rotation - element.getData('logRotation') + Math.PI / 2; // The current rotation of the log
			// @ts-ignore
			const logRadius = this.log.displayWidth / 2 + this.knife.displayHeight / 2; // Half the log's width
			const knifeOffsetX = Math.cos(angle) * logRadius;
			const knifeOffsetY = Math.sin(angle) * logRadius;
	
			// Update the knife's position to make it appear stuck in the log
			// @ts-ignore
			element.setPosition(this.log.x + knifeOffsetX, this.log.y + knifeOffsetY);
	
			// Adjust the knife's rotation to be 90 degrees offset from the log's rotation
			// Add Math.PI / 2 to the log's rotation to rotate the knife by 90 degrees
			element.rotation = angle + Math.PI / 2;
			}
		});
		
    }

	updateScore() {
		this.highScore++
		this.highScoreText.text = `${this.highScore}`
	}

	resetScene() {
		this.time.delayedCall(1000, () => {
		  this.scene.restart();
		});
	  }
}
