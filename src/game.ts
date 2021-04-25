import 'phaser';
import { Physics } from 'phaser';
import GameConfig = Phaser.Types.Core.GameConfig
import TileSprite = Phaser.GameObjects.TileSprite

export default class Demo extends Phaser.Scene
{
    platforms;
    tube;
    player: Phaser.Physics.Matter.Sprite;
    cursors;


    wallLeftGroup: Phaser.GameObjects.TileSprite[] = [];
    obsticles: Phaser.Physics.Matter.Image[] = [];
    wallRightGroup: Phaser.GameObjects.TileSprite[] = [];


    cursor: Phaser.GameObjects.Image;
    bg: TileSprite
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.image('wall-l', 'assets/wall-l.png');
        this.load.image('wall-r', 'assets/wall-r.png');
        this.load.image('obs1', 'assets/obstacle1.png');
        this.load.image('obs2', 'assets/obstacle2.png');
        this.load.image('stars', 'assets/stars.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('dude',
            'assets/duck.png',
            { frameWidth: 100, frameHeight: 100 }
        );


        this.load.image('star', 'assets/star.png');

        this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', 'assets/starfields.glsl.js');
        this.load.image('cursor', 'assets/bomb.png');
    }

    create ()
    {
        // this.add.shader('RGB Shift Field', 0, 0, 800, 600).setOrigin(0);
        // this.add.shader('Plasma', 0, 412, 800, 172).setOrigin(0);

        this.input.setPollAlways();
        //this.add.image(400, 300, 'sky');

        // this.platforms = this.physics.add.staticGroup();
        // this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // this.platforms.create(600, 400, 'ground');
        // this.platforms.create(50, 250, 'ground');
        // this.platforms.create(750, 220, 'ground');


        this.addWallsLeft(0);
        this.addWallsRight(0);


        this.player = this.matter.add.sprite(100, 50, 'dude');

        this.cameras.main.startFollow(this.player);

        this.player.setBounce(0.2);
        this.player.setFriction(0.95);
        this.player.setMass(0.1)


      this.bg = this.add.tileSprite(0, 0, 1000, 100000, 'stars');


      // this.player.body.setGravityY(10);
        // this.player

        // this.physics.add.collider(this.player, this.wallLeftGroup);
        // this.physics.add.collider(this.player, this.wallRightGroup);
        // this.physics.add.collider(this.player, this.obsticles);

        // this.player.setMaxVelocityY(30);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 4, end: 7}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 10} ],
            frameRate: 20
        });

        this.anims.create({
          key: 'up',
          frames: this.anims.generateFrameNumbers('dude', { start: 8, end: 9}),
          frameRate: 10,
          repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursor = this.add.image(0, 0, 'cursor');


    }

    update() {
      this.bg.tilePositionY++;
        this.player.setAngle(0);
      this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown)
          {
              this.player.setVelocityX(-5);

                  this.player.anims.play('left', true);
              }
              else if (this.cursors.right.isDown)
              {
                  this.player.setVelocityX(5);

                  this.player.anims.play('right', true);
              }
              else if (this.cursors.up.isDown) {

              this.player.setVelocityY(-3);
              this.player.anims.play('up', true);
        } else {
              this.player.setVelocityX(0);
              this.player.anims.play('turn', true);
        }

        this.add.tileSprite(0,200, 0, 0, 'grass')

        var sky = new Phaser.Display.Color(87 ,140, 190);
        var space = new Phaser.Display.Color(0, 0, 0);

        var hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(sky, space,this.cameras.main.height * 2, this.player.y);

        this.cameras.main.setBackgroundColor(hexColor);



        const crosshairX = this.input.mousePointer.x + this.cameras.main.worldView.x;
        const crosshairY = this.input.mousePointer.y + this.cameras.main.worldView.y;
        this.cursor.setPosition(crosshairX, crosshairY);

        // recycling walls 
        this.wallLeftGroup.forEach((wall: Phaser.GameObjects.TileSprite, i) => {
            const bottomY = wall.getBottomCenter().y;
            if(bottomY + this.cameras.main.height < this.cameras.main.worldView.centerY){
                this.wallLeftGroup[i].destroy();
                this.wallRightGroup[i].destroy();
                this.wallLeftGroup.splice(i, 1);
                this.wallRightGroup.splice(i, 1);
            }
        });
   
        // adding new platforms
        let lastWallBottomY = (this.wallLeftGroup[this.wallLeftGroup.length - 1] as Phaser.GameObjects.TileSprite).getBottomCenter().y;
        if(this.cameras.main.worldView.centerY + (this.cameras.main.height / 2) > lastWallBottomY){
            this.addWallsLeft(lastWallBottomY);
            this.addWallsRight(lastWallBottomY);
        }
    }


    addWallsLeft(posY) {
        const h = 48*20;
        const w = 16;
        const wall = this.add.tileSprite(0, posY, w, h, 'wall-l');

        this.matter.add.gameObject(wall, {isStatic: true});
        this.wallLeftGroup.push(wall);

        // obs
        [1,2].forEach(() => {
            const y = Phaser.Math.Between(posY, posY+h);
            const x = Phaser.Math.Between(w*2, w * 3);
            const o = this.matter.add.image(x, y, 'obs2');
            o.setStatic(true);

            this.obsticles.push(o);
        });
    }

    addWallsRight(posY) {
        const h = 48*20;
        const w = 16;
        const wall = this.add.tileSprite(+this.game.config.width - w, posY, w, h, 'wall-r');
        this.matter.add.gameObject(wall, {isStatic: true});
        this.wallRightGroup.push(wall);

        // obs
        [1,2].forEach(() => {
            const y = Phaser.Math.Between(posY, posY+h);
            const x = Phaser.Math.Between(+this.game.config.width - w*3, +this.game.config.width - w * 2);

            const o = this.matter.add.image(x, y, 'obs1');
            o.setStatic(true);

            this.obsticles.push(o);
        });
    }
}

const ZOOM = 1.5;
const config:GameConfig = {
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
    //pixelArt: true,
    scene: Demo,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            enableSleeping: true,
            debug: true
        }
    },
};

const game = new Phaser.Game(config);
