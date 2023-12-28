const INTERVAL_TIME = 50
const MAX_INTEGER = 2147483648
const PLAYER_DISTANCE = 48

const player = {
  dispenseRandomCoins: 0,
  invisible: false,
  morePlayers: null,
  rapidFire: null,
  setHighScore: false,
  setPlayerLives: false,
  superShooting: 0,
  tripleShot: false,
  uncollidable: null
}


printASCII()


function printASCII () {
  console.log(' +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+')
  console.log(' + Trainer for the SpacePeng app +')
  console.log(' +   Powered by <kastor.code/>   +')
  console.log(' +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+')
  console.log('\n')
  console.log(' * Cannot be reversed')
  console.log(' * createMorePlayers()   => ' + !!player.morePlayers)
  console.log(' dispenseRandomCoins()   => ' + player.dispenseRandomCoins)
  console.log(' setHighScore(score)     => ' + player.setHighScore)
  console.log(' setPlayerInvisible()    => ' + player.invisible)
  console.log(' setPlayerLives(lives)   => ' + player.setPlayerLives)
  console.log(' setPlayerUncollidable() => ' + !!player.uncollidable)
  console.log(' setRapidFire()          => ' + !!player.rapidFire)
  console.log(' superShooting()         => ' + player.superShooting)
  console.log(' tripleShot()            => ' + player.tripleShot)
  console.log('\n')
}


function createMorePlayers () {
  if (!player.morePlayers) {
    Java.perform(function () {
      Java.choose('com.artemis.World', {
        onMatch: function (world) {
          const POSITION = 'de.fgerbig.spacepeng.components.Position'
          Java.choose(POSITION, {
            onMatch: function (position) {
              if (position.y.value == PLAYER_DISTANCE) {
                const Position = Java.use(POSITION)
                const secondPlayerPosition = Position.$new()
                const thirdPlayerPosition = Position.$new()
                secondPlayerPosition.x.value = position.x.value - PLAYER_DISTANCE
                secondPlayerPosition.y.value = position.y.value
                thirdPlayerPosition.x.value = position.x.value + PLAYER_DISTANCE
                thirdPlayerPosition.y.value = position.y.value
                const EntityFactory = Java.use('de.fgerbig.spacepeng.services.EntityFactory')
                const entitySecondPlayer = EntityFactory.createPlayer(world)
                const entityThirdPlayer = EntityFactory.createPlayer(world)
                entitySecondPlayer.edit().add(secondPlayerPosition)
                entityThirdPlayer.edit().add(thirdPlayerPosition)
                player.morePlayers = setInterval(function () {
                  secondPlayerPosition.x.value = position.x.value - PLAYER_DISTANCE
                  thirdPlayerPosition.x.value = position.x.value + PLAYER_DISTANCE
                }, INTERVAL_TIME)
              }
            },
            onComplete: function () {
              printASCII()
            }
          })
        },
        onComplete: function () {}
      })
    })
  }
}


function dispenseRandomCoins () {
  Java.perform(function () {
    Java.choose('de.fgerbig.spacepeng.systems.CoinSpawningSystem', {
      onMatch: function (coinSpawningSystem) {
        for (let i = 0; i < 10; i++) {
          coinSpawningSystem.dispenseRandomCoin()
        }
        player.dispenseRandomCoins++
      },
      onComplete: function () {
        printASCII()
      }
    })
  })
}


function setHighScore (score) {
  if (Number.isInteger(score) && score < MAX_INTEGER) {
    Java.perform(function () {
      Java.choose('de.fgerbig.spacepeng.services.Profile', {
        onMatch: function (profile) {
          profile.setHighScore(score)
          player.setHighScore = score
        },
        onComplete: function () {
          printASCII()
        }
      })
    })
  }
}


function setPlayerInvisible () {
  Java.perform(function () {
    Java.choose('de.fgerbig.spacepeng.systems.DirectorSystem', {
      onMatch: function (directorSystem) {
        if (player.invisible) {
          directorSystem.setPlayerVisible()
        }
        else {
          directorSystem.setPlayerInvisible()
        }
        player.invisible = !player.invisible
      },
      onComplete: function () {
        printASCII()
      }
    })
  })
}


function setPlayerLives (lives) {
  if (Number.isInteger(lives) && lives > -1 && lives < MAX_INTEGER) {
    Java.perform(function () {
      const PLAYER = 'de.fgerbig.spacepeng.components.Player'
      const Player = Java.use(PLAYER)
      Player.DEFAULT_LIVES.value = lives
      Java.choose(PLAYER, {
        onMatch: function (objPlayer) {
          objPlayer.lives.value = lives
          player.setPlayerLives = lives
        },
        onComplete: function () {
          printASCII()
        }
      })
    })
  }
}


function setPlayerUncollidable () {
  Java.perform(function () {
    Java.choose('de.fgerbig.spacepeng.systems.DirectorSystem', {
      onMatch: function (directorSystem) {
        if (player.uncollidable) {
          clearInterval(player.uncollidable)
          player.uncollidable = null
          directorSystem.setPlayerCollidable()
        }
        else {
          player.uncollidable = setInterval(function () {
            directorSystem.setPlayerUncollidable()
          }, INTERVAL_TIME)
        }
      },
      onComplete: function () {
        printASCII()
      }
    })
  })
}


function setRapidFire () {
  if (player.rapidFire) {
    clearInterval(player.rapidFire)
    player.rapidFire = null
    printASCII()
  }
  else {
    Java.perform(function () {
      Java.choose('de.fgerbig.spacepeng.systems.PlayerInputSystem', {
        onMatch: function (playerInputSystem) {
          player.rapidFire = setInterval(function () {
            playerInputSystem.timeToShoot.value = 0
          }, INTERVAL_TIME)
        },
        onComplete: function () {
          printASCII()
        }
      })
    })
  }
}


function superShooting () {
  Java.perform(function () {
    Java.choose('com.artemis.World', {
      onMatch: function (world) {
        const EntityFactory = Java.use('de.fgerbig.spacepeng.services.EntityFactory')
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j <= 800; j += 25) {
            EntityFactory.createPlayerShot(world, j, 0)
          }
        }
        player.superShooting++
      },
      onComplete: function () {
        printASCII()
      }
    })
  })
}


function tripleShot () {
  Java.perform(function () {
    const EntityFactory = Java.use('de.fgerbig.spacepeng.services.EntityFactory')
    if (player.tripleShot) {
      EntityFactory.createPlayerShot.implementation = function (world, x, y) {
        return this.createPlayerShot(world, x, y)
      }
    }
    else {
      EntityFactory.createPlayerShot.implementation = function (world, x, y) {
        this.createPlayerShot(world, x - PLAYER_DISTANCE, y)
        this.createPlayerShot(world, x + PLAYER_DISTANCE, y)
        return this.createPlayerShot(world, x, y)
      }
    }
    player.tripleShot = !player.tripleShot
    printASCII()
  })
}