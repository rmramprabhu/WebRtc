var $$FSR = {
  'enabled': true,
  'frames': false,
  'sessionreplay': true,
  'auto': true,
  'encode': true,
  'version': '18.1.4',
  'files': '/foresee/',
  // The 'swf_files' attribute needs to be set when foresee_transport.swf is not located at 'files'
  //'swf_files': '/some/other/location/'
  'id': 'TV7AmpuatC8KshccfhpXDQ==',
  'definition': 'foresee_surveydef.js',
  'swf': {
    'fileName': 'foresee_transport.swf',
    'scriptAccess': 'always'
  },
  'worker': 'foresee_worker.js',
  'embedded': false,
  'replay_id': 'ssa.gov',
  'site_id': 'ssa.gov',
  'attach': false,
  'renderer': 'W3C',
  // or "ASRECORDED"
  'layout': 'CENTERFIXED',
  // or "LEFTFIXED" or "LEFTSTRETCH" or "CENTERSTRETCH"
  'triggerDelay': 0,
  'heartbeat': true,
  'enableAMD': false,
  'pools': [{
    'path': '.',
    'sp': 100 // CHANGE ONLY WHEN INCLUDING SESSION REPLAY
  }],
  'sites': [{
    'path': /\w+-?\w+\.(com|org|edu|gov|net|co\.uk)/
  },
  {
    'path': '.',
    'domain': 'default'
  }],
  'storageOption': 'cookie',
  'nameBackup': window.name,
  'iframeHrefs': ["frameWorker.html"],
  'acceptableorigins': []
};

$$FSR.FSRCONFIG = {};

