export class CollisionCategories {
    walls: number;
    hook: number;
    player: number;
    boxes: number;

    init(scene: Phaser.Scene) {
        this.walls = scene.matter.world.nextCategory();
        this.hook = scene.matter.world.nextCategory();
        this.player = scene.matter.world.nextCategory();
        this.boxes = scene.matter.world.nextCategory();
    }

    addWall(wall: any) {
        (wall as unknown as Phaser.Physics.Matter.Sprite).setCollisionCategory(this.walls);

        return this;
    }

    addHook(hook: Phaser.Physics.Matter.Image) {
        hook.setCollisionCategory(this.hook);
        hook.setCollidesWith([this.boxes]);

        return this;
    }

    addBox(box: Phaser.Physics.Matter.Image) {
        box.setCollisionCategory(this.boxes);
        box.setCollidesWith([this.walls, this.hook, this.player, this.boxes]);

        return this;
    }

    addPlayer(player: Phaser.Physics.Matter.Sprite) {
        player.setCollisionCategory(this.player);
        player.setCollidesWith([this.walls, this.boxes]);

        return this;
    }
}