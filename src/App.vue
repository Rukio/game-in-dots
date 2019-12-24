<template>
  <div id="app">
    <router-view class="route-current"/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>
