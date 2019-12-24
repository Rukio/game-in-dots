import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    apiUrls: {
      difficulties: '/game-settings',
      leaderBoard: '/winners'
    },
    gameDifcs: {},
    difficultyCurrent: null,
    currentName: '',
    gameMessage: '',
    gameFieldData: [],
    leaderBoardData: [],
    gameStatus: 0,
    fieldSize: { w: 5, h: 5 },
    squareMultiplier: 2
  },
  mutations: {
    setGameDifcs (state, value) {
      state.gameDifcs = value
    },
    setDifficultyCurrent (state, value) {
      state.difficultyCurrent = value
    },
    setDifficultyName (state, value) {
      Vue.set(state.difficultyCurrent, 'title', value)
    },
    setCurrentName (state, value) {
      state.currentName = value
    },
    setGameMessage (state, value) {
      state.gameMessage = value
    },
    initGameFieldData (state, value) {
      state.gameFieldData = value
    },
    setGameFieldStatus (state, { x, y, status }) {
      Vue.set(state.gameFieldData[x][y], 'status', status)
    },
    setGameStatus (state, value) {
      state.gameStatus = value
    },
    setLeaderBoardData (state, value) {
      state.leaderBoardData = value
    }
  }
})

export default store
