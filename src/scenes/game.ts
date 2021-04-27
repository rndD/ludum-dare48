import 'phaser';
import { CollisionCategories } from '../collisions';

import TileSprite = Phaser.GameObjects.TileSprite

export class Game extends Phaser.Scene
{
    player: Phaser.Physics.Matter.Sprite;
    fat: number = 0;
    fatText: Phaser.GameObjects.Text;

    hole;
    holeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    holeSpeed = Phaser.Math.GetSpeed(100, 6);


    wallLeftGroup: Phaser.GameObjects.TileSprite[] = [];
    obsticles: Phaser.Physics.Matter.Image[] = [];
    cookies: Phaser.Physics.Matter.Image[] = [];
    wallRightGroup: Phaser.GameObjects.TileSprite[] = [];



    collisionCatergories: CollisionCategories = new CollisionCategories();

    cursor: Phaser.GameObjects.Image;
    bg: TileSprite

    hook: Phaser.Physics.Matter.Image;
    hookState: 'ready' | 'reload' | 'hooked' | 'shooted' = 'ready';
    hookInPosition: Phaser.Math.Vector2;
    rope: MatterJS.ConstraintType;
    ropeGraphics: Phaser.GameObjects.Graphics;
    ropeLine: Phaser.Geom.Line;
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

        this.load.image('crosshair', 'assets/crosshair.png');
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

        this.ropeLine = new Phaser.Geom.Line(100, 500, 700, 100);
        this.ropeGraphics = this.add.graphics({ lineStyle: { width: 3, color: 0x8e593c} });
        this.ropeGraphics.setVisible(false);


        this.input.setPollAlways();

        this.collisionCatergories.init(this);

        this.player = this.matter.add.sprite(100, 50, 'duck').setScale(0.4);
        this.cameras.main.startFollow(this.player);

        this.player.setBounce(0.05);
        this.player.setFriction(0);
        this.player.setFrictionAir(0.5);
        this.player.setMass(0.1);
        
        this.addWallsLeft(0);
        this.addWallsRight(0);
        this.dropGarbage(true);
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

        this.cursor = this.add.image(0, 0, 'crosshair');


        this.input.on('pointerup', () => {
            if (this.hookState === 'hooked') {
                this.unHook();

                return;
            }

            this.shootHook();
        });

