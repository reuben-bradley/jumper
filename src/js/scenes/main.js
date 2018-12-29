
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

        this.player = this.physics.add.sprite(100, 500, 'character');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(200);

        this.physics.add.collider(this.player, platforms);

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

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if ( this.cursors.right.isDown ) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            this.player.anims.play('walk', true);
        }
        else if ( this.cursors.left.isDown ) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            this.player.anims.play('walk', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('stand');
        }

        if ( this.cursors.up.isDown && this.player.body.touching.down ) {
            this.player.setVelocityY(-220);
        }
    }
};
