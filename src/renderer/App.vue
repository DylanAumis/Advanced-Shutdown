<template>
  <div id="app">
    <v-app ref="inspire" dark>
      <link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel="stylesheet">
      <v-toolbar flat height="30" fixed>
        <v-spacer></v-spacer>
        <v-menu>
          <v-toolbar-title slot="activator">
            <span>Actions</span>
            <v-icon dark>settings_power</v-icon>
          </v-toolbar-title>
          <v-list>
            <v-list-tile v-for="item in items" :key="item" @click="actionSet(item)">
              <v-list-tile-title v-model="actions" v-text="item"></v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>
      <v-container fluid>
        <h2 class="pt-3 pb-3 mr-5">
          <v-icon color="red">timer</v-icon> Programmez l'arrêt de votre PC</h2>
        <v-layout row>
          <v-flex xs8>
            <v-select color="" v-model="timein" label="Dans quelle unité de temps ?" :items="['Jour(s)','Heure(s)', 'Minute(s)']"></v-select>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs8>
            <v-text-field mask="###" v-model="time" label="Dans combien de temps ?"></v-text-field>
          </v-flex>
        </v-layout>
        <v-btn dark :disabled="!notValid" @click="pwdGet">
          <v-icon color="green">power_settings_new</v-icon>Éteindre Dans {{time + ' ' + timein}}
        </v-btn>
        <v-btn dark :disabled="!timeIsSet" @click="Undo">
          <v-icon color="red">undo</v-icon>Annuler L'arrêt</v-btn>
        <v-alert :value="alert" type="success" transition="slide-x-transition" class="mt-3" outline>
           Votre PC s'éteindra dans {{time + ' ' + timein}}
        </v-alert>
        <v-alert :value="infor" v-model="infor" dismissible type="info" transition="slide-x-transition" class="mt-3" dark outline>
           Fermeture Annulée
        </v-alert>
        <hr>
        <v-layout>
          <v-flex xs6>
            <h2 class="mt-4">
            <v-icon color="blue">save_alt</v-icon> Mode Download (Bêta)</h2>
          </v-flex>
          <v-flex xs6>
            <v-switch @click="openDialog()" class="mt-4 ml-4" color="blue lighten-1" v-model="dlMode">
            </v-switch>
          </v-flex>
        </v-layout>
        <div v-if="dlMode">
            <v-carousel dark interval="13000" hide-delimiters>
             <v-carousel-item
              v-for="(img,v) in imgs"
              :key="v"
              :src="img.src">
              <div class="title">
                {{ img.title }}
              </div>
            </v-carousel-item>
           </v-carousel>
          <div>
            <br>
            <v-btn color="green" :disabled="!dlCanStart" @click="watchdir">
              Prêt <v-icon right>check_circle_outline</v-icon></v-btn>
            <v-spacer></v-spacer>
            <div v-if="!dlStart">
              <v-progress-circular indeterminate :size="40" color="primary"></v-progress-circular>
              <p>En attente de fichier dans le dossier: C:\Telechargements...</p>
            </div>
             <div transition="slide-x-transition" v-if="dlHasStarted">
               <br>
               <p>Fichier en cours de téléchargement...
                <br>
                {{ (fileSize/1000000).toFixed(2) + " Mo Téléchargés"}}
              </p>
              <v-progress-linear  v-model="fileSize" :size="20" color="green"></v-progress-linear>
            </div>
          </div>
          <div v-if="dlEnd">
            <v-alert :value="dlEnd" type="success" transition="slide-x-transition" class="mt-3" dark outline>
              Fichier Téléchargé. Arrêt du PC dans 5 minutes.
              <v-btn flatt color="red" @click="undoDl">Annuler</v-btn>
            </v-alert>
          </div>
        </div>
        <div class="text-xs-center">
    <v-dialog
      v-model="dialog"
      width="500"
      persistent
    >
    <v-card>
        <v-card-title
          dark
          primary-title
          class="headline ml-4 mt-2"
        >
          Attention
          <v-icon class="ml-4" color="red">warning</v-icon>      
        </v-card-title>
        <v-card-text>
          Le Mode Download nécessite certaines manipulations venant de l'utilisateur. <br> De plus, il peut présenter des bugs car il est en Bêta. <br> Ne l'utilisez seulement si vous savez ce que vous faîtes ! <br><br> Je ne saurais être tenu responsable en cas d'incident lié à une mauvaise utilisation de ce module. <br> <br> Seul le navigateur <v-icon color="green">public</v-icon> <span class="chrome">Google Chrome </span> supporte ce module pour le moment
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            flat
            @click="dialog = false, dlMode = false"
          >
            J'abandonne
          </v-btn>
          <v-btn
            color="red"
            flat
            @click="dialog = false">
            J'ai compris
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
    <v-footer>
      <div class="text-xs-center">
          <a class="ml-3" @click="gitlab">Dylan Aumis</a> &copy; {{ new Date().getFullYear() }}</div>
          <v-spacer></v-spacer>
          <span class="mr-3">v1.8</span>
          <span class="ml-3">{{'Build : ' + isWin}}</span>
          <v-tooltip top>
          <v-btn
            slot="activator"
            color="error"
            dark
            flat
            icon
            @click="mail"
           >
           <v-icon>bug_report</v-icon>
            </v-btn>
             <span>Signaler un bug</span>
          </v-tooltip>    
        </v-footer>
      </v-container>
    </v-app>
  </div>
