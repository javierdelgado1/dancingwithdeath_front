<template>
  <div>
    <page-title-bar></page-title-bar>
    <v-container fluid grid-list-xl pt-0>
      <v-layout row wrap>
        <app-card :fullBlock="true" colClasses="xl12 lg12 md12 sm12 xs12">
          <v-card-title>
            <v-btn fab dark small icon color="green" title="Refresh" @click="getTablesData()">
              <v-icon class="zmdi zmdi-refresh"></v-icon>
            </v-btn>
            <v-dialog v-model="form.dialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" medium dark v-on="on ">
                  <i class="material-icons">add</i>
                  {{$t('message.addNew')}}
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline" v-if="!isEdit">{{$t('message.add_appointment')}}</span>
                  <span class="headline" v-else>{{$t('message.edit_appointment')}}</span>
                </v-card-title>
                <v-card-text>
                  <v-form ref="formSave" v-model="form.valid" lazy-validation>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12>
                          <v-menu
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            :return-value.sync="date"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="form.date"
                                label="Date"
                                append-icon="event"
                                outline
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker 
                                v-model="form.date"
                                no-title
                                scrollable
                                :available-dates='{ start: new Date(), end: null }'
                                :disabled-dates='disabledDates'>
                              <v-spacer></v-spacer>
                              <v-btn flat color="primary" @click="menu = false">{{$t('message.btn_cancel')}}</v-btn>
                              <v-btn flat color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                            </v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex xs12>
                          <v-autocomplete
                            v-model="form.hour"
                            :rules="hourRules"
                            :items="hours"
                            label="Hour"
                            placeholder="Select a hour"
                            append-icon="domain"
                            outline
                            required
                          ></v-autocomplete>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="closedModal()" small>{{$t('message.btn_cancel')}}</v-btn>
                  <v-btn
                    color="primary"
                    @click="onSave()"
                    :disabled="!form.valid"
                    :loading="datatableLoader"
                    small
                  >{{$t('message.btn_check')}}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-spacer></v-spacer>
            <v-text-field
              append-icon="search"
              label="Seach"
              single-line
              hide-details
              v-model="search"
            ></v-text-field>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="books"
            :search="search"
            :loading="datatableLoader"
          >
            <template slot="headerCell" slot-scope="props">
              <v-tooltip bottom>
                <span slot="activator">{{ props.header.text }}</span>
                <span>{{ props.header.text }}</span>
              </v-tooltip>
            </template>
            <template slot="items" slot-scope="props">
              <td>{{ formatDate( props.item.date, "DD-MM-YYYY") }}</td>
              <td>{{ props.item.available_hours_id.hour}}</td>
              <td>{{ props.item.user_id.email }}</td>
              <td class="text-center">
                <v-btn fab dark small icon color="primary" @click="openModalEdit(props.item)">
                  <v-icon class="zmdi zmdi-edit"></v-icon>
                </v-btn>
                <v-btn
                  fab
                  dark
                  small
                  icon
                  color="error"
                  @click="onDeleteAppointment(props.item)"
                  class="trash-icon"
                >
                  <v-icon class="zmdi zmdi-delete"></v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
          <v-snackbar :top="y === 'top'" :timeout="timeout" v-model="snackbar">{{ snackbarMessage }}</v-snackbar>
          <delete-confirmation-dialog
            ref="deleteConfirmationDialog"
            heading="Delete confirmation"
            message="Are you sure you want to delete this appointment?"
            @onConfirm="deleteAppointment"
          ></delete-confirmation-dialog>
        </app-card>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import api from "Api";
import { filterIt } from "Helpers/helpers";
import apiwithheader from "../../api/apiwithheader.js";
import moment from "moment";

