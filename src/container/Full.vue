<!-- App Main Structure -->
<template>
	<div class="app-default-layout">
		<template v-if="loading">
			<rotate-square2></rotate-square2>
		</template>
		<template v-else>
			<!-- App Header -->
			<app-header></app-header>
			<!-- App Main Content -->
			<v-content>
				<!-- App Router -->
				<transition name="router-anim" :enter-active-class="`animated ${selectedRouterAnimation}`">
					<router-view></router-view>
				</transition>
			</v-content>
			<!-- User Tour -->
			<!--<tour></tour>-->
      <!-- app customizer -->
			<!-- <app-customizer></app-customizer> -->
		</template>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import Customizer from "Components/Customizer/Customizer";
import Header from "Components/Header/Header.vue";
import Tour from "Components/Tour/Tour";
import AppConfig from "Constants/AppConfig";

export default {
  data() {
    return {
      loading: true
    };
  },
  components: {
    appHeader: Header,
    appCustomizer: Customizer,
    Tour
  },
  computed: {
    ...mapGetters(["selectedRouterAnimation"])
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
      setTimeout(() => {
        if (AppConfig.enableUserTour) {
          this.$tours["vuelyTour"].start();
        }
      }, 1000);
    }, 2000);
  }
};
</script>

<style scoped>
.app-default-layout {
  height: 100vh;
}
</style>
