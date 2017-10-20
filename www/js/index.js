window.App = new Vue({
  data: {
    title: 'Encuentra charlas',
    schedule: [],
    marks: [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
    ],
    last_checksum: '',
    section: 'home',
    left_icon: 'fa-bars',
    left_action: null,
    currentHour: moment().format('HH:mm'),
    sections: {
      home: {
        title: 'Encuentra charlas',
        left_icon: 'fa-bars',
        left_action: null,
      },
      find: {
        title: 'Busca pláticas',
        left_icon: 'fa-search',
        left_action: 'home',
      },
      schedule: {
        title: 'Charlas',
        left_icon: 'fa-arrow-left',
        left_action: 'home',

        subs: {
          now: {
            title: 'Charlas ahora',
            default_filter: 'talksHappeningNow',
          },
          next: {
            title: 'Charlas siguientes',
            default_filter: 'talksHappeningNext',
          },
          today: {
            title: 'Programa hoy',
            default_filter: 'talksToday',
          },

          // Routes by day
          day1: { title: 'Programa Lunes', default_filter: 'talksDay1' },
          day2: { title: 'Programa Martes', default_filter: 'talksDay2' },
          day3: { title: 'Programa Miércoles', default_filter: 'talksDay3' },
          day4: { title: 'Programa Jueves', default_filter: 'talksDay4' },
          day5: { title: 'Programa Viernes', default_filter: 'talksDay5' },

          // Routes by area
          area1: { title: 'Cursos', default_filter: 'talksArea1' },
          area2: { title: 'Ponencias', default_filter: 'talksArea2' },
          area3: { title: 'Reportes de tesis', default_filter: 'talksArea3' },
        },
      },
    },
  },

  mounted: function () {
    this.setLoader('Verificando datos...');

    var last_time = localStorage.getItem('last_update');

    if (!last_time) {
      reqwest('http://www.smm.org.mx/API/ponencias.php', function (resp) {
        var ponencias = [];

        resp.ponencias.forEach(function (ponencia) {
          ponencias.push(ponencia);
        }.bind(this));

        this.schedule = ponencias;

        this.unsetLoader();
      }.bind(this));
    }
  },

  created: function () {
    setInterval(function () {
      this.currentHour = moment().format('HH:mm');
    }.bind(this), 2000);
  },

  computed: {
    talksHappeningNow: function () {
      var now = this.currentHour;
      var day = moment().format('d');

      return this.schedule.filter((talk) => {
        return talk.day == day && talk.from <= now && talk.to > now;
      });
    },

    nextTime: function () {
      var now = this.currentHour;

      return this.marks.find(item => item > now);
    },

    talksHappeningNext: function () {
      var day = moment().format('d');
      var nextTime = this.nextTime;

      return this.schedule.filter((talk) => {
        return talk.day == day && talk.from <= nextTime && talk.to > nextTime;
      });
    },

    talksToday: function () {
      var day = moment().format('d');

      return this.schedule.filter((talk) => {
        return talk.day == day;
      });
    },

    // filters by day
    talksDay1: function () { return this.schedule.filter((talk) => talk.day == '1') },
    talksDay2: function () { return this.schedule.filter((talk) => talk.day == '2') },
    talksDay3: function () { return this.schedule.filter((talk) => talk.day == '3') },
    talksDay4: function () { return this.schedule.filter((talk) => talk.day == '4') },
    talksDay5: function () { return this.schedule.filter((talk) => talk.day == '5') },

    // filters by area
    talksArea1: function () { return this.schedule.filter((talk) => talk.area == 'Cursos') },
    talksArea2: function () { return this.schedule.filter((talk) => talk.area == 'Ponencias') },
    talksArea3: function () { return this.schedule.filter((talk) => talk.area == 'R. de tesis') },
  },

  methods: {
    setLoader: function (msg) {
      document.getElementById('loader-message').innerHTML = msg;
      document.getElementById('loader').className = 'on';
    },

    unsetLoader: function () {
      document.getElementById('loader').className = 'off';
    },

    talksNowClick: function () {
      this.changeSection('schedule', 'now');
    },

    talksNextClick: function () {
      this.changeSection('schedule', 'next');
    },

    scheduleClick: function () {
      this.changeSection('schedule', 'today');
    },

    findTalksClick: function () {
      this.changeSection('find');
    },

    runLeftAction: function () {
      if (this.left_action === null) {
        this.showPanel();
        return;
      }

      this.changeSection(this.left_action);
    },

    scheduleByDay: function (event) {
      var day = event.target.dataset.day;

      this.changeSection('schedule', `day${day}`);
    },

    scheduleByArea: function (event) {
      var area = event.target.dataset.area;

      this.changeSection('schedule', `area${area}`);
    },

    showPanel: function () {
      document.getElementById('left-panel').classList = [];
      document.getElementById('overlay').classList = [];
    },

    hidePanel: function () {
      document.getElementById('left-panel').className = "off";
      document.getElementById('overlay').className = "off";
    },

    changeSection: function (section, sub) {
      this.hidePanel();

      this.section = section;
      this.title = this.sections[section].title;
      this.left_icon = this.sections[section].left_icon;
      this.left_action = this.sections[section].left_action;

      if (this.sections[section].subs && sub) {
        this.title = this.sections[section].subs[sub].title;
        this.default_filter = this.sections[section].subs[sub].default_filter;
      }
    },
  },
});

document.addEventListener('deviceready', function () {
  App.$mount('#app');
}, false);