</template>
 
 
<script>
import { stat } from 'fs'
var os = require('os').platform()
var arch = require('os').arch()
var cmd = require('node-cmd')
var shell = require('electron').shell
var chokidar = require('chokidar')
var watcher = chokidar.watch('C:/Telechargements', {
  ignored: /(^|[\/\\])\../ ,
  persistent: false,
  usePolling: false,
  awaitWriteFinish: {
    stabilityThreshold: 6000,
    pollInterval: 100
  }
})
var watcherTwo = chokidar.watch('C:/Telechargements', {
  ignored: /(^|[\/\\])\../ ,
  persistent: false,
  usePolling: false
})
var watcherThree = chokidar.watch('C:/Telechargements', {
  ignored: /(^|[\/\\])\../ ,
  persistent: false,
  usePolling: false
})

export default {
  data () {
    return {
      ping: null,
      dialog: false,
      timein: '',
      time: '',
      isWin: os + ' ' + arch,
      fileSize: null,
      timeIsSet: false,
      alert: false,
      infor: false,
      dlMode: false,
      dlInfo: false,
      dlStart: true,
      dlEnd: false,
      dlHasStarted: false,
      actions: '',
      e1: 0,
      items: ['Éteindre', 'Redémarrer', 'Hiberner'],
      imgs: [
          {
            title:'Le Mode Download vous permet d\'éteindre le PC une fois un téléchargement terminé. Il est recommandé d\'utiliser ce mode si vous devez télécharger un fichier et vous absenter longtemps par exemple'
          },
          {
            src: 'data:image/png;base64,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', title:'Étape 1 - Créez un dossier "Telechargements" (sans accents) à la racine de votre disque C:'
          },
          {
            src: 'data:image/png;base64,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', title:'Étape 2 - Accédez aux paramètres de Chrome'
          },
          {
            src: 'data:image/png;base64,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', title:'Étape 3 - Déroulez les paramètres avancés'
          },
          {
            src: 'data:image/png;base64,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', title :'Étape 4 - Paramétrez l\'emplacement d\'arrivée des fichiers sur C:\\Telechargements'
          },
          {
            src: 'data:image/png;base64,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', title:'Étape 5 - Désactivez cette fonction, cliquez sur prêt!'
          },
          {
            title:'Vous pouvez maintenant télécharger votre fichier et vous absenter. N\'oubliez pas de sauvegarder vos travaux ! Le PC s\'éteindra 5 minutes après la fin du téléchargement'
          }
        ]
   }
  },
  methods: {
    openDialog() {
      if (this.dialog === false && this.dlMode === false) {
        this.dialog = true
      } 
    },
    pwdGet () {
      if (this.timein === 'Jour(s)') {
        var timeJ = this.time * 86400
        cmd.run('shutdown -s -t ' + timeJ)
        this.timeIsSet = true
      }
      if (this.timein === 'Heure(s)') {
        var timeH = this.time * 3600
        cmd.run('shutdown -s -t ' + timeH)
        this.timeIsSet = true
      }
      if (this.timein === 'Minute(s)') {
        var timeM = this.time * 60
        cmd.run('shutdown -s -t ' + timeM)
        this.timeIsSet = true
      }
      this.alert = true
      this.infor = false
    },
    Undo () {
      if (this.timeIsSet) {
        cmd.run('shutdown -a')
        this.timeIsSet = false
        this.infor = true
        this.alert = false
      }
    },
    actionSet (item) {
      if (item === 'Eteindre') {
        cmd.run('shutdown -s -t 00')
      }
      if (item === 'Redémarrer') {
        cmd.run('shutdown -r -t 00')
      }
      if (item === 'Hiberner') {
        cmd.run('shutdown -h')
      }
    },
    undoDl () {
      cmd.run('shutdown -a')
      this.dlEnd = false
    },
    gitlab () {
      shell.openExternal('https://gitlab.com/DylanAumis')
    },
    mail () {
     shell.openExternal("https://linkedin.com/in/dylan-aumis")
    },
     watchdir () {
      this.dlStart = false
      this.dlInfo = true
      watcherTwo.on('change', (path, stats) => {
       if (stats){
        this.dlHasStarted = true
        this.dlStart = true
        this.fileSize = stats.size
       }})
      watcher.on('add', (path, stats) => {
        if (stats) {
          this.dlEnd = true
          this.dlStart = true
          this.dlHasStarted = false
          cmd.run('shutdown -s -t 300')
          this.dlInfo = false
          watcher.close()
          watcher = null
          watcher = chokidar.watch('C:/Telechargements', {
            ignored: /(^|[\/\\])\../,
            persistent: false,
            usePolling: false,
            awaitWriteFinish: {
              stabilityThreshold: 6000,
              pollInterval: 100
            }
          })
        }
      })
    }
  },
  computed: {
    notValid () {
      return this.timein !== '' && this.time !== '' && this.timeIsSet !== true
    },
    dlCanStart () {
      return this.dir !== '' && this.dlInfo !== true
    }
  }
}
</script>
<style>
::-webkit-scrollbar {
  display: none;
}

.chrome{
  color: rgb(128, 192, 26)
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: rgb(114, 114, 114);
  color: white;
  text-align: center;
  font: 1.2em 'Roboto', sans-serif;
}
.progress-circular {
  margin: 1rem;
}

.step{
  color: rgb(0, 162, 255);
  width: 80px;
  margin-bottom: 20px
  
}
.down{
  margin-top: 20px;
  margin-left: -7px;
}

div {
  text-align: center;
}
hr {
  margin-top: 30px;
}
.carousel {
  height: 175px !important; 
}

.title{
  position: absolute;
  background-color: rgba(0,0,0,0.9);
  color: white;
  font-size: 2em;
  padding: 10px;
}
</style>
