var res = {};

Template.personinfo.created = function () {
	res = this.data;
}

Template.personinfo.helpers({
  name: function () {
    return res.who;
  },
  phone: function () {
    return res.phone;
  },
  dest: function () {
    var dest = Destinations.findOne({uid: res.uid});
    if (dest != undefined){
      return dest.destAddress;
    } else {
      return "N/A";
    }
  },
  when: function () {
    return moment(res.when).format('llll');;
  }
});