export default {
  mixins: [apiwithheader],
  data() {
    return {
      menu: false,
      date: null,
      isEdit: false,
      form: {
        valid: true,
        dialog: false,
        selected: null,
        hour: null,
        date: null
      },
      deleteForm: {
        selected: null
      },
      books: [],
      hours_object: [],
      hours: [],
      search: "",
      headers: [
        {
          text: "Date",
          sortable: true,
          value: "date"
        },
        {
          text: "Hour",
          sortable: true,
          value: "available_hours_id.hour"
        },
        {
          text: "User email",
          sortable: true,
          value: "user_id.email"
        },
        { text: "Actions", sortable: false, align: "center" }
      ],
      hourRules: [v => !!v || "Please, select a hour"],
      datatableLoader: true,
      snackbar: false,
      snackbarMessage: "",
      timeout: 2000,
      y: "top",
      disabledDates: { weekdays: [1, 7] }
    };
  },
  async mounted() {
    await this.getTablesData();
    await this.getHoursAvailables();
    this.datatableLoader = false;
  },
  methods: {
    formatDate(date, format) {
      return moment(date).format(format);
    },
    onSave() {
      if (this.$refs.formSave.validate()) {
        this.datatableLoader = true;
        let result = filterIt(this.hours_object, this.form.hour, "hour");
        let hoursId = result.length > 0 ? result[0].id : null;
        this.form.hour_id = hoursId;
       // debugger;
        if (!this.isEdit) {
          this.api()
            .post("booking", this.form)
            .then(response => {
              this.checkResponse(response);
            })
            .catch(error => {
              this.datatableLoader = false;
              this.code401(error);
            });
        } else {
          this.api()
            .post("booking/" + this.form.selected.id, {
              date: this.form.date,
              hour_id: this.form.hour_id,
              _method: "put"
            })
            .then(response => {
              this.checkResponse(response);
            })
            .catch(error => {
              this.datatableLoader = false;
              this.code401(error);
              this.isEdit = false;
            });
        }
      }
    },
    checkResponse(response){
        if (
            response.data.status == "error" &&
            response.data.message ==
                "The death has an appointment at this time, I'm sorry, try another time"
            ) {
                this.isEdit =true;
            }
            if (
            response.data.status == "error" &&
            response.data.message ==
                "Invalid date, death only dances on weekdays"
            ) {
                this.snackbarMessage = response.data.message;
            }
       
        if(response.data.status == "success"){
            this.getTablesData();
            this.$refs.formSave.reset();
            this.form.dialog = false;
            this.isEdit = false;
        }
        this.snackbarMessage = response.data.message;
        this.datatableLoader = false;
        this.snackbar = true;
    },
    openModalEdit(selected) {
      this.form.dialog = true;
      this.form.selected = selected;
      this.form.date = selected.date;
      this.form.hour = selected.available_hours_id.hour;
      this.isEdit = true;
    },
    onDeleteAppointment(selected) {
      this.$refs.deleteConfirmationDialog.openDialog();
      this.deleteForm.selected = selected.id;
    },
    deleteAppointment() {
      this.datatableLoader = true;
      let deletedAppointment = this.books;
      let index = deletedAppointment.indexOf(this.deleteForm.selected);
      this.$refs.deleteConfirmationDialog.close();

      this.api()
        .delete("booking/" + this.deleteForm.selected)
        .then(response => {
          setTimeout(() => {
            this.books.splice(index, 1);
            this.snackbarMessage = response.data.message;
            this.datatableLoader = false;
            this.snackbar = true;
            this.deleteForm.selected = null;
          }, 500);
        })
        .catch(error => {
          this.datatableLoader = false;
          this.code401(error);
        });
    },
    async getTablesData() {
      this.datatableLoader = true;
      return this.api()
        .get("booking")
        .then(response => {
          this.books = response.data;
          this.datatableLoader = false;
        })
        .catch(error => {
          console.log(error);
          this.code401(error);
          this.datatableLoader = false;
        });
    },
    closedModal() {
      this.$refs.formSave.reset();
      this.form.dialog = false;
      this.isEdit = false;

    },
    async getHoursAvailables() {
      this.datatableLoader = true;
      return this.api()
        .get("get_hours_availables")
        .then(response => {
          this.hours_object = response.data.Booking;
          response.data.Booking.forEach(element => {
            this.hours.push(element.hour);
          });
          this.datatableLoader = false;
        })
        .catch(error => {
          console.log(error);
          this.code401(error);
          this.datatableLoader = false;
        });
    }
  }
};
</script>
