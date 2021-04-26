import 'phaser';
import { CollisionCategories } from '../collisions';

import TileSprite = Phaser.GameObjects.TileSprite

export class Game extends Phaser.Scene
{
    player: Phaser.Physics.Matter.Sprite;
    cursors;

    hole;
    holeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    holeSpeed = Phaser.Math.GetSpeed(100, 6);


    wallLeftGroup: Phaser.GameObjects.TileSprite[] = [];
    obsticles: Phaser.Physics.Matter.Image[] = [];
    wallRightGroup: Phaser.GameObjects.TileSprite[] = [];



    collisionCatergories: CollisionCategories = new CollisionCategories();

    cursor: Phaser.GameObjects.Image;
    bg: TileSprite

    hook: Phaser.Physics.Matter.Image;
    hookState: 'ready' | 'reload' | 'hooked' | 'shooted' = 'ready';
    hookInPosition: Phaser.Math.Vector2;
    rope: MatterJS.ConstraintType;
    hookedObject: Phaser.Physics.Matter.Image;

    constructor ()
    {
        super('game');
    }

    preload ()
    {
        this.load.image('wall-l', 'assets/wall-l.png');
        this.load.image('wall-r', 'assets/wall-r.png');
        this.load.image('obs1', 'assets/obstacle1.png');
        this.load.image('obs2', 'assets/obstacle2.png');
        this.load.spritesheet('duck',
            'assets/duck.png',
            { frameWidth: 100, frameHeight: 100 }
        );


        this.load.image('stars', 'assets/stars.png');

        this.load.image('cursor', 'assets/bomb.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('hook', 'assets/hook.png');
        this.load.image('barrel', 'assets/barrel.png');
        this.load.image('box', 'assets/box.png');
        this.load.image('cookie', 'assets/cookie.png');
        this.load.atlas('flares', 'assets/flares_2.png', 'assets/flares.json');
    }

    create ()
    {
        // this.matter.world.engine.positionIterations=20;
        // this.matter.world.engine.velocityIterations=20;
        // this.matter.world.update30Hz();
        const particles = this.add.particles('flares');


        this.hole = particles.createGravityWell({
            x: 200,
            y: -300,
            power: 3,
            epsilon: 300,
            gravity: 300
        });

        this.holeEmitter = particles.createEmitter({
            frame: [ 'red', 'green', 'blue' ],
            x: 450,
            y: -300,
            lifespan: 12000,
            speed: 80,
            scale: { start: 0.5, end: 0.2 },
            blendMode: 'ERASE'
        });


        this.input.setPollAlways();

        this.collisionCatergories.init(this);

        this.addWallsLeft(0);
        this.addWallsRight(0);


        this.player = this.matter.add.sprite(100, 50, 'duck').setScale(0.4);
        this.cameras.main.startFollow(this.player);

        this.player.setBounce(0.05);
        this.player.setFriction(0);
        this.player.setFrictionAir(0.5);
        this.player.setMass(0.1);
        
        // this.hook.setVisible(false);

        this.collisionCatergories.addPlayer(this.player);

        this.bg = this.add.tileSprite(-100, -100, 1000, 10000, 'stars');


        // this.player.body.setGravityY(10);
        // this.player.body.setGravityY(10);
        // this.player

        // this.physics.add.collider(this.player, this.wallLeftGroup);
        // this.physics.add.collider(this.player, this.wallRightGroup);
        // this.physics.add.collider(this.player, this.obsticles);

        // this.player.setMaxVelocityY(30);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('duck', { start: 4, end: 7}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'duck', frame: 10} ],
            frameRate: 20
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('duck', { start: 8, end: 9}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursor = this.add.image(0, 0, 'cursor');


        this.input.on('pointerup', () => {
            if (this.hookState === 'hooked') {
                this.unHook();

                return;
            }

            this.shootHook();
        });

        
    }

    unHook() {
        this.matter.world.removeConstraint(this.rope);
        this.rope = null;
        this.hookState = 'ready';
        this.hookedObject = null;
    }

    shootHook() {
        this.hookInPosition = null;

        this.hook = this.matter.add.image(this.player.x, this.player.y, 'hook');
        this.hook.setIgnoreGravity(true);
        this.hook.setPosition(this.player.x, this.player.y);
        this.collisionCatergories.addHook(this.hook);
        // this.hook.se(0, 0);
        this.hookState = "shooted";

        const angle = Phaser.Math.Angle.BetweenPoints(this.player, this.cursor);
        this.hook.setVisible(true);
        this.hook.rotation = angle;

        this.hook.setOnCollide((e: any) => {
            if (this.hookState === 'shooted') {

                this.hookState = 'hooked';

                // (e.bodyB as MatterJS.BodyType);
                
                // @ts-ignore
                // let compoundBody = Phaser.Physics.Matter.Matter.Body.create({
                //     parts: [ e.bodyB, e.bodyA ]
                // });
                // console.log(Object.assign({}, e.activeContacts));
                this.rope = this.matter.add.constraint(
                    this.player as unknown as MatterJS.BodyType,
                    e.bodyA,//this.hook as unknown as MatterJS.BodyType, 
                    Phaser.Math.Distance.BetweenPoints(this.player, e.bodyA),
                    0.2
                );
                this.hookedObject = e.bodyA;
                this.hook.destroy();
                this.hook = null;
               
            }
        });

        this.hook.thrust(0.01);
    }

    update(time, delta: number) {
        this.hole.y += this.holeSpeed * delta;
        this.holeEmitter.setPosition(this.hole.x + 250, this.hole.y);

        // this.bg.tilePositionY++;

        this.cursors = this.input.keyboard.createCursorKeys();
        // do not rotate player 
        this.player.setAngle(0);

        if (this.hookState === 'hooked' && this.hookInPosition) {
            this.hook.setVelocity(0,0);
            this.hook.setPosition(this.hookInPosition.x, this.hookInPosition.y);
        }

        if(this.rope){
            this.rope.length -= 2;
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-2);

            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(2);

            this.player.anims.play('right', true);
        } else {
            // this.player.setVelocityX(0);
            if (!this.cursors.down.isDown && ! this.cursors.up.isDown) {

                this.player.anims.play('turn', true);
            }
        }

        if (this.cursors.down.isDown) {
            this.player.setVelocityY(2);
            this.player.anims.play('up', true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-2);
            this.player.anims.play('up', true);
        } 

        // this.add.tileSprite(0,200, 0, 0, 'grass')

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
            if (bottomY + this.cameras.main.height < this.cameras.main.worldView.centerY){
                this.wallLeftGroup[i].destroy();
                this.wallRightGroup[i].destroy();
                this.wallLeftGroup.splice(i, 1);
                this.wallRightGroup.splice(i, 1);
            }
        });
   
