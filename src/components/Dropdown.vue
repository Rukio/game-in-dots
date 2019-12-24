<template>
  <div class="dropdown">
    <div @click.stop="toggleList()" class="dropdown-selected">
      <span v-if="empty" class="dropdown-selected-value">{{ placeholder }}</span>
      <span v-else class="dropdown-selected-value">{{ gameDifcSelected.title }}</span>
      <icon-arrow class="dropdown-selected-icon"/>
    </div>
    <ul :class="{'active': listOpen}" class="dropdown-list">
      <li v-for="(difficulty, index) in gameDifcs"
        :key="index"
        @click.stop="select(difficulty, index)"
        class="dropdown-list-item">
          {{ namePolish(index) }}
        </li>
    </ul>
  </div>
</template>

<script>
import IconArrow from '@/components/icons/IconArrow'

export default {
  props: ['placeholder'],
  data () {
    return {
      empty: true,
      listOpen: false
    }
  },
  methods: {
    toggleList () {
      this.listOpen = !this.listOpen
    },
    select (item, title) {
      this.$store.commit('setDifficultyCurrent', item)
      this.$store.commit('setDifficultyName', this.namePolish(title))
      this.empty = false
      this.listOpen = false
      this.$emit('resetGame')
    },
    namePolish (name) {
      let nameRes = name.replace(/([A-Z])/g, ' $1')
      nameRes = nameRes.replace(/^\w/, c => c.toUpperCase())
      return nameRes
    }
  },
  created () {
    this.axios.get(this.$store.state.apiUrls.difficulties)
      .then(data => {
        this.$store.commit('setGameDifcs', data.data)
      })
  },
  mounted () {
    window.addEventListener('click', (e) => {
      this.listOpen = false
    })
  },
  computed: {
    gameDifcs () {
      return this.$store.state.gameDifcs
    },
    gameDifcSelected () {
      return this.$store.state.difficultyCurrent
    }
  },
  components: {
    IconArrow
  }
}
</script>

<style lang="scss" scoped>

.dropdown {
  position: relative;

  &.error {
    .dropdown-selected {
      border-color: #f00;
    }
  }

  &-selected {
    background-color: #CFD8DC;
    display: inline-block;
    padding: 16px 22px;
    border-radius: 5px;
    border: 1px solid #CFD8DC;
    cursor: pointer;

    &:hover {
      background-color: #F3F3F3;
      border-color: #00f;
    }

    &-value {
      color: #7D8F95;
      font-size: 20px;
      margin-right: 15px;
      user-select: none;
    }

    &-icon {
      width: 10px;
      fill: #7D8F95;
      height: 10px;
      margin-bottom: 2px;
    }
  }

  &-list {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    pointer-events: none;
    opacity: 0;
    border: 1px solid #CFD8DC;
    border-radius: 5px;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 5px;

    &.active {
      pointer-events: all;
      opacity: 1;
    }

    &-item {
      color: #7D8F95;
      padding: 10px 15px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: #ddd;
      }

      &:not(:last-child) {
        border-bottom: 1px solid #CFD8DC;
      }
    }
  }
}

</style>
