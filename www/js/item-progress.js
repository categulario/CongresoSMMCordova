// the progress bar component
Vue.component('item-progress', {
  props: [
    'from',
    'to',
    'hour',
  ],

  computed: {
    progressBarWidth: function () {
      var from_hour = this.hourToDecimal(this.from);
      var to_hour = this.hourToDecimal(this.to);
      var cur_hour = this.hourToDecimal(this.hour);
      var value = (cur_hour - from_hour)/(to_hour - from_hour)*100;

      if (value < 0) {
        return '0%';
      } else if (value > 100) {
        return '100%';
      } else {
        return `${value}%`;
      }
    },
  },

  methods: {
    hourToDecimal: function (hour) {
      var pieces = hour.split(':').map(p => parseInt(p));

      return pieces[0] + pieces[1]/60;
    },
  }
});
