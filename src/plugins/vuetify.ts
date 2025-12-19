import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css'

const meterTheme: ThemeDefinition = {
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'meterTheme',
    themes: {
      meterTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'elevated',
    },
  },
})