        // adding new platforms
        let lastWallBottomY = (this.wallLeftGroup[this.wallLeftGroup.length - 1] as Phaser.GameObjects.TileSprite).getBottomCenter().y;
        if (this.cameras.main.worldView.centerY + (this.cameras.main.height / 2) > lastWallBottomY){
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

        this.collisionCatergories.addWall(wall);

        // obs
        [1,2,3,4,5].forEach(() => {
            const y = Phaser.Math.Between(posY, posY+h);
            const x = Phaser.Math.Between(50, 500);
            const o = this.matter.add.image(x, y, Phaser.Utils.Array.GetRandom(['barrel', 'box']));

            o.setRotation(Math.random() * 6);
            o.setFrictionAir(0.9);
            this.obsticles.push(o);

            this.collisionCatergories.addBox(o);
        });

        [1,2].forEach(() => {
            const y = Phaser.Math.Between(posY, posY+h);
            const x = Phaser.Math.Between(50, 500);
            const c = this.matter.add.image(x, y, 'cookie');
            c.setScale(0.5);

            c.setFrictionAir(0.95);
            c.setMass(0.01);
            this.obsticles.push(c);

            this.collisionCatergories.addBox(c);
        });
    }

    addWallsRight(posY) {
        const h = 48*20;
        const w = 16;
        const wall = this.add.tileSprite(+this.game.config.width - w, posY, w, h, 'wall-r');
        this.matter.add.gameObject(wall, {isStatic: true});
        this.wallRightGroup.push(wall);

        this.collisionCatergories.addWall(wall);

        
    }
}