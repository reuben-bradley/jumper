
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
        const platforms = this.physics.add.staticGroup();
        // Slightly counter-intuitive, but we set the collision bounds here ...
        const ground = this.add.tileSprite(0, 600, 800, 30, 'jungle-brown', 7);
        ground.setOrigin(0, 1);
        // ... and then the actual render size here
        ground.setSize(800, 38);
        platforms.add(ground);

        this.cameras.main.setBackgroundColor(0x2288ff);

        // Set up the player character sprite
        this.player = this.physics.add.sprite(100, 540, 'character');
        this.player.setScale(2);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(200);
        this.player.isJumping = false;
        this.player.activeJump = 0;
        this.player.isAnimationComplete = true;
        this.player.on('animationcomplete', (animation) => { this.handlePlayerAnimationComplete(animation); });

        this.physics.add.collider(this.player, platforms, () => this.handlePlayerLand());

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
            else if ( this.player.activeJump > 0 && this.player.activeJump < 10 ) {
                this.player.setVelocityY(this.player.body.velocity.y - 30);
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
};
