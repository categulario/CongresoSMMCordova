window.App = new Vue({
  data: {
    title: 'Encuentra charlas',
    schedule: [],
    talk: {},
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
    dayimap: {
      'domingo'   : 0,
      'lunes'     : 1,
      'martes'    : 2,
      'miercoles' : 3,
      'jueves'    : 4,
      'viernes'   : 5,
      'sabado'    : 6,
    },
    searchterm: '',
    sections: {
      home: {
        title: 'Encuentra charlas',
        left_icon: 'fa-bars',
        left_action: null,
      },
      talk: {
        title: 'Plática',
        left_icon: 'fa-arrow-left',
        left_action: 'back',
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
          star: {
            title: 'Mis pláticas favoritas',
            default_filter: 'starFilter',
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
      this.loadData();
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

    starFilter: function () {
      return this.schedule.filter(function (talk) {
        return talk.star;
      });
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
        'como que hace hace hambre ¿no?',
        'lo mejor sería ir a explorar la ciudad',
        'es momento de organizar la reta de peteca',
        '¿ya te sabes parar de cabeza?',
        'mejor aprende un lenguaje nuevo de programación',
        'el momento ideal para hacer amigos de otro estado',
        'quizá es momento de aprender esperanto',
        'es tiempo perfecto para trepar un árbol',
        '¿ya compraste recuerditos locales?',
        'el momento ideal para instalar linux',
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

    scheduleByStar: function () {
      this.changeSection('schedule', 'star');
    },

    scheduleByArea: function (event) {
      var area = event.target.dataset.area;

      this.changeSection('schedule', `area${area}`);
    },

    toggleStar: function (event) {
      var id = event.currentTarget.dataset.id;

      this.schedule = this.schedule.map(function (talk) {
        if (talk.id == id) {
          talk.star = ! talk.star;
        }

        return talk;
      });

      this.persistSchedule();
    },

    reloadSchedule: function () {
      this.loadData();
    },

    loadData: function () {
      this.setLoader('Descargando horario...');

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
          if (a.day == b.day) {
            return a.from > b.from;
          }

          return this.dayimap[a.day] > this.dayimap[b.day];
        }.bind(this));

        this.schedule = ponencias;

        this.setLoader('Guardando información...');
        this.persistSchedule();
        this.unsetLoader();
      }.bind(this), function (err) {
        this.unsetLoader();
        console.log(err);
        alert('Error de conexión');
      }.bind(this));
    },

    showTalk: function (event) {
      var id = event.currentTarget.dataset.id;

      this.setLoader('Descargando abstract...');

      reqwest('http://www.smm.org.mx/API/ponencia.php?id='+id, function (res) {
        this.talk = res.ponencias[0];
        this.changeSection('talk');
        this.unsetLoader();
      }.bind(this), function (err) {
        alert('Error de conexión');
        this.unsetLoader();
      }.bind(this));
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
