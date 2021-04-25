import 'phaser';
import GameConfig = Phaser.Types.Core.GameConfig;
import {Game} from './scenes/game';

const ZOOM = 1.5;
export const config: GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#578cbe',

    // width: 320,
    // height: 480,
    zoom: ZOOM,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'body',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,
        height: 480,
        // pixelArt: true, // ?
    },
    // pixelArt: true,
    autoFocus: true,
    scene: Game,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            enableSleeping: true,
            debug: true
        }
    },
};