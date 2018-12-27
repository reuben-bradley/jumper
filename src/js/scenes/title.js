import config from '../config/config';

export default class Title extends Phaser.Scene {
    constructor() {
        super({ key: 'title' });
    }

    preload() {
        // Load fonts for the title screen
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        WebFont.load({
            google: {
                families: [config.textStyles.title.fontFamily, config.textStyles.default.fontFamily]
            },
            active: () => {
                const title = this.add.text(400, 200, 'This is the Title Screen', config.textStyles.title);
                title.setOrigin(0.5);
                const prompt = this.add.text(400, 400, 'Press any key to continue', config.textStyles.default);
                prompt.setOrigin(0.5);
            }
        });

        this.input.manager.enabled = true;
        this.input.once('pointerdown', () => {
            this.scene.start('main');
        }, this);
    }
};
