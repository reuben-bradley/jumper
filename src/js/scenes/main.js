import config from '../config/config';

const MAX_JUMP_CYCLES = 15;
// Constants used to generate random platforms
const MIN_PLATFORM_WIDTH = 50;
const MAX_PLATFORM_WIDTH = 250;
const MAX_PLATFORM_X_DISTANCE = 300;
const PLATFORM_Y_DISTANCE_DELTA = 100;
const MIN_PLATFORM_Y_DISTANCE = 90;
const MIN_Y = (-4 * config.canvas.height);
const MIN_PLATFORM_Y = MIN_Y + 100;
const PLATFORM_REDRAW_HEIGHT = -2 * config.canvas.height;

export default class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'main' });
    }

    preload() {
        // Load necessary tiles and sprites
        this.load.spritesheet('character', 'assets/character-sprite.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jungle-brown', 'assets/tile_jungle_ground_brown.png', { frameWidth: 32, frameHeight: 38 });
    }

    create() {
        // Add a physics group for all the random platforms
        this.platforms = this.physics.add.staticGroup();
        this.startingPlatforms = this.physics.add.staticGroup();
        window.startingPlatforms = this.startingPlatforms;
        // Setting up the bottom of the level
        this.ground = this.add.tileSprite(0, config.canvas.height, config.canvas.width, 38, 'jungle-brown', 7);
        this.ground.setOrigin(0, 1);
        this.physics.add.existing(this.ground, true);
        //this.platforms.add(this.ground);
        // We shrink and offset the bounding box so that the player stands 
        //  on the ground instead of floating above it
        this.ground.body.setSize(config.canvas.width, 32);
        this.ground.body.setOffset(0, 6);
        // Generate more random platforms
        this.lastPlatform = this.ground;
        this.randomPlatforms();

        // Set up the player character sprite
        this.player = this.physics.add.sprite(config.canvas.width / 2, config.canvas.height - 60, 'character');
        this.player.setScale(2);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(200);
        this.player.setSize(16, 24).setOffset(8, 4);
        this.player.isJumping = false;
        this.player.activeJump = 0;
        this.player.isAnimationComplete = true;
        this.player.on('animationcomplete', (animation) => { this.handlePlayerAnimationComplete(animation); });

        this.physics.add.collider(this.player, this.ground, () => this.handlePlayerLand());
        this.physics.add.collider(this.player, this.startingPlatforms, () => this.handlePlayerLand());
        this.physics.add.collider(this.player, this.platforms, () => this.handlePlayerLand());
        this.physics.world.setBounds(0, MIN_Y, config.canvas.width, config.canvas.height * 5);

        this.cameras.main.setBackgroundColor(0x2288ff);
        this.cameras.main.setBounds(0, MIN_Y, config.canvas.width, config.canvas.height * 5);
        this.cameras.main.startFollow(this.player, true, 0, 1);

        // Define the character animations
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'stand',
            frames: [ { key: 'character', frame: 0 } ]
        });
        this.anims.create({
            key: 'jumpUp',
            frames: [
                { key: 'character', frame: 4 },
                { key: 'character', frame: 5 }
            ],
            frameRate: 5
        });
        this.anims.create({
            key: 'jumpDown',
            frames: [
                { key: 'character', frame: 6 }
            ],
            frameRate: 1
        });
        this.anims.create({
            key: 'jumpLand',
            frames: [
                { key: 'character', frame: 7, duration: 500 }
            ]
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Handle all player movement updates
        this.updateMovement();
        // Now we handle the "infinite scroll"
        this.updatePlatforms();
    }

    updateMovement() {
        // Handle the left and right movement
        if ( this.cursors.right.isDown ) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            if ( !this.player.isJumping ) {
                this.player.anims.play('walk', true);
            }
        }
        else if ( this.cursors.left.isDown ) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            if ( !this.player.isJumping ) {
                this.player.anims.play('walk', true);
            }
        }
        else {
            this.player.setVelocityX(0);
            if ( !this.player.isJumping && this.player.isAnimationComplete ) {
                this.player.anims.play('stand');
            }
        }

        // Handle jumping
        if ( this.cursors.up.isDown ) {
            if ( this.player.body.touching.down ) {
                this.player.setVelocityY(-160);
                this.player.isJumping = true;
                this.player.activeJump++;
                this.player.anims.play('jumpUp');
            }
            else if ( this.player.activeJump > 0 && this.player.activeJump < MAX_JUMP_CYCLES ) {
                this.player.setVelocityY(this.player.body.velocity.y - 20);
                this.player.activeJump++;
            }
            else {
                this.player.activeJump = 0;
            }
        }
        else {
            if ( this.player.activeJump > 0 ) {
                this.player.activeJump = 0;
            }
        }

        if ( this.player.isJumping && this.player.body.deltaY() > 0 ) {
            this.player.anims.play('jumpDown');
        }
    }
    
    updatePlatforms() {
        // First check if the player is above certain thresholds
        if ( this.player.y < -config.canvas.height && this.startingPlatforms.getLength() > 0 ) {
            // Player has gone more than two canvas heights' high - we no
            //  longer need the starting platforms
            this.startingPlatforms.clear(true);
        }
        else if ( this.player.y < PLATFORM_REDRAW_HEIGHT ) {
            // TODO: Move all platforms down a screen's height, bump the player's position to match,
            //  and remove any platforms below the starting screen height
            // Next we generate new platforms for the new screen height
        }
    }

    handlePlayerLand() {
        if ( this.player.isJumping ) {
            this.player.isJumping = false;
            this.player.anims.play('jumpLand');
            this.player.isAnimationComplete = false;
        }
    }

    handlePlayerAnimationComplete(animation) {
        if ( animation.key == 'jumpLand' ) {
            this.player.isAnimationComplete = true;
        }
    }

    randomPlatforms() {
        // Randomly generate a platform
        let platformX, platformWidth, platformY, newPlatform, platformXRatio, platformXDelta;
        // We're also going to allow the player to move through the platforms,
        //  but still land ON them
        const collisionTest = {
            left: false,
            right: false,
            down: false
        };

        while ( this.lastPlatform.y > ( MIN_PLATFORM_Y ) ) {
            // Generate a random position
            if ( this.lastPlatform.width >= config.canvas.width ) {
                // Previous platform was the ground, new platform can be anywhere
                platformX = Math.floor(Math.random() * (config.canvas.width - MIN_PLATFORM_WIDTH));
            }
            else {
                // Generate a random horizontal position at most MAX_PLATFORM_X_DISTANCE away from the previous platform
                platformXRatio = this.lastPlatform.x / (config.canvas.width - this.lastPlatform.width);
                platformXDelta = (Math.floor(Math.random() * MAX_PLATFORM_X_DISTANCE) - ( platformXRatio * MAX_PLATFORM_X_DISTANCE));
                platformX = this.lastPlatform.x + ( platformXDelta >= 0 ? platformXDelta + this.lastPlatform.width : platformXDelta - this.lastPlatform.width );
            }
            // Ensure that the generated distance is within the canvas
            platformX = Math.max(Math.min(platformX, config.canvas.width), 0);
            platformWidth = Math.min(MIN_PLATFORM_WIDTH + Math.floor(Math.random() * MAX_PLATFORM_WIDTH), config.canvas.width - platformX);
            platformY = this.lastPlatform.y - (MIN_PLATFORM_Y_DISTANCE + Math.ceil(Math.random() * PLATFORM_Y_DISTANCE_DELTA));
            // Add the sprite
            newPlatform = this.add.tileSprite(platformX, platformY, platformWidth, 38, 'jungle-brown', 7);
            newPlatform.setOrigin(0, 1);
            if ( platformY > 0 ) {
                this.startingPlatforms.add(newPlatform);
            }
            else {
                this.platforms.add(newPlatform);
            }
            newPlatform.body.setSize(platformWidth, 32);
            newPlatform.body.setOffset(0, 6);
            newPlatform.body.checkCollision = Object.assign(newPlatform.body.checkCollision, collisionTest);
            this.lastPlatform = newPlatform;
            window.lastPlatform = this.lastPlatform;
        }
    }
};
