
export default class Title extends Phaser.Scene {
    constructor() {
        super({ key: 'title' });
    }

    preload() {
        // Empty for now
    }

    create() {
        this.add.text(400, 200, 'This is the Title Screen', { fill: '#ff00ff' });
        this.add.text(400, 400, 'Press any key to continue', { fill: '#00ff00' });

        this.input.manager.enabled = true;
        this.input.once('pointerdown', () => {
            this.scene.start('main');
        }, this);
    }
};
