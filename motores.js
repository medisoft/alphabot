const motores = {
  pata1: {
    hombro: {
      posicion: 0.25,
      offset: 0,
      direccion: 0x40,
      canal: 15,
      keys: {
        up: 'q', down: 'a'
      }
    },
    brazo: {
      posicion: 0,
      offset: 0,
      direccion: 0x40,
      canal: 14,
      keys: {
        up: 'w', down: 's'
      }
    },
    antebrazo: {
      posicion: 1,
      offset: 0,
      direccion: 0x40,
      canal: 13,
      keys: {
        up: 'e', down: 'd'
      }
    }
  },
  pata2: {
    hombro: {
      posicion: 0.75,
      offset: 0,
      direccion: 0x40,
      canal: 12,
      keys: {
        up: 'r', down: 'f'
      }
    },
    brazo: {
      posicion: 0,
      offset: 0,
      direccion: 0x40,
      canal: 11,
      keys: {
        up: 't', down: 'g'
      }
    },
    antebrazo: {
      posicion: 1,
      offset: 0,
      direccion: 0x40,
      canal: 10,
      keys: {
        up: 'y', down: 'h'
      }
    }
  },
  pata3: {
    hombro: {
      posicion: 0.75,
      offset: 0,
      direccion: 0x40,
      canal: 9,
      keys: {
        up: 'u', down: 'j'
      }
    },
    brazo: {
      posicion: 0,
      offset: 0,
      direccion: 0x40,
      canal: 8,
      keys: {
        up: 'i', down: 'k'
      }
    },
    antebrazo: {
      posicion: 1,
      offset: 0,
      direccion: 0x40,
      canal: 7,
      keys: {
        up: 'o', down: 'l'
      }
    }
  },
  pata4: {
    hombro: {
      posicion: 0.25,
      offset: 0,
      direccion: 0x40,
      canal: 6,
      keys: {
        up: '', down: ''
      }
    },
    brazo: {
      posicion: 0,
      offset: 0,
      direccion: 0x40,
      canal: 5,
      keys: {
        up: '', down: ''
      }
    },
    antebrazo: {
      posicion: 1,
      offset: 0,
      direccion: 0x40,
      canal: 4,
      keys: {
        up: '', down: ''
      }
    }
  },
/*
  pata5: {
    hombro: {
      posicion: 0.5,
      direccion: 0x40,
      canal: 3,
      keys: {
        up: '', down: ''
      }
    },
    brazo: {
      posicion: 0.5,
      direccion: 0x40,
      canal: 2,
      keys: {
        up: '', down: ''
      }
    },
    antebrazo: {
      posicion: 0.5,
      direccion: 0x40,
      canal: 1,
      keys: {
        up: '', down: ''
      }
    }
  },
  pata6: {
    hombro: {
      posicion: 0.5,
      direccion: 0x40,
      canal: 0,
      keys: {
        up: '', down: ''
      }
    },
/!*
    brazo: {
      posicion: 0.5,
      direccion: 0x41,
      canal: 0,
      keys: {
        up: '', down: ''
      }
    },
*!/
    /!*
        antebrazo: {
          posicion: 0.5,
          direccion: 0x41,
          canal: 1,
      keys: {
        up: '', down: ''
      }
        }
    *!/
  }, // Revisar la direccion del segundo modulo PWM
*/
};

module.exports = motores;