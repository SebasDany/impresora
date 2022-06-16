import { Component } from '@angular/core';
import { PrintService } from '../services/print.service';

import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import {AlertController, NavController, ToastController} from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  pairedList: pairedList;
listToggle: boolean = false;
pairedDeviceId: number = 0;
dataSend = "";

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) {
    this.checkBluetoothEnable();
    }
    
    checkBluetoothEnable() {
    this.bluetoothSerial.isEnabled().then(success => {
    this.listPairedDevices();
    }, error => {
    this.showError("Por favor, activa el Bluetooth");
    })
    }
    listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
    this.pairedList = success;
    this.listToggle = true;
    }, error => {
    this.showError("Ha sucedido un error al recuperar la lista, inténtalo de nuevo");
    this.listToggle = false;
    })
    }
    selectDevice() {
    let connectedDevice = this.pairedList[this.pairedDeviceId];
    if (!connectedDevice.address) {
    this.showError("Selecciona un dispositivo al que conecterse");
    return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;
    this.connect(address);
    }
    connect(address) {
    this.bluetoothSerial.connect(address).subscribe(success => {
    this.deviceConnected();
    this.showToast("Conectado correctamente");
    }, error => {
    this.showError("No se ha podido conectar, algo ha fallado.");
    })
    }
    deviceConnected() {
    this.bluetoothSerial.subscribe("\n").subscribe(success => {
    this.handleData(success);
    this.showToast("Conectado correctamente")
    }, error => {
    this.showError(error);
    })
    }
    deviceDisconnect() {
    this.bluetoothSerial.disconnect();
    this.showToast("Se ha desconectado del dispositivo");
    }
    handleData(data) {
    //Montar aquí el sistema para tratar la entrada desde el dispositivo al que nos hemos conectado.
    this.showToast(data);
    }
    sendData(dataToSend: String) {
    this.dataSend = "\n";
    this.dataSend += dataToSend;
    this.bluetoothSerial.write(this.dataSend).then(success => {
    this.showToast(success);
    }, error => {
    this.showError(error);
    })
    }
    async showError(message) {
      const alert = await this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: 'Alert',
        subHeader: 'Subtitle',
        message: 'This is an alert message.',
        buttons: ['OK']
      });
  
      await alert.present();
  
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    }
   async showToast(message: String) {
    const toast = await this.toastCtrl.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
    }
    }
    interface pairedList {
    'class': number,
    'id': String,
    'address': String,
    'name': String
    }