(function (config) {

  var FSR, supports_amd = !! config.enableAMD && typeof(_4c.global["define"]) === 'function' && !! _4c.global["define"]["amd"];

  if (!supports_amd) FSR = window.FSR;
  else FSR = {};
/*
 * ForeSee Survey Def(s)
 */
  FSR.surveydefs = [{
    name: 'phone',
    section: 'main',
    platform: 'phone',
    invite: {
      when: 'onentry',
      // Mobile
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback.",
          blurb: "Thank you for visiting SSA.gov. You have been selected to participate in a brief customer satisfaction survey to let us know how we can improve your experience.",
          attribution: "Conducted by ForeSee.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll help",
          error: "Error",
          warnLaunch: "this will launch a new window"
        }]
      ]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 20,
      lf: 4
    },
    include: {
      urls: ['.']
    }
  },
  {
    name: 'browse',
    section: 'rome',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for visiting socialsecurity.gov and using our electronic services. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
          //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback"
        }]
      ]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 15,
      lf: 1
    },
    include: {
      urls: ['rome_survey.html']
    }
  },
  {
    name: 'browse',
    section: 'BSO',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for visiting the <b style='font-weight:bold'>Business Services Online</b> section of the SSA.gov site. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
          //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback"
        }]
      ]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 50,
      lf: 1
    },
    include: {
      urls: ['bsosurvey.html']
    }
  },
  {
    name: 'browse',
    section: 'MedicareSubsidy',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [{
        reverseButtons: false,
        headline: "We'd welcome your feedback!",
        blurb: "Thank you for visiting the SSA.gov site and using the <b style='font-weight:bold'>online application for Help with Medicare Prescription Plan Drug Costs</b>. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
        //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
        attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
        closeInviteButtonText: "Click to close.",
        declineButton: "No, thanks",
        acceptButton: "Yes, I'll give feedback",
        locales: {
          "es": {
            reverseButtons: false,
            headline: "Nos gustaría recibir sus comentarios.",
            blurb: "Gracias por visitar el sitio de Internet segurosocial.gov y usar la solicitud para El Beneficio Adicional con los gastos del plan de medicamentos recetados de Medicare. Usted ha sido seleccionado para participar en una encuesta de satisfacción del cliente para hacernos saber cómo podemos mejorar su experiencia por Internet.",
            //noticeAboutSurvey: "La encuesta está diseñada para medir toda su experiencia con nosotros, sírvase buscarla al finalizar su visita.",
            attribution: "Esta encuesta se realiza a través de una empresa independiente, ForeSee, en nombre del sitio que usted está visitando.",
            closeInviteButtonText: "Haga clic para cerrar.",
            declineButton: "No, gracias",
            acceptButton: "Sí, responderé"
          }
        }
      }]
    },

    pop: {
      when: 'now'
    },
    criteria: {
      sp: 100,
      lf: 1,
      locales: [{
        locale: 'es',
        sp: 100,
        lf: 1
      }]
    },
    include: {
      urls: ['i1020_survey.html', 'i1020/encuesta.html']
    }
  },
  {
    name: 'browse',
    section: 'DisabilityReport',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for visiting the SSA.gov site and using the <b style='font-weight:bold'>internet Disability Report</b> service. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
          //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback"
        }]
      ]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 100,
      lf: 1
    },
    include: {
      urls: ['radr_close.html', 'i3368_submit.html', 'i3368_save.html']
    }
  },
  {
    name: 'browse',
    section: 'iClaims',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [{
        reverseButtons: false,
        headline: "We'd welcome your feedback!",
        blurb: "Thank you for visiting the SSA.gov site and using the <b style='font-weight:bold'>Benefit Application</b>. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
        //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
        attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
        closeInviteButtonText: "Click to close.",
        declineButton: "No, thanks",
        acceptButton: "Yes, I'll give feedback",
        locales: {
          "es": {
            reverseButtons: false,
            headline: "Nos gustaría recibir sus comentarios",
            blurb: "Gracias por visitar el sitio de Internet segurosocial.gov y usar la solicitud para sus <b style='font-weight:bold'>Beneficios Sociales</b>. Usted ha sido seleccionado para participar en una encuesta de satisfacción del cliente para hacernos saber cómo podemos mejorar su experiencia por Internet.",
            //noticeAboutSurvey: "La encuesta está diseñada para medir toda su experiencia con nosotros, sírvase buscarla al finalizar su visita.",
            attribution: "Esta encuesta se realiza a través de una empresa independiente, ForeSee, en nombre del sitio que usted está visitando.",
            closeInviteButtonText: "Haga clic para cerrar.",
            declineButton: "No, gracias",
            acceptButton: "Sí, responderé"
          }
        }
      }]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 100,
      lf: 1,
      locales: [{
        locale: 'es',
        sp: 15,
        lf: 1
      }]
    },
    include: {
      urls: ['launchSurvey.html', 'isba_close.html', 'iClaim/encuesta.html', 'espanol/jubilacion2/gracias-cerrar.htm', 'iclaim_submit.html', 'iclaim_save.html', 'iclaim_submit-es.html', 'iclaim_save-es.html']
    }
  },
  {
    name: 'browse',
    section: 'iAppeal',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for using the Social Security Administration's online disability appeal. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
          //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback"
        }]
      ]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 100,
      lf: 1
    },
    include: {
      urls: ['iAppeal_close.html']
    }
  },
  {
    name: 'browse',
    section: 'RetireEst',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [{
        reverseButtons: false,
        headline: "We'd welcome your feedback!",
        blurb: "Thank you for using the Retirement Estimator on the SSA.gov site. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
        //noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
        attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
        closeInviteButtonText: "Click to close.",
        declineButton: "No, thanks",
        acceptButton: "Yes, I'll give feedback",
        locales: {
          "es": {
            reverseButtons: false,
            headline: "Nos gustaría sus sugerencias.",
            blurb: "Gracias por usar el Calculador de beneficios por jubilación en el sitio de Internet segurosocial.gov. Ha sido seleccionado al azar para participar en una encuesta de nivel de satisfacción del cliente para hacernos saber cómo podemos mejorar su experiencia en nuestro sitio de Internet.",
            //noticeAboutSurvey: "La encuesta está diseñada para medir toda su experiencia con nosotros, sírvase buscarla al finalizar su visita.",
            attribution: "Esta encuesta se realiza a través de una empresa independiente, ForeSee, en nombre del sitio que usted está visitando.",
            closeInviteButtonText: "Haga clic para cerrar.",
            declineButton: "No, gracias",
            acceptButton: "Sí, responderé"
          }
        }
      }]
    },
    pop: {
      when: 'now'
    },
    criteria: {
      sp: 30,
      lf: 1,
      locales: [{
        locale: 'es',
        sp: 100,
        lf: 1
      }]
    },
    include: {
      urls: ['re_close.html', 're_close_es.html']
    }
  },
  {
    name: 'browse',
    section: 'main',
    platform: 'desktop',
    invite: {
      when: 'onentry',
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for visiting the SSA.gov site. You have been randomly selected to participate in a customer satisfaction survey to let us know how we can improve your website experience.",
          noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback"
        }]
      ]
    },
    lock: 1,
    pop: {
      when: 'later',
      what: 'qualifier'
    },
    criteria: {
      sp: 5,
      lf: 3
    },
    include: {
      urls: ['.']
    }
  }];

