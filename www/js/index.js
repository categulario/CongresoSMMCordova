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
    daymap: [
      'domingo',
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ],
    searchterm: '',
    sections: {
      home: {
        title: 'Encuentra charlas',
        left_icon: 'fa-bars',
        left_action: null,
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
          find: {
            title: 'Buscar en todas partes',
            default_filter: 'all',
          },

          // Routes by day
          day1: { title: 'Programa Lunes', default_filter: 'talksDay1' },
          day2: { title: 'Programa Martes', default_filter: 'talksDay2' },
          day3: { title: 'Programa Miércoles', default_filter: 'talksDay3' },
          day4: { title: 'Programa Jueves', default_filter: 'talksDay4' },
          day5: { title: 'Programa Viernes', default_filter: 'talksDay5' },
        },
      },
    },
  },

  mounted: function () {
    this.setLoader('Iniciando la magia...');

    var last_time = localStorage.getItem('last_update');

    if (!last_time) {
      this.setLoader('No tengo el horario, descargando...');

      reqwest('http://www.smm.org.mx/API/ponencias.php', function (resp) {
        var ponencias = [];

        resp.ponencias.forEach(function (ponencia) {
          var blob = '';

          [
            "place",
            "area",
            "title",
            "author",
          ].forEach(function (prop) {
            blob += ' - ' + (ponencia[prop] || '');
          });

          ponencia.blob = this.normalize(blob);

          ponencias.push(ponencia);
        }.bind(this));

        ponencias.sort(function (a, b) {
          return a.from > b.from;
        });

        this.schedule = ponencias;

        this.setLoader('Guardando información...');
        this.persistSchedule();
        this.unsetLoader();
      }.bind(this), function (err) {
        this.setLoader('Error de conexión ):');
      }.bind(this));
    } else {
      this.setLoader('Me se el horario de memoria, cargando...');
      this.schedule = this.recoverPersistedSchedule();
      this.unsetLoader();
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
      var day = this.daymap[moment().format('d')];

      return this.schedule.filter((talk) => {
        return talk.day == day && talk.from <= now && talk.to > now;
      });
    },

    nextTime: function () {
      var now = this.currentHour;

      return this.marks.find(item => item > now);
    },

    talksHappeningNext: function () {
      var day = this.daymap[moment().format('d')];
      var nextTime = this.nextTime;

      return this.schedule.filter((talk) => {
        return talk.day == day && talk.from <= nextTime && talk.to > nextTime;
      });
    },

    talksToday: function () {
      var day = this.daymap[moment().format('d')];

      return this.schedule.filter((talk) => {
        return talk.day == day;
      });
    },

    all: function () {
      return this.schedule;
    },

    // filters by day
    talksDay1: function () { return this.schedule.filter((talk) => talk.day == 'lunes') },
    talksDay2: function () { return this.schedule.filter((talk) => talk.day == 'martes') },
    talksDay3: function () { return this.schedule.filter((talk) => talk.day == 'miercoles') },
    talksDay4: function () { return this.schedule.filter((talk) => talk.day == 'jueves') },
    talksDay5: function () { return this.schedule.filter((talk) => talk.day == 'viernes') },
  },

  methods: {
    normalize: function (s) {
      var r = s.toLowerCase();

      r = r.replace(new RegExp(/[àáâãäå]/g),"a");
      r = r.replace(new RegExp(/[èéêë]/g),"e");
      r = r.replace(new RegExp(/[ìíîï]/g),"i");
      r = r.replace(new RegExp(/ñ/g),"n");
      r = r.replace(new RegExp(/[òóôõö]/g),"o");
      r = r.replace(new RegExp(/[ùúûü]/g),"u");

      return r;
    },

    randomMessage: function () {
      var max = 10;
      return [
        've a comer algo.',
        've a explorar la ciudad.',
        'salta en una pierna.',
        'párate de cabeza.',
        'aprende a programar.',
        'háblale a un extraño.',
        'aprende esperanto.',
        'trepa un árbol.',
        'cómprate algo lindo.',
        'instala linux.',
      ][Math.floor(Math.random() * max)];
    },

    filterSearch: function (item) {
      var st = this.normalize(this.searchterm);

      if (!st) {
        return true;
      } else {
        return item.blob.indexOf(st) >= 0;
      }
    },

    persistSchedule: function () {
      this.schedule.forEach(function (item) {
        localStorage.setItem('item:'+item.id, JSON.stringify(item));
      });

      localStorage.setItem('items', JSON.stringify(this.schedule.map(function (i) {
        return i.id;
      })));

      localStorage.setItem('last_update', moment().toISOString());
    },

    recoverPersistedSchedule: function () {
      return JSON.parse(localStorage.getItem('items')).map(function (i) {
        return JSON.parse(localStorage.getItem('item:'+i));
      });
    },

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
      this.changeSection('schedule', 'find');
    },

    clearSearch: function () {
      this.searchterm = '';
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
