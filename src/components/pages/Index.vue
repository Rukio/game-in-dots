<template>
  <div class="page-main">
    <div class="wrapper">
      <div class="game-container">
        <div class="game game-component">
          <form @submit.prevent="play()" class="game-form">
            <dropdown :class="{'error': errors.difficulty}"
              @resetGame="reset()" placeholder="Pick game mode" class="game-form-elem game-form-dropdown"/>
            <input v-model="name"
              :class="{'error': errors.name}"
              type="text" placeholder="Enter your name" class="game-form-elem game-form-input">
            <button class="game-form-elem game-form-submit">
              {{ gameStatus === 2 ? 'PLAY AGAIN' : 'PLAY'}}
            </button>
          </form>
          <p :class="{'active': message && (gameStatus === 2)}"
            class="game-message">{{ message }}</p>
          <div class="game-field">
            <table class="game-field-table">
              <tr v-for="(fieldRow, indexRow) in gameFieldData"
                :key="indexRow"
                class="table-row">
                <td v-for="(fieldCol, indexCol) in gameFieldData[indexRow]"
                  :key="indexCol"
                  :class="{
                    'active': fieldCol.status === 1,
                    'success': fieldCol.status === 2,
                    'failed': fieldCol.status === 3
                  }"
                  @click="squareClick(indexRow, indexCol)"
                  :style="{
                    width: `${difficultyCurrent.field * $store.state.squareMultiplier}px`,
                    height: `${difficultyCurrent.field * $store.state.squareMultiplier}px`
                  }"
                  class="table-col"></td>
              </tr>
            </table>
          </div>
        </div>
        <div class="leader-board game-component">
          <h2 class="leader-board-title">Leader Board</h2>
          <ul class="leader-board-list">
            <li v-for="lbResult in leaderBoardData"
              :key="lbResult.id"
              class="leader-board-list-item">
              <span class="lb-list-item-name">{{ lbResult.winner }}</span>
              <span class="lb-list-item-date">{{ lbResult.date }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from '@/components/Dropdown'

export default {
  data () {
    return {
      name: '',
      lastFieldTimeout: null,
      errors: {
        name: false,
        difficulty: false
      }
    }
  },
  methods: {
    play () {
      if (this.name && this.$store.state.difficultyCurrent) {
        this.gameStart()
        this.setError(false)
      } else {
        if (!this.name) {
          this.setError('name', true)
        }
        if (!this.difficultyCurrent) {
          this.setError('difficulty', true)
        }
      }
    },
    setError (field, flag) {
      if (!field) {
        for (let field in this.errors) {
          this.errors[field] = false
        }
      } else {
        this.errors[field] = flag
      }
    },
    squareClick (x, y) {
      if (this.gameFieldData[x][y].status === 1) {
        this.$store.commit('setGameFieldStatus', {
          x, y, status: 2
        })
        clearTimeout(this.lastFieldTimeout)
        this.nextSquare()
      }
    },
    gameStart () {
      this.reset()
      this.$store.commit('setCurrentName', this.name)
      this.$store.commit('setGameStatus', 1)
      clearTimeout(this.lastFieldTimeout)
      this.nextSquare()
    },
    nextSquare () {
      const findSquare = () => {
        let xRand = Math.floor(Math.random() * Math.floor(this.$store.state.fieldSize.w))
        let yRand = Math.floor(Math.random() * Math.floor(this.$store.state.fieldSize.h))
        if (this.gameFieldData[xRand][yRand].status === 0) {
          this.$store.commit('setGameFieldStatus', {
            x: xRand,
            y: yRand,
            status: 1
          })
          this.lastFieldTimeout = setTimeout(() => {
            this.$store.commit('setGameFieldStatus', {
              x: xRand,
              y: yRand,
              status: 3
            })
            if (this.hasEmptyFields()) findSquare()
          }, this.difficultyCurrent.delay)
        } else {
          if (this.hasEmptyFields()) findSquare()
        }
      }
      if (this.hasEmptyFields()) findSquare()
    },
    reset () {
      let fieldData = []
      for (let i = 0; i < this.$store.state.fieldSize.w; i++) {
        fieldData.push([])
        for (let j = 0; j < this.$store.state.fieldSize.h; j++) {
          fieldData[i].push({ status: 0 })
        }
      }
      this.$store.commit('setGameMessage', '')
      this.$store.commit('initGameFieldData', fieldData)
    },
    hasEmptyFields () {
      let gameFieldData = this.$store.state.gameFieldData
      let greenSquareCount = 0
      let redSquareCount = 0
      let maxSquareCount = Math.floor(this.$store.state.fieldSize.w * this.$store.state.fieldSize.h / 2)
      for (let fieldRow of gameFieldData) {
        for (let fieldCol of fieldRow) {
          if (fieldCol.status === 2) greenSquareCount++
          else if (fieldCol.status === 3) redSquareCount++
        }
      }

      if (greenSquareCount > maxSquareCount || redSquareCount > maxSquareCount) {
        if (greenSquareCount > maxSquareCount) {
          this.$store.commit('setGameMessage',
            `${this.$store.state.currentName} won!`)
          this.sendToLeaderboard()
        } else if (redSquareCount > maxSquareCount) {
          this.$store.commit('setGameMessage',
            `Computer won!`)
          this.sendToLeaderboard('Computer')
        }
        this.$store.commit('setGameStatus', 2)
        clearTimeout(this.lastFieldTimeout)
        return false
      }

      for (let i = 0; i < gameFieldData.length; i++) {
        for (let j = 0; j < gameFieldData[i].length; j++) {
          if (gameFieldData[i][j].status === 0) {
            return true
          }
        }
      }
      return false
    },
    getLeaderboardData () {
      this.axios.get(this.$store.state.apiUrls.leaderBoard)
        .then(data => {
          this.$store.commit('setLeaderBoardData', data.data)
        })
    },
    sendToLeaderboard (winner) {
      if (!winner) winner = this.$store.state.currentName
      this.axios.post(this.$store.state.apiUrls.leaderBoard, {
        winner: winner,
        date: this.getCurDate()
      }).then(data => {
        this.getLeaderboardData()
      })
    },
    getCurDate () {
      let dateRaw = new Date()
      let minutesRaw = dateRaw.getMinutes() < 10 ? `0${dateRaw.getMinutes()}` : dateRaw.getMinutes()
      let time = `${dateRaw.getHours()}:${minutesRaw}`
      let day = dateRaw.getUTCDate()
      let year = dateRaw.getUTCFullYear()
      let month = dateRaw.getMonth()
      switch (month) {
        case 0:
          month = 'January'
          break
        case 1:
          month = 'February'
          break
        case 2:
          month = 'March'
          break
        case 3:
          month = 'April'
          break
        case 4:
          month = 'May'
          break
        case 5:
          month = 'June'
          break
        case 6:
          month = 'July'
          break
        case 7:
          month = 'August'
          break
        case 8:
          month = 'September'
          break
        case 9:
          month = 'October'
          break
        case 10:
          month = 'November'
          break
        case 11:
          month = 'December'
          break
      }
      return `${time}; ${day} ${month} ${year}`
    }
  },
  created () {
    this.getCurDate()
    this.getLeaderboardData()
  },
  computed: {
    message () {
      return this.$store.state.gameMessage
    },
    gameFieldData () {
      return this.$store.state.gameFieldData
    },
    difficultyCurrent () {
      return this.$store.state.difficultyCurrent
    },
    gameStatus () {
      return this.$store.state.gameStatus
    },
    leaderBoardData () {
      return this.$store.state.leaderBoardData
    }
  },
  components: {
    Dropdown
  }
}
</script>

<style lang="scss" scoped>

.page-main {
  background-color: #eee;
  padding-top: 60px;
  padding-bottom: 60px;
  min-height: 100vh;
}

.game-form {
  display: flex;
  flex-wrap: wrap;
  margin: -15px -10px;

  &-elem {
    margin: 5px;
  }

  &-input {
    padding: 14px 22px;
    color: #7D8F95;
    font-size: 20px;
    border-radius: 5px;
    outline: none;
    border: 1px solid #F3F3F3;
    background-color: #F3F3F3;
    width: 205px;

    &:hover {
      border-color: #00f;
    }

    &.error {
      border-color: #f00;
    }

    &:focus {
      border-color: #7B8D93;
    }
  }

  &-submit {
    padding: 14px 45px;
    font-size: 20px;
    color: #fff;
    background-color: #7B8D93;
    border-radius: 5px;
    border: none;
    outline: none;
    cursor: pointer;

    &:hover {
      background-color: rgb(167, 174, 177);
    }
  }
}

.game {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: column;

  &-message {
    margin-top: 30px;
    min-height: 30px;
    color: #7D8F95;
    font-size: 19px;
    font-weight: 700;
  }

  &-field {
    margin-top: 30px;
    border: 1px solid #CFD8DC;
    display: inline-block;

    &-table {
      border-collapse: collapse;
    }
  }

  &-container {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -2.5px;
  }

  &-component {
    width: calc(50% - 5px);
    margin: 0 2.5px;
    background-color: #fff;
    padding: 60px 40px;

    @media screen and (max-width: 1200px) {
      width: 100%;
      padding: 60px 15px;
    }
  }
}

.table {
  &-row {
    &:not(:last-child) {
      border-bottom: 1px solid #CFD8DC;
    }
  }

  &-col {
    width: 25px;
    height: 25px;

    &:not(:last-child) {
      border-right: 1px solid #CFD8DC;
    }

    &.active {
      background-color: #42D8E8;
    }

    &.success {
      background-color: #00E871;
    }

    &.failed {
      background-color: #E85A5F;
    }
  }
}

.leader-board {
  text-align: left;

  @media screen and (max-width: 640px) {
    margin-top: 5px;
  }

  &-title {
    font-size: 31px;
    color: #888888;
  }

  &-list {
    list-style: none;
    margin-top: 37px;

    &-item {
      background-color: #CFD8DC;
      padding: 16px 17px;
      color: #A5AEB1;
      font-size: 22px;
      display: flex;
      justify-content: space-between;

      @media screen and (max-width: 640px) {
        flex-direction: column;
        font-size: 19px;
      }

      &:not(:last-child) {
        margin-bottom: 3px;
      }
    }
  }
}

.lb-list-item {
  &-date {
    margin-left: 15px;

    @media screen and (max-width: 640px) {
      margin-left: 0;
      margin-top: 10px;
    }
  }
}

</style>
