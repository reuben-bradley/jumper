import 'phaser';
import config from './config/config';
import Title from './scenes/title';
import Main from './scenes/main';

const gameConfig = {
    type: Phaser.AUTO,
    width: config.canvas.width,
    height: config.canvas.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [Title, Main]
};

const game = new Phaser.Game(gameConfig);
