
export default class Main extends Phaser.Scene {
    constructor() {
        super({ key: 'main' });
    }

    preload() {
        // Empty for now
    }

    create() {
        this.add.text(400, 300, 'This is the game screen', { fill: '#ff0000' });

        this.input.manager.enabled = true;
        this.input.once('pointerdown', () => {
            this.scene.start('title');
        }, this);
    }
};