        this.fatText = this.add.text(10, 10, "Fat: You Are Not Fat");
        this.fatText.setScrollFactor(0);
        
    }

    unHook() {
        if (this.rope) {
            this.matter.world.removeConstraint(this.rope);
            this.rope = null;

        }

        this.hookState = 'ready';
        this.hookedObject = null;
        this.ropeGraphics.setVisible(false);
    }

    shootHook() {
        this.hookInPosition = null;

        this.hook = this.matter.add.image(this.player.x, this.player.y, 'hook');
        this.hook.setIgnoreGravity(true);
        this.hook.setScale(1.3);
        this.hook.setPosition(this.player.x, this.player.y);
        this.collisionCatergories.addHook(this.hook);
        this.hookState = "shooted";

        const angle = Phaser.Math.Angle.BetweenPoints(this.player, this.cursor);
        this.hook.setVisible(true);
        this.hook.rotation = angle;

        this.ropeGraphics.setVisible(true);

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
                    0.1
                );
                this.hookedObject = e.bodyA;
                this.hook.destroy();
                this.hook = null;
               
            }
        });

        this.hook.thrust(0.03);
    }

    eatCookie(c: any) {
        c.gameObject.destroy();
        this.fat++;
        if (this.fat % 2 === 0) {
            console.log('fatter')
            this.player.setScale(this.player.scale + 0.1);

            let fatState = 'Fit';

            if (this.fat > 2) {
                fatState = 'Fatty';
            }
            if (this.fat > 4) {
                fatState = 'Chubby';
            }
            if (this.fat > 6) {
                fatState = 'Rounded';
            }
            if (this.fat > 7) {
                fatState = 'Almost that fat';
            }
            if (this.fat == 9) {
                fatState = 'Close to the blackhole fat';
            }

            this.fatText.setText('Fat: ' + fatState);
            this.fatText.setScale(1 + 0.1 * this.fat);
        }

        if (this.fat == 10) {
            console.log('you win');
            this.cameras.main.shake(300);
            this.fatText.setText('YOU WIN, YOU ARE \n FATTER THAN BLACK HOLE!');
            this.time.delayedCall(400, () => {

                this.game.destroy(false);
            });
        
        }
    }

    duckAnimation() {
        if (this.player.body.velocity.x > 0.1) {
            this.player.anims.play('right', true);
        } else if (this.player.body.velocity.x < -0.2) {
            this.player.anims.play('left', true);
        } else {
            if (this.player.body.velocity.y > 0) {
                this.player.anims.play('up', true);
            } else {
                this.player.anims.play('turn', true);
            }
        }
    }

    checkDuckAlive() {
        if (this.player.y - this.hole.y < 20) {
            
            this.fatText.setText('Fat: Dead');
            this.fatText.setScale(2);
            this.cameras.main.on('camerafadeoutcomplete', function () {
                location.reload();
                // this.scene.restart();
            }, this);


            //  Get a random color
            var red = Phaser.Math.Between(50, 255);
            var green = Phaser.Math.Between(50, 255);
            var blue = Phaser.Math.Between(50, 255);

            this.cameras.main.fade(2000, red, green, blue);

        }
    }

    update(time, delta: number) {
        this.hole.y += this.holeSpeed * delta;
        this.holeEmitter.setPosition(this.hole.x + 250, this.hole.y);

        this.checkDuckAlive();

        // this.bg.tilePositionY++;

        // do not rotate player 
        this.player.setAngle(0);

        if (this.hookState === 'shooted' && this.hook) {
            const p = this.player;
            this.ropeLine.setTo(p.x, p.y, this.hook.x, this.hook.y);
            this.ropeGraphics.clear();
            this.ropeGraphics.strokeLineShape(this.ropeLine);

            if (Phaser.Math.Distance.BetweenPoints(this.hook, this.player) > 300) {
                this.unHook();
            }
        }

        if (this.rope && this.hookedObject) {
            // @ts-ignore
            if (this.hookedObject.gameObject) {
                // @ts-ignore
                this.ropeLine.setTo(this.player.x, this.player.y, this.hookedObject.gameObject.x, this.hookedObject.gameObject.y)
                this.ropeGraphics.clear();
                this.ropeGraphics.strokeLineShape(this.ropeLine);
            }

            // @ts-ignore
            if(this.hookedObject.gameObject?.getData('type') === 'obsticle') {
                // @ts-ignore
                const v = this.hookedObject.position as Phaser.Math.Vector2;
                // @ts-ignore
                this.player.applyForceFrom(v, {x: 0.0002, y: 0.002});
            }

            this.rope.length -= 1.5;

            if (this.rope.length < 30) {
                this.unHook();
            }
        }


        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.player.setVelocityX(-2);

        } else if (cursors.right.isDown) {
            this.player.setVelocityX(2);
        }

        if (cursors.up.isDown) {
            this.player.setVelocityY(-2);
        } else {
            this.player.setVelocityY(0.5);
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

        this.duckAnimation();
    }


    addWallsLeft(posY) {
        const h = 48*20;
        const w = 16;
        const wall = this.add.tileSprite(0, posY, w, h, 'wall-l');

        this.matter.add.gameObject(wall, {isStatic: true});
        this.wallLeftGroup.push(wall);

        this.collisionCatergories.addWall(wall);

      

        [1,2,3].forEach(() => {
            const y = Phaser.Math.Between(posY, posY+h);
            const x = Phaser.Math.Between(50, 500);
            const c = this.matter.add.image(x, y, 'cookie');
            c.setScale(0.5);

            c.setFrictionAir(0.95);
            c.setMass(0.01);
            this.cookies.push(c);
            this.player.setOnCollideWith(c.body, this.eatCookie.bind(this));

            this.collisionCatergories.addBox(c);
        });
    }

    dropGarbage(first = false) {
        const minY = first ? this.player.y + 100 :  this.player.y + 350;
        const h = 300;
        // obs
        [1,2,3,4,5].forEach(() => {
            const y = Phaser.Math.Between(minY, minY + h );
            const x = Phaser.Math.Between(50, 500);
            const o = this.matter.add.image(x, y, Phaser.Utils.Array.GetRandom(['barrel', 'box']));
            o.setData('type', 'obsticle');

            o.setRotation(Math.random() * 6);
            o.setFrictionAir(0.4);
            // @ts-ignore
            o.applyForce({x: 0 , y: -0.08});
            this.obsticles.push(o);

            this.collisionCatergories.addBox(o);
        });

        this.time.delayedCall(3000, this.dropGarbage, null, this);
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