/*
 * ForeSee Properties
 */
  FSR.properties = {
    repeatdays: 0,

    repeatoverride: false,

    altcookie: {},

    language: {
      locale: 'en',
      src: 'location',
      locales: [{
        match: 'segurosocial',
        locale: 'es'
      },
      {
        match: 're_close_es',
        locale: 'es'
      },
      {
        match: 'encuesta.html',
        locale: 'es'
      },
      {
        match: 'gracias-cerrar.htm',
        locale: 'es'
      },
      {
        match: 'iclaim_submit-es.html',
        locale: 'es'
      },
      {
        match: 'iclaim_save-es.html',
        locale: 'es'
      }]
    },

    exclude: {},

    ignoreWindowTopCheck: false,

    ipexclude: 'fsr$ip',

    mobileHeartbeat: {
      delay: 60,
      /*mobile on exit heartbeat delay seconds*/
      max: 3600 /*mobile on exit heartbeat max run time seconds*/
    },

    invite: {

      // For no site logo, comment this line:
      siteLogo: "sitelogo.gif",

      //alt text fore site logo img
      siteLogoAlt: "",

      /* Desktop */
      dialogs: [
        [{
          reverseButtons: false,
          headline: "We'd welcome your feedback!",
          blurb: "Thank you for visiting our website. You have been selected to participate in a brief customer satisfaction survey to let us know how we can improve your experience.",
          noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
          attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
          closeInviteButtonText: "Click to close.",
          declineButton: "No, thanks",
          acceptButton: "Yes, I'll give feedback",
          error: "Error",
          warnLaunch: "this will launch a new window"
        }]
      ],



      exclude: {
        urls: ['mwww.ba.ssa.gov', 'dev-ocomm.ba.ssa.gov', 'search.socialsecurity.gov'],
        referrers: [],
        userAgents: [],
        browsers: [],
        cookies: [],
        variables: []
      },
      include: {
        local: ['.']
      },

      delay: 0,
      timeout: 0,

      hideOnClick: false,

      hideCloseButton: false,

      css: 'foresee_dhtml.css',

      hide: [],

      hideFlash: false,

      type: 'dhtml',
      /* desktop */
      // url: 'invite.html'
      /* mobile */
      url: 'invite-mobile.html',
      back: 'url'

      //SurveyMutex: 'SurveyMutex'
    },

    tracker: {
      width: '690',
      height: '415',

      // Timeout is the normal between-page timeout
      timeout: 10,

      // Fast timeout is when we think there's a good chance we've closed the browser
      fasttimeout: 4,

      adjust: true,
      alert: {
        enabled: true,
        message: 'The survey is now available.'
      },
      url: 'tracker.html'
    },

    survey: {
      width: 690,
      height: 600
    },

    qualifier: {
      footer: '<div id=\"fsrcontainer\"><div style=\"float:left;width:80%;font-size:8pt;text-align:left;line-height:12px;\">This survey is conducted by an independent company ForeSee,<br>on behalf of the site you are visiting.</div><div style=\"float:right;font-size:8pt;\"><a target="_blank" title="Validate TRUSTe privacy certification" href="//privacy-policy.truste.com/click-with-confidence/ctv/en/www.foreseeresults.com/seal_m"><img border=\"0\" src=\"{%baseHref%}truste.png\" alt=\"Validate TRUSTe Privacy Certification\"></a></div></div>',
      width: '690',
      height: '775',
      bgcolor: '#333',
      opacity: 0.7,
      x: 'center',
      y: 'center',
      delay: 0,
      buttons: {
        accept: 'Continue'
      },
      hideOnClick: false,
      css: 'foresee_dhtml.css',
      url: 'qualifying.html'
    },

    cancel: {
      url: 'cancel.html',
      width: '690',
      height: '400'
    },

    pop: {
      what: 'survey',
      after: 'leaving-site',
      pu: false,
      tracker: true
    },

    meta: {
      referrer: true,
      terms: true,
      ref_url: true,
      url: true,
      url_params: false,
      user_agent: false,
      entry: false,
      entry_params: false
    },

    events: {
      enabled: true,
      id: true,
      codes: {
        purchase: 800,
        items: 801,
        dollars: 802,
        followup: 803,
        information: 804,
        content: 805
      },
      pd: 7,
      custom: {}
    },

    previous: false,

    analytics: {
      google_local: false,
      google_remote: false
    },

    cpps: {
      search: {
        source: 'url',
        init: 'No',
        patterns: [{
          regex: 'search.socialsecurity.gov',
          value: 'Yes'
        }]
      },
      faq: {
        source: 'url',
        init: 'No',
        patterns: [{
          regex: 'ssa-custhelp',
          value: 'Yes'
        },
        {
          regex: 'faq.ssa.gov',
          value: 'Yes'
        }]
      }
    },

    mode: 'first-party'
  };

  if (supports_amd) {
    define(function () {
      return FSR
    });
  }

})($$FSR);