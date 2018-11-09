
    const config = {
        type: Phaser.AUTO,
        width: 4800,
        height: 380,
        parent: "game-container",
        zoom:2,
        pixelArt: true,
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 300 }
          }
        }
        };
        
    
    const game = new Phaser.Game(config);
    let controls;
    var player;
    let cursors;
    let CoinLayer;
    var score = 0;
    var text;
    let coins;
    let bombs;
    let bomb;
    let princess;
    let goombas;
    let goomba;
    
    function preload() {
      this.load.image("tiles", "assets/tilesheet.png");
      this.load.image("coin", "assets/coin.png");
      this.load.tilemapTiledJSON("map", "assets/tilemap.json");
      this.load.image('bomb', 'assets/bomb.png');
      this.load.spritesheet('dude', 'assets/davemoves.png', { frameWidth: 26.5, frameHeight: 48 });
      this.load.spritesheet('princess', 'assets/dave.png', { frameWidth: 32, frameHeight: 48 });
      this.load.image('goomba', 'assets/enemy.png');
    }
    
    
    function create() {
        //create map
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("52571", "tiles");
            
        //add layers
        const BackgroundLayer = map.createStaticLayer("BackgroundLayer", tileset, 0, 0);
        const BackgroundDecorations = map.createStaticLayer("BackgroundDecorations", tileset, 0, 0);
        const GroundLayer = map.createStaticLayer("GroundLayer", tileset, 0, 0);
        CoinLayer = map.getObjectLayer('CoinLayer')['objects'];

        //player
        player = this.physics.add.sprite(30, 200, 'dude');
        princess = this.physics.add.sprite(4750,0,'princess')
        player.body.bounce.y = 0.2;
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
        cursors = this.input.keyboard.createCursorKeys();

        //coins
        coins = this.physics.add.staticGroup()
        CoinLayer.forEach(object => {
            let obj = coins.create(object.x, object.y, "coin");
                obj.setScale(object.width/16, object.height/16); 
                obj.setOrigin(0); 
                obj.body.width = object.width; 
                obj.body.height = object.height; 
        });
        // coins.refresh();
        // coins.enableBody = true;

        goombas
        goombas = this.physics.add.group()
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
        //     frameRate: 1,
        //     repeat: 30
        // })
       
        for(let i = 0; i<30; i++){
            goomba = goombas.create(Phaser.Math.Between(0, 4800), 250, 'goomba');
            //goomba.anims.play('walk',false,0)
            console.log('goomba', goomba)
            goomba.setBounce(1);
            goomba.setVelocity(Phaser.Math.Between(-100, 100));
            goomba.setCollideWorldBounds(true);
            // goomba.allowGravity = false;
        }


        //bombs
        bombs = this.physics.add.group();

        for(let i = 0; i<1; i++){
            bomb = bombs.create(Phaser.Math.Between(80, 4500), 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-100, 100), 20);
            bomb.allowGravity = false;
        }
        

        //collisons
        map.setCollisionBetween(0, 923, true, 'GroundLayer');
        player.setCollideWorldBounds(true);
        princess.setCollideWorldBounds(true);
        this.physics.add.collider(player, GroundLayer);
        this.physics.add.collider(princess, GroundLayer);
        this.physics.add.collider(goombas, GroundLayer);
        this.physics.add.collider(princess, player);
        this.physics.add.overlap(player, coins, collectCoin, null, this);
        this.physics.add.collider(bombs, GroundLayer);
        this.physics.add.collider(player, bombs, hitBomb, null, this);
        this.physics.add.collider(player, goombas, hitGoomba, null, this);

       
        //camera
        this.cameras.main.setBounds(0, -60, 4800, 400);
        this.cameras.main.setSize(700,800);
        this.cameras.main.startFollow(player);
        
        //score
        text = this.add.text(580, 70, `Score: ${score}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        text.setScrollFactor(0);

    
    }
    
function update(time, delta) {

        //if player falls    

        if (player.body.y>320 || player.isTinted === true){
            loseText = this.add.text(200, 125, 'YOU LOSE', {
                fontSize: '70px',
                fill: '#db6097'});
            loseTextSubtitle = this.add.text(200, 200, 'Restarting game...', {
                fontSize: '35px',
                fill: '#db6097'});
            loseText.setScrollFactor(0);
            loseTextSubtitle.setScrollFactor(0);
            let currentScene = this.scene

            setTimeout(function(){
                currentScene.restart()
                score = 0
            },5000)
        }

        if (cursors.up.isDown && player.body.onFloor())
        {
            player.setVelocityY(-200);
        }

        if (cursors.left.isDown)
        {
            player.setVelocityX(-100);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(100);

            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }
        
}


function collectCoin(player, coin) {
    coin.destroy(coin.x, coin.y); // remove the tile/coin
    score ++; // increment the score
    text.setText(`Score: ${score}`); // set the text to show the current score
    return false;
}

function hitBomb (player, bomb)
{
    this.physics.pause();
    
    player.setTint(0xff0000);
    console.log('player', player)
    player.anims.play('turn');
}


function hitGoomba(player, goomba) {
    if (player.body.touching.down) {
        goomba.destroy();
    } else{
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
}