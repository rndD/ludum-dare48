import 'phaser';

export default class Demo extends Phaser.Scene
{
    platforms;
    player;
    cursors;

    cursor: Phaser.GameObjects.Image;

    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.image('logo', 'assets/phaser3-logo.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('dude', 
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
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

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');


        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.cameras.main.startFollow(this.player);

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(10);

        this.physics.add.collider(this.player, this.platforms);
        this.player.body.setMaxVelocityY(30);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursor = this.add.image(0, 0, 'cursor');
        // this.input.on('pointermove', function (pointer) {
        //     console.log(pointer)
        //     this.cursor.setVisible(true).setPosition(pointer.worldX, pointer.worldY);
        // }, this);
        // this.tweens.add({
        //     targets: logo,
        //     y: 350,
        //     duration: 1500,
        //     ease: 'Sine.inOut',
        //     yoyo: true,
        //     repeat: -1
        // })
    }

    update() {
        this.cursors = this.input.keyboard.createCursorKeys();

        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-100);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(100);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown)
        {
            this.player.setVelocityY(-30);
        }

        var sky = new Phaser.Display.Color(120, 120, 255);
        var space = new Phaser.Display.Color(0, 0, 0);

        var hexColor = Phaser.Display.Color.Interpolate.ColorWithColor(sky, space,this.cameras.main.height * 2, this.player.y);
    
        this.cameras.main.setBackgroundColor(hexColor);


        const crosshairX = this.input.mousePointer.x + this.cameras.main.worldView.x
        const crosshairY = this.input.mousePointer.y + this.cameras.main.worldView.y
        this.cursor.setPosition(crosshairX, crosshairY)
        


    }
}


const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Demo,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 5 },
            debug: true 
        }
    },
    
};

const game = new Phaser.Game(config);
