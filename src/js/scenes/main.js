import config from '../config/config';

const MAX_JUMP_CYCLES = 15;
const MIN_PLATFORM_WIDTH = 50;

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
        // Add a physics group for all our platforms
        this.platforms = this.physics.add.staticGroup();
        // Setting up the bottom of the level
        const ground = this.add.tileSprite(0, config.canvas.height, config.canvas.width, 38, 'jungle-brown', 7);
        ground.setOrigin(0, 1);
        this.platforms.add(ground);
        // We shrink and offset the bounding box so that the player stands 
        //  on the ground instead of floating above it
        ground.body.setSize(config.canvas.width, 32);
        ground.body.setOffset(0, 6);
        // Generate more random platforms
        this.lastPlatformHeight = config.canvas.height;
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

        this.physics.add.collider(this.player, this.platforms, () => this.handlePlayerLand());
        this.physics.world.setBounds(0, 0 - config.canvas.height, config.canvas.width, config.canvas.height * 2);

        this.cameras.main.setBackgroundColor(0x2288ff);
        this.cameras.main.setBounds(0, 0 - config.canvas.height, config.canvas.width, config.canvas.height * 2);
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
        let platformX, platformWidth, platformY, newPlatform;
        // We're also going to allow the player to move through the platforms,
        //  but still land ON them
        const collisionTest = {
            left: false,
            right: false,
            down: false
        };

        while ( this.lastPlatformHeight > ( 100 - config.canvas.height ) ) {
            // Generate a random position
            platformX = Math.floor(Math.random() * (config.canvas.width - MIN_PLATFORM_WIDTH));
            platformWidth = MIN_PLATFORM_WIDTH + Math.floor(Math.random() * (config.canvas.width - platformX - MIN_PLATFORM_WIDTH));
            platformY = this.lastPlatformHeight - (38 + Math.ceil(Math.random() * 150));
            // Add the sprite
            newPlatform = this.add.tileSprite(platformX, platformY, platformWidth, 38, 'jungle-brown', 7);
            newPlatform.setOrigin(0, 1);
            this.platforms.add(newPlatform);
            newPlatform.body.setSize(platformWidth, 32);
            newPlatform.body.setOffset(0, 6);
            newPlatform.body.checkCollision = Object.assign(newPlatform.body.checkCollision, collisionTest);
            this.lastPlatformHeight = platformY;
        }
    }
};
