import 'phaser';

export class Wall extends Phaser.GameObjects.Image {
    constructor(params) {
      super(params.scene, params.x, params.y, params.key, params.frame);
  
      // image
      this.setScale(3);
      this.setOrigin(0, 0);
  
      // physics
      this.scene.add.existing(this);
    }
  }