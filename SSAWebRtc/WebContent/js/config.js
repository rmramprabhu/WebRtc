require.config({
  baseUrl : 'js',
  waitSeconds : 20,
  paths : {
    jquery : '../thirdparty/jquery.min',
    bootstrap: '../thirdparty/bootstrap/js/bootstrap.min',

    connection : 'connection',
    callUtitlity : 'callUtitlity',
    callUI : 'callUI',
    msrp : 'msrp',
    msrpSettings : 'msrpSettings',
    callSettings : 'callSettings'

  },

  shim : {
    jquery : {
      exports : [ 'jQuery', '$' ]
    },
    bootstrap : {
      deps : [ 'jquery' ]
    }
  }

});