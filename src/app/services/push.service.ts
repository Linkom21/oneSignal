import { EventEmitter, Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo de la push',
    //   body: 'Este es elcuerpo de la push',
    //   date: new Date()
    // }
  ];
  userId: string;
  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {

    this.oneSignal.startInit('b6edd870-2bc7-438f-b7bf-a088a68b4e3a', '490648339448');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received

      console.log("Notificación Resibida", noti);
      this.notificacionResibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened
      console.log("Notificación abiertas", noti);
      await this.notificacionResibida(noti.notification);
    });

    //obtener ID del suscriptor 
    this.oneSignal.getIds().then( info => {

      this.userId = info.pushToken;
    });

    this.oneSignal.endInit();
  }

  async notificacionResibida(noti: OSNotification) {
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);
    if (existePush) {
      return;
    }
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajes();
  }


  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }
  async cargarMensajes() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }
}
