<template>
  <v-list-tile class="sidebar-profile">
	  <!--<app-section-loader :status="loader"></app-section-loader>-->
    <v-list-tile-avatar>
      <img
        alt="avatar"
        class="img-responsive"
        height="40"
        src="/static/avatars/user-13.jpg"
        width="40"
      >
    </v-list-tile-avatar>
    <v-list-tile-content class="ml-3">
      <v-list-tile-title>
        <span>{{user.name}}</span>
      </v-list-tile-title>
    </v-list-tile-content>
    <v-menu
      bottom
      content-class="userblock-dropdown"
      left
      nudge-right="0"
      nudge-top="-10"
      offset-y
      transition="slide-y-transition"
    >
      <v-btn
        class="ma-0"
        dark
        icon
        slot="activator"
      >
        <v-icon>more_vert</v-icon>
      </v-btn>
      <div class="dropdown-content">
        <div class="dropdown-top white--text primary">
          <span class="white--text fs-14 fw-bold d-block">{{user.name}}</span>
          <span class="d-block fs-12 fw-normal">{{user.email}}</span>
        </div>
        <v-list class="dropdown-list">
          <template
            v-for="userLink in userLinks"
            v-if="userLink.id !== 4"
          >
            <v-list-tile
              :key="userLink.id"
              @click="openModalEdit()"
            >
              <i :class="userLink.icon"></i>
              <span>{{$t(userLink.title)}}</span>
            </v-list-tile>
          </template>
          <template v-else>
            <v-list-tile
              :key="userLink.id"
              @click="logoutUser"
            >
              <i :class="userLink.icon"></i>
              <span>{{$t(userLink.title)}}</span>
            </v-list-tile>
          </template>
        </v-list>
      </div>
    </v-menu>

    <div>
      <v-container
        fluid
        grid-list-xl
        pt-0
      >
        <v-dialog
          max-width="600px"
          persistent
          v-model="editUserForm.dialog"
        >
          <v-card>
            <v-card-title>
              <span class="headline">Edit my profile</span>
            </v-card-title>
            <v-card-text>
              <v-form
                ref="editUserForm"
                v-model="editUserForm.valid"
              >
                <v-container
                  grid-list-md
                  pt-0
                >
                  <v-layout
                    row
                    wrap
                  >
                    <v-flex
                      md6
                      xs12
                    >
                      <v-text-field
                        :rules="editUserForm.rules"
                        append-icon="perm_identity"
                        clearable
                        counter
                        label="Name"
                        outline
                        required
                        v-model="editUserForm.name"
                      ></v-text-field>
                    </v-flex>
                    <v-flex
                      md6
                      xs12
                    >
                      <v-text-field
                        :rules="editUserForm.rules"
                        append-icon="perm_identity"
                        clearable
                        counter
                        label="Last Name"
                        outline
                        required
                        v-model="editUserForm.last_name"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        :rules="editUserForm.emailRules"
                        append-icon="email"
                        clearable
                        label="Email"
                        outline
                        required
                        type="Email"
                        v-model="editUserForm.email"
						disabled
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        :append-icon="editUserForm.showIconPassword ? 'visibility' : 'visibility_off'"
                        :rules="editUserForm.passwordRules"
                        :type="editUserForm.showIconPassword ? 'text' : 'password'"
                        @click:append="editUserForm.showIconPassword = !editUserForm.showIconPassword"
                        clearable
                        counter
                        hint="At least 8 characters"
                        label="Password"
                        outline
                        v-model="editUserForm.password"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row>
                    <v-flex xs12>
                      <v-text-field
                        :append-icon="editUserForm.showIconConfirmPassword ? 'visibility' : 'visibility_off'"
                        :error-messages="passwordMatchError"
                        :rules="editUserForm.passwordRules"
                        :type="editUserForm.showIconConfirmPassword ? 'text' : 'password'"
                        @click:append="editUserForm.showIconConfirmPassword = !editUserForm.showIconConfirmPassword"
                        clearable
                        counter
                        hint="At least 8 characters"
                        label="Confirm Password"
                        outline
                        v-model="editUserForm.confirmPassword"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-layout row v-if="canEditUsernameRocketChat">
                    <v-flex
                      sm6
                      xs12
                    >
                      <v-text-field 
                        :rules="editUserForm.rules"
                        append-icon="perm_identity"
                        clearable
                        label="User name Rocket chat"
                        outline
                        required="canEditUsernameRocketChat"
                        v-model="editUserForm.username_rocketchat"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="editUserForm.dialog = false"
                color="error"
                small
              >Cancel</v-btn>
              <v-btn
                @click="onEdit()"
                color="primary"
                small
                :loading="loading"
              >Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </div>
  </v-list-tile>
</template>

<script>
import { getCurrentAppLayout } from 'Helpers/helpers'
import apiwithheader from '../../api/apiwithheader.js'
export default {
  mixins: [apiwithheader],
  data() {
    return {
      loading:false,
      rolesList: [],
      userLinks: [
        {
          id: 1,
          title: 'message.userProfile',
          icon: 'ti-user mr-3 primary--text',
          path: '/users/user-profile'
        }, 
        {
          id: 4,
          title: 'message.logOut',
          icon: 'ti-power-off mr-3 error--text'
        }
      ],
      editUserForm: {
		    id:null,
        username_rocketchat: null,
        valid: false,
        dialog: false,
        name: '',
        last_name: '',
        email: '',
        role_id: '',
        password: '',
        confirmPassword: '',
        selectedRole: null,
        showIconPassword: false,
        showIconConfirmPassword: false,
        rules: [(v) => !!v || 'Please, specify the name'],
        passwordRules: [
          //v => v.length >= 8 || "Min 8 characters"
        ],
        rolesRules: [(v) => !!v || 'Please, select a role'],
        emailRules: [
          (v) => !!v || 'Please, enter the email',
          (v) => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(v) || 'Invalid e-mail.'
          }
        ],
        _method: 'put'
      },
      canEditUsernameRocketChat: false,
      role:"Admin"
    }
  },
  created() {
    this.canEditUsernameRocketChat = true;
  },
  methods: {
    logoutUser() {
      this.$store.dispatch('logoutUserFromFirebase', this.$router)
    },
    getMenuLink(path) {
      return '/' + getCurrentAppLayout(this.$router) + path
    },
	onEdit() {
      if (this.$refs.editUserForm.validate()) {
        this.loader = true;
        this.loading=true;
        this.api()
          .post("user/" +  this.editUserForm.id, this.editUserForm)
          .then(response => {
            this.loader = false;
            this.loading=false;

            this.editUserForm.dialog = false;
            this.snackbar = true;
            this.snackbarMessage = response.data.message;
            this.$refs.editUserForm.reset();
          })
          .catch(error => {
            console.log(error);
            this.loading=false;

          });
      }
    },
    openModalEdit(selectedUser) {
      var user = JSON.parse(localStorage.getItem('user'))
      if (user != '' && user != null) {
        console.log(user)
        this.editUserForm.id = user.user.id;
        this.selectedUserEdit = selectedUser;
        this.editUserForm.name = user.user.name;
        this.editUserForm.last_name = user.user.last_name;
        this.editUserForm.email = user.user.email;
      }
      this.editUserForm.dialog = true
    }
  },
  computed: {
    passwordMatchError() {
      return this.editUserForm.password === this.editUserForm.confirmPassword ? '' : 'Password must match'
    }
  }
}
</script>
