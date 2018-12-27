import 'phaser';
import Title from '../scenes/title';
import Main from '../scenes/main';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: [Title, Main]
};

export default config